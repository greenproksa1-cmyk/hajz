'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  MousePointer2,
  Square,
  Trash2,
  Save,
  Trash,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  Map,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export interface BoothShape {
  id: string
  label: string
  area: number
  status: string
  boothType: 'standard' | 'vip' | 'sponsor'
  price: number
  x: number
  y: number
  width: number
  height: number
}

interface FloorPlanEditorProps {
  planId?: string
  planName?: string
  initialBooths?: BoothShape[]
  initialWidth?: number
  initialHeight?: number
  onSave?: (booths: BoothShape[], name: string, width: number, height: number) => Promise<boolean>
  onCancel?: () => void
}

const BOOTH_TYPE_COLORS: Record<string, string> = {
  standard: '#10b981', // emerald
  vip: '#f59e0b',      // amber
  sponsor: '#64748b',  // slate
}

const BOOTH_TYPE_FILL: Record<string, string> = {
  standard: 'rgba(16, 185, 129, 0.12)',
  vip: 'rgba(245, 158, 11, 0.12)',
  sponsor: 'rgba(100, 116, 139, 0.12)',
}

const PRICE_PER_SQM = 1700
const GRID_SIZE = 20

let labelCounter = 0
function getNextLabel(booths: BoothShape[]): string {
  const usedLabels = new Set(booths.map((b) => b.label))
  const rows = 'ABCDEFGHIJ'
  for (const row of rows) {
    for (let col = 1; col <= 20; col++) {
      const label = `${row}${col}`
      if (!usedLabels.has(label)) return label
    }
  }
  labelCounter++
  return `X${labelCounter}`
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function FloorPlanEditor({
  planId,
  planName: initialPlanName = '',
  initialBooths = [],
  initialWidth = 1200,
  initialHeight = 800,
  onSave,
  onCancel,
}: FloorPlanEditorProps) {
  const { t, isRTL } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [booths, setBooths] = useState<BoothShape[]>(Array.isArray(initialBooths) ? initialBooths : [])
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null)
  const [mode, setMode] = useState<'draw' | 'select'>('select')
  const [zoom, setZoom] = useState(1)
  const [planName, setPlanName] = useState(initialPlanName || '')
  const [planWidth, setPlanWidth] = useState(initialWidth)
  const [planHeight, setPlanHeight] = useState(initialHeight)
  const [isSaving, setIsSaving] = useState(false)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null)

  // Drag/resize state (Refs for performance to avoid state-triggering re-renders on move)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragPosRef = useRef<{ x: number; y: number } | null>(null)
  const resizeRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)

  const selectedBooth = booths.find((b) => b.id === selectedBoothId) || null

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      }
    },
    [zoom]
  )

  const getBoothAtPoint = useCallback(
    (px: number, py: number): BoothShape | null => {
      for (let i = booths.length - 1; i >= 0; i--) {
        const b = booths[i]
        if (px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height) {
          return b
        }
      }
      return null
    },
    [booths]
  )

  const getResizeHandle = useCallback(
    (px: number, py: number, booth: BoothShape): string | null => {
      const handleSize = 8 / zoom
      const corners = [
        { name: 'nw', cx: booth.x, cy: booth.y },
        { name: 'ne', cx: booth.x + booth.width, cy: booth.y },
        { name: 'sw', cx: booth.x, cy: booth.y + booth.height },
        { name: 'se', cx: booth.x + booth.width, cy: booth.y + booth.height },
        { name: 'n', cx: booth.x + booth.width / 2, cy: booth.y },
        { name: 's', cx: booth.x + booth.width / 2, cy: booth.y + booth.height },
        { name: 'w', cx: booth.x, cy: booth.y + booth.height / 2 },
        { name: 'e', cx: booth.x + booth.width, cy: booth.y + booth.height / 2 },
      ]
      for (const corner of corners) {
        if (Math.abs(px - corner.cx) <= handleSize && Math.abs(py - corner.cy) <= handleSize) {
          return corner.name
        }
      }
      return null
    },
    [zoom]
  )

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width / zoom
    const h = canvas.height / zoom

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(zoom, zoom)

    // Workspace Background (Everything outside the plan)
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(0, 0, w, h)

    // Plan Frame (Active Area)
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 20 / zoom
    ctx.fillRect(0, 0, planWidth, planHeight)
    ctx.shadowBlur = 0 // Reset shadow

    // Plan Frame Border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2 / zoom
    ctx.strokeRect(0, 0, planWidth, planHeight)

    // Subtle Grid
    ctx.strokeStyle = '#f1f5f9'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= Math.max(w, planWidth); x += GRID_SIZE) {
      if (x > planWidth && x > w) continue
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, Math.max(h, planHeight))
      ctx.stroke()
    }
    for (let y = 0; y <= Math.max(h, planHeight); y += GRID_SIZE) {
      if (y > planHeight && y > h) continue
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(Math.max(w, planWidth), y)
      ctx.stroke()
    }

    // Major grid (every 5) - only inside or near the plan
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    for (let x = 0; x <= Math.max(w, planWidth); x += GRID_SIZE * 5) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, Math.max(h, planHeight))
      ctx.stroke()
    }
    for (let y = 0; y <= Math.max(h, planHeight); y += GRID_SIZE * 5) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(Math.max(w, planWidth), y)
      ctx.stroke()
    }

    // Boundary Labels
    ctx.fillStyle = '#3b82f6'
    ctx.font = `bold ${10}px sans-serif`
    ctx.textAlign = isRTL ? 'right' : 'left'
    ctx.fillText(isRTL ? 'حدود المخطط النشطة' : 'ACTIVE PLAN BOUNDARY', 5, -10)
    ctx.fillText(`${Math.round(planWidth)} x ${Math.round(planHeight)}`, 5, -25)

    // Ruler - top
    ctx.fillStyle = '#94a3b8'
    ctx.font = `bold 10px sans-serif`
    ctx.textAlign = 'center'
    for (let x = 0; x <= Math.max(w, planWidth); x += GRID_SIZE * 5) {
      if (x > 0) ctx.fillText(`${x}`, x, 15)
    }

    // Ruler - left
    ctx.textAlign = isRTL ? 'start' : 'end'
    for (let y = GRID_SIZE * 5; y <= Math.max(h, planHeight); y += GRID_SIZE * 5) {
      ctx.fillText(`${y}`, isRTL ? 10 : w - 10, y + 3)
    }

    // Draw booths
    for (const booth of booths) {
      let bx = booth.x
      let by = booth.y
      let bw = booth.width
      let bh = booth.height

      // Override with active drag/resize coordinates
      if (isDragging && booth.id === selectedBoothId && dragPosRef.current) {
        bx = dragPosRef.current.x
        by = dragPosRef.current.y
      } else if (isResizing && booth.id === selectedBoothId && resizeRef.current) {
        bx = resizeRef.current.x
        by = resizeRef.current.y
        bw = resizeRef.current.width
        bh = resizeRef.current.height
      }

      const color = BOOTH_TYPE_COLORS[booth.boothType] || BOOTH_TYPE_COLORS.standard
      const fill = BOOTH_TYPE_FILL[booth.boothType] || BOOTH_TYPE_FILL.standard

      // Fill
      ctx.fillStyle = fill
      ctx.fillRect(bx, by, bw, bh)

      // Border
      ctx.strokeStyle = color
      ctx.lineWidth = booth.id === selectedBoothId ? 2.5 : 1.5
      ctx.strokeRect(bx, by, bw, bh)

      // Label
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        booth.label,
        bx + bw / 2,
        by + bh / 2 - 8
      )

      // Area
      const areaVal = (isResizing && booth.id === selectedBoothId && resizeRef.current) 
        ? Math.round((bw * bh) / 100) / 100 
        : booth.area

      ctx.fillStyle = '#64748b'
      ctx.font = '10px sans-serif'
      ctx.fillText(
        `${areaVal} ${isRTL ? 'م²' : 'm²'}`,
        bx + bw / 2,
        by + bh / 2 + 8
      )

      // Selection handles
      if (booth.id === selectedBoothId) {
        const handles = [
          { cx: bx, cy: by },
          { cx: bx + bw, cy: by },
          { cx: bx, cy: by + bh },
          { cx: bx + bw, cy: by + bh },
          { cx: bx + bw / 2, cy: by },
          { cx: bx + bw / 2, cy: by + bh },
          { cx: bx, cy: by + bh / 2 },
          { cx: bx + bw, cy: by + bh / 2 },
        ]
        for (const h of handles) {
          ctx.fillStyle = '#ffffff'
          ctx.strokeStyle = color
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(h.cx, h.cy, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
      }
    }

    // Drawing preview
    if (isDrawing && drawStart && drawCurrent) {
      const x = Math.min(drawStart.x, drawCurrent.x)
      const y = Math.min(drawStart.y, drawCurrent.y)
      const w2 = Math.abs(drawCurrent.x - drawStart.x)
      const h2 = Math.abs(drawCurrent.y - drawStart.y)
      ctx.fillStyle = 'rgba(249, 115, 22, 0.1)'
      ctx.fillRect(x, y, w2, h2)
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.strokeRect(x, y, w2, h2)
      ctx.setLineDash([])

      // Preview dimensions
      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        `${Math.round(w2)} × ${Math.round(h2)}`,
        x + w2 / 2,
        y + h2 / 2
      )
    }

    ctx.restore()
  }, [booths, selectedBoothId, zoom, isDrawing, drawStart, drawCurrent, isRTL])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width
        canvas.height = height
        drawCanvas()
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [drawCanvas])

  // Redraw on state changes
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = screenToCanvas(e.clientX, e.clientY)

      if (mode === 'draw') {
        setIsDrawing(true)
        setDrawStart(pos)
        setDrawCurrent(pos)
        return
      }

      // Select mode
      // Check resize handles first
      if (selectedBoothId) {
        const booth = booths.find((b) => b.id === selectedBoothId)
        if (booth) {
          const handle = getResizeHandle(pos.x, pos.y, booth)
          if (handle) {
            setIsResizing(true)
            setResizeHandle(handle)
            return
          }
        }
      }

      // Check booth click
      const clickedBooth = getBoothAtPoint(pos.x, pos.y)
      if (clickedBooth) {
        setSelectedBoothId(clickedBooth.id)
        setIsDragging(true)
        dragOffsetRef.current = {
          x: pos.x - clickedBooth.x,
          y: pos.y - clickedBooth.y,
        }
        dragPosRef.current = { x: clickedBooth.x, y: clickedBooth.y }
      } else {
        setSelectedBoothId(null)
      }
    },
    [mode, selectedBoothId, booths, screenToCanvas, getBoothAtPoint, getResizeHandle]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = screenToCanvas(e.clientX, e.clientY)

      if (isDrawing && drawStart) {
        setDrawCurrent(pos)
        return
      }

      if (isDragging && selectedBoothId) {
        dragPosRef.current = { x: pos.x - dragOffsetRef.current.x, y: pos.y - dragOffsetRef.current.y }
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(drawCanvas)
        return
      }

      if (isResizing && selectedBoothId && resizeHandle) {
        const booth = booths.find(b => b.id === selectedBoothId)
        if (!booth) return
        
        let { x, y, width, height } = booth
        const minSize = 20

        if (resizeHandle.includes('w')) {
          const newX = Math.min(pos.x, booth.x + booth.width - minSize)
          width = booth.x + booth.width - newX
          x = newX
        }
        if (resizeHandle.includes('e')) {
          width = Math.max(minSize, pos.x - booth.x)
        }
        if (resizeHandle.includes('n')) {
          const newY = Math.min(pos.y, booth.y + booth.height - minSize)
          height = booth.y + booth.height - newY
          y = newY
        }
        if (resizeHandle.includes('s')) {
          height = Math.max(minSize, pos.y - booth.y)
        }

        resizeRef.current = { x, y, width, height }
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(drawCanvas)
        return
      }

      // Cursor
      const canvas = canvasRef.current
      if (!canvas) return
      if (mode === 'draw') {
        canvas.style.cursor = 'crosshair'
        return
      }
      if (selectedBoothId) {
        const booth = booths.find((b) => b.id === selectedBoothId)
        if (booth) {
          const handle = getResizeHandle(pos.x, pos.y, booth)
          if (handle) {
            const cursorMap: Record<string, string> = {
              nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
              n: 'n-resize', s: 's-resize', w: 'w-resize', e: 'e-resize',
            }
            canvas.style.cursor = cursorMap[handle] || 'default'
            return
          }
        }
      }
      const overBooth = getBoothAtPoint(pos.x, pos.y)
      canvas.style.cursor = overBooth ? 'move' : 'default'
    },
    [isDrawing, drawStart, isDragging, isResizing, selectedBoothId, resizeHandle, mode, booths, screenToCanvas, getBoothAtPoint, getResizeHandle]
  )

  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawStart && drawCurrent) {
      const x = Math.min(drawStart.x, drawCurrent.x)
      const y = Math.min(drawStart.y, drawCurrent.y)
      const width = Math.abs(drawCurrent.x - drawStart.x)
      const height = Math.abs(drawCurrent.y - drawStart.y)

      if (width > 15 && height > 15) {
        const area = Math.round((width * height) / 100) / 100
        const newBooth: BoothShape = {
          id: generateId(),
          label: getNextLabel(booths),
          area,
          status: 'available',
          boothType: 'standard',
          price: Math.round(area * PRICE_PER_SQM),
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        }
        setBooths((prev) => [...prev, newBooth])
        setSelectedBoothId(newBooth.id)
        setMode('select')
      }

      setIsDrawing(false)
      setDrawStart(null)
      setDrawCurrent(null)
    }

    if (isDragging && selectedBoothId && dragPosRef.current) {
      setBooths((prev) =>
        prev.map((b) =>
          b.id === selectedBoothId
            ? { ...b, x: dragPosRef.current!.x, y: dragPosRef.current!.y }
            : b
        )
      )
    }

    if (isResizing && selectedBoothId && resizeRef.current) {
      setBooths((prev) =>
        prev.map((b) => {
          if (b.id !== selectedBoothId) return b
          const { x, y, width, height } = resizeRef.current!
          const area = Math.round((width * height) / 100) / 100
          return { ...b, x, y, width, height, area }
        })
      )
    }

    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
    dragPosRef.current = null
    resizeRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [isDrawing, drawStart, drawCurrent, booths, isDragging, isResizing, selectedBoothId, drawCanvas])

  const handleDeleteSelected = () => {
    if (!selectedBoothId) return
    setBooths((prev) => prev.filter((b) => b.id !== selectedBoothId))
    setSelectedBoothId(null)
  }

  const handleClearAll = () => {
    setBooths([])
    setSelectedBoothId(null)
  }

  const handleUpdateBooth = (id: string, updates: Partial<BoothShape>) => {
    setBooths((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const updated = { ...b, ...updates }
        if (updates.price !== undefined && updates.area === undefined) {
          // Price changed manually
        } else if (updates.area !== undefined) {
          updated.price = Math.round(updated.area * PRICE_PER_SQM)
        }
        return updated
      })
    )
  }

  const handleSave = async () => {
    if (!planName.trim()) {
      toast.error(isRTL ? 'يرجى إدخال اسم المخطط' : 'Please enter a plan name')
      return
    }
    setIsSaving(true)
    try {
      if (onSave) {
        const success = await onSave(booths, planName, planWidth, planHeight)
        if (success) {
          toast.success(t('common.success'))
        }
      } else {
        // Standalone mode: always POST to create a new floor plan
        const res = await fetch('/api/floor-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: planName,
            width: planWidth,
            height: planHeight,
            booths: booths.map((b) => ({
              ...b,
              price: Math.round(b.area * PRICE_PER_SQM),
            })),
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(t('common.success'))
        } else {
          toast.error(data.error || t('common.error'))
        }
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName === 'INPUT') return
        handleDeleteSelected()
      }
      if (e.key === 'Escape') {
        setSelectedBoothId(null)
      }
    },
    [selectedBoothId, handleDeleteSelected]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex h-full w-full min-h-0 flex-col lg:flex-row">
      {/* Canvas Area */}
      <div className="flex min-w-0 min-h-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b bg-white px-6 py-3 shadow-sm relative z-20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div className="relative">
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={isRTL ? 'اسم المخطط' : 'Plan Name'}
                className="h-10 w-64 border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl font-bold"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <Button
              variant={mode === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('select')}
              className={`h-8 gap-1.5 rounded-lg px-4 ${mode === 'select' ? 'bg-white text-blue-600 shadow-sm hover:bg-white hover:text-blue-700' : 'text-slate-600 hover:bg-white/50'}`}
            >
              <MousePointer2 className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{t('admin.editor.selectMode')}</span>
            </Button>
            <Button
              variant={mode === 'draw' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('draw')}
              className={`h-8 gap-1.5 rounded-lg px-4 ${mode === 'draw' ? 'bg-white text-blue-600 shadow-sm hover:bg-white hover:text-blue-700' : 'text-slate-600 hover:bg-white/50'}`}
            >
              <Square className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{t('admin.editor.addBooth')}</span>
            </Button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
              >
                <ZoomIn className="h-4 w-4 text-slate-600" />
              </Button>
              <div className="px-2 min-w-[50px] text-center">
                <span className="text-[10px] font-black text-slate-500 tabular-nums">{Math.round(zoom * 100)}%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                onClick={() => setZoom((z) => Math.max(z - 0.1, 0.3))}
              >
                <ZoomOut className="h-4 w-4 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                onClick={() => setZoom(1)}
              >
                <RotateCcw className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>

          <div className="ms-auto flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 border-red-100 text-red-600 hover:bg-red-50 rounded-xl px-4 transition-all"
                onClick={handleDeleteSelected}
                disabled={!selectedBoothId}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden xl:inline text-xs font-bold">{t('admin.editor.deleteBooth')}</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 gap-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 transition-all"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="hidden xl:inline text-xs font-bold">{t('admin.editor.clearAll')}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-red-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black text-slate-900">
                      {isRTL ? 'تأكيد المسح الشامل' : 'Factory Reset Plan'}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500">
                      {isRTL
                        ? 'هل أنت متأكد من حذف جميع الأجنحة والبدء من جديد؟ هذا الإجراء لا يمكن التراجع عنه.'
                        : 'Are you sure you want to remove ALL booths? This will completely reset your current floor plan.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-xl">{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 rounded-xl px-8">
                      {t('common.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Button
              size="sm"
              className="h-10 gap-2 bg-slate-900 hover:bg-blue-600 text-white shadow-xl shadow-slate-200 transition-all rounded-xl px-6 group"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-black uppercase tracking-wider">{t('admin.editor.saveLayout')}</span>
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="min-h-[300px] flex-1 overflow-hidden bg-white relative">
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-full shrink-0 border-s bg-slate-50/50 p-6 lg:w-[320px] lg:border-t-0 overflow-y-auto max-h-screen">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            {isRTL ? 'خصائص الجناح' : 'Booth Inspector'}
          </h3>
        </div>

        {selectedBooth ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* ID & Label Section */}
            <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isRTL ? 'رقم الجناح' : 'Booth Identity'}</span>
                  <span className="text-[10px] font-mono text-slate-300">ID: {selectedBooth.id}</span>
               </div>
               <div>
                <Label className="mb-1.5 block text-[11px] font-bold text-slate-700">{t('admin.editor.label')}</Label>
                <Input
                  value={selectedBooth.label}
                  onChange={(e) =>
                    handleUpdateBooth(selectedBooth.id, { label: e.target.value })
                  }
                  className="h-10 text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 rounded-xl bg-slate-50/30"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            {/* Geometry Section */}
            <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{isRTL ? 'المساحة والابعاد' : 'Dimensions & Scale'}</span>
               <div>
                <Label className="mb-1.5 block text-[11px] font-bold text-slate-700">{t('admin.editor.area')} (m²)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={selectedBooth.area}
                    onChange={(e) =>
                      handleUpdateBooth(selectedBooth.id, { area: parseFloat(e.target.value) || 0 })
                    }
                    className="h-10 text-sm border-slate-200 focus:border-blue-500 rounded-xl bg-slate-50/30 font-mono"
                    dir="ltr"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">M²</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">{isRTL ? 'العرض' : 'Width'}</span>
                  <span className="text-sm font-mono font-bold text-slate-700">{Math.round(selectedBooth.width)}px</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">{isRTL ? 'الارتفاع' : 'Height'}</span>
                  <span className="text-sm font-mono font-bold text-slate-700">{Math.round(selectedBooth.height)}px</span>
                </div>
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{isRTL ? 'نوع الجناح' : 'Classification'}</span>
               <div>
                <Label className="mb-1.5 block text-[11px] font-bold text-slate-700">{t('admin.editor.type')}</Label>
                <Select
                  value={selectedBooth.boothType}
                  onValueChange={(v) =>
                    handleUpdateBooth(selectedBooth.id, {
                      boothType: v as 'standard' | 'vip' | 'sponsor',
                    })
                  }
                >
                  <SelectTrigger className="h-10 w-full text-sm border-slate-200 rounded-xl bg-slate-50/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="standard">{t('admin.editor.standard')}</SelectItem>
                    <SelectItem value="vip">{t('admin.editor.vip')}</SelectItem>
                    <SelectItem value="sponsor">{t('admin.editor.sponsor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div
                  className="h-4 w-4 rounded-md shadow-sm"
                  style={{
                    backgroundColor: BOOTH_TYPE_COLORS[selectedBooth.boothType],
                  }}
                />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedBooth.boothType}</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{isRTL ? 'التسعير' : 'Financials'}</span>
               <div>
                <Label className="mb-1.5 block text-[11px] font-bold text-slate-700">
                  {t('admin.editor.price')} ({t('common.sar')})
                </Label>
                <Input
                  type="number"
                  value={selectedBooth.price}
                  onChange={(e) =>
                    handleUpdateBooth(selectedBooth.id, {
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-10 text-sm border-slate-200 focus:border-blue-500 rounded-xl bg-slate-50/30 font-bold tabular-nums"
                  dir="ltr"
                />
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  {isRTL ? 'السعر الافتراضي' : 'Market Price'}: <span className="text-slate-600 font-bold">{PRICE_PER_SQM} {t('common.sar')}/m²</span>
                </div>
              </div>
            </div>

             <Button
                variant="outline"
                size="sm"
                className="w-full h-11 gap-2 border-red-100 text-red-600 hover:bg-red-50 rounded-xl px-4 transition-all"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-bold">{isRTL ? 'حذف هذا الجناح' : 'Delete this Booth'}</span>
              </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in duration-700">
            <div className="h-16 w-16 bg-white rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-center mb-6">
               <MousePointer2 className="h-8 w-8 text-blue-200" />
            </div>
            <h4 className="text-slate-900 font-bold mb-2">
               {isRTL ? 'لم يتم الاختيار' : 'No Selection'}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[180px]">
              {mode === 'draw'
                ? isRTL
                  ? 'انقر واسحب على اللوحة لرسم جناح جديد'
                  : 'Click and drag on the canvas to draw a new booth'
                : isRTL
                  ? 'اختر جناحاً من المخطط لتعديل خصائصه هنا'
                  : 'Select a booth from the map to refine its properties here'}
            </p>
          </div>
        )}

        {/* Global Stats */}
        <div className="mt-10 pt-10 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {isRTL ? 'إحصائيات المخطط' : 'Project Summary'}
            </h3>
          </div>

          <div className="grid gap-3">
             <div className="rounded-2.5xl bg-slate-900 p-5 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                   <Save className="h-12 w-12" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRTL ? 'إجمالي الإيرادات' : 'Est. Revenue'}</p>
                <div className="flex items-baseline gap-1.5">
                   <h2 className="text-2xl font-black tabular-nums">
                      {booths.reduce((s, b) => s + b.price, 0).toLocaleString()}
                   </h2>
                   <span className="text-[10px] font-bold text-slate-400">{t('common.sar')}</span>
                </div>

                <div className="mt-6 flex gap-4 border-t border-white/10 pt-4">
                   <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{isRTL ? 'الأجنحة' : 'Booths'}</p>
                      <p className="text-sm font-black">{booths.length}</p>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{isRTL ? 'المساحة' : 'Total Area'}</p>
                      <p className="text-sm font-black">{booths.reduce((s, b) => s + b.area, 0).toFixed(1)} <span className="text-[9px]">m²</span></p>
                   </div>
                </div>
             </div>

             {/* Type breakdown pills */}
             <div className="flex flex-wrap gap-2 mt-2">
                {(['standard', 'vip', 'sponsor'] as const).map((type) => {
                  const count = booths.filter((b) => b.boothType === type).length
                  if (count === 0) return null
                  return (
                    <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm transition-all hover:border-blue-200">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: BOOTH_TYPE_COLORS[type] }}
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{type}</span>
                      <span className="text-[10px] font-black text-slate-900">{count}</span>
                    </div>
                  )
                })}
             </div>
          </div>
        </div>

        {/* Canvas Configuration */}
        <div className="mt-10 pt-10 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {isRTL ? 'إعدادات اللوحة' : 'Canvas Workspace'}
            </h3>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <Label className="mb-1.5 block text-[11px] font-bold text-slate-700">{isRTL ? 'العرض' : 'Plan Width'}</Label>
                   <Input 
                      type="number"
                      value={planWidth}
                      onChange={(e) => setPlanWidth(parseInt(e.target.value) || 0)}
                      className="h-10 text-sm border-slate-200 focus:border-blue-500 rounded-xl bg-slate-50/30 font-mono"
                   />
                </div>
                <div>
                   <Label className="mb-1.5 block text-[11px] font-bold text-slate-700">{isRTL ? 'الارتفاع' : 'Plan Height'}</Label>
                   <Input 
                      type="number"
                      value={planHeight}
                      onChange={(e) => setPlanHeight(parseInt(e.target.value) || 0)}
                      className="h-10 text-sm border-slate-200 focus:border-blue-500 rounded-xl bg-slate-50/30 font-mono"
                   />
                </div>
             </div>
             <p className="text-[10px] text-slate-400 italic">
                {isRTL ? '* هذه الأبعاد ستحدد منطقة العرض النهائية للعملاء.' : '* These dimensions define the final view area for customers.'}
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
