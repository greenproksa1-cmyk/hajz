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
  onSave?: (booths: BoothShape[], name: string) => Promise<boolean>
  onCancel?: () => void
}

const BOOTH_TYPE_COLORS: Record<string, string> = {
  standard: '#3b82f6', // blue
  vip: '#d97706',      // gold/amber
  sponsor: '#7c3aed',  // purple
}

const BOOTH_TYPE_FILL: Record<string, string> = {
  standard: 'rgba(59, 130, 246, 0.15)',
  vip: 'rgba(217, 119, 6, 0.15)',
  sponsor: 'rgba(124, 58, 237, 0.15)',
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
  onSave,
  onCancel,
}: FloorPlanEditorProps) {
  const { t, isRTL } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [booths, setBooths] = useState<BoothShape[]>(initialBooths)
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null)
  const [mode, setMode] = useState<'draw' | 'select'>('select')
  const [zoom, setZoom] = useState(1)
  const [planName, setPlanName] = useState(initialPlanName)
  const [isSaving, setIsSaving] = useState(false)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null)

  // Drag/resize state
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)

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

    // Background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= w; x += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Major grid (every 5)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    for (let x = 0; x <= w; x += GRID_SIZE * 5) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += GRID_SIZE * 5) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Ruler - top
    ctx.fillStyle = '#64748b'
    ctx.font = `${9}px sans-serif`
    ctx.textAlign = 'center'
    for (let x = 0; x <= w; x += GRID_SIZE * 5) {
      ctx.fillText(`${x}`, x, 12)
    }

    // Ruler - left
    ctx.textAlign = isRTL ? 'start' : 'end'
    for (let y = GRID_SIZE * 5; y <= h; y += GRID_SIZE * 5) {
      ctx.fillText(`${y}`, isRTL ? 4 : w - 4, y + 3)
    }

    // Draw booths
    for (const booth of booths) {
      const color = BOOTH_TYPE_COLORS[booth.boothType] || BOOTH_TYPE_COLORS.standard
      const fill = BOOTH_TYPE_FILL[booth.boothType] || BOOTH_TYPE_FILL.standard

      // Fill
      ctx.fillStyle = fill
      ctx.fillRect(booth.x, booth.y, booth.width, booth.height)

      // Border
      ctx.strokeStyle = color
      ctx.lineWidth = booth.id === selectedBoothId ? 2.5 : 1.5
      ctx.strokeRect(booth.x, booth.y, booth.width, booth.height)

      // Label
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        booth.label,
        booth.x + booth.width / 2,
        booth.y + booth.height / 2 - 8
      )

      // Area
      ctx.fillStyle = '#64748b'
      ctx.font = '10px sans-serif'
      ctx.fillText(
        `${booth.area} ${isRTL ? 'م²' : 'm²'}`,
        booth.x + booth.width / 2,
        booth.y + booth.height / 2 + 8
      )

      // Selection handles
      if (booth.id === selectedBoothId) {
        const handles = [
          { cx: booth.x, cy: booth.y },
          { cx: booth.x + booth.width, cy: booth.y },
          { cx: booth.x, cy: booth.y + booth.height },
          { cx: booth.x + booth.width, cy: booth.y + booth.height },
          { cx: booth.x + booth.width / 2, cy: booth.y },
          { cx: booth.x + booth.width / 2, cy: booth.y + booth.height },
          { cx: booth.x, cy: booth.y + booth.height / 2 },
          { cx: booth.x + booth.width, cy: booth.y + booth.height / 2 },
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
        setDragOffset({
          x: pos.x - clickedBooth.x,
          y: pos.y - clickedBooth.y,
        })
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
        setBooths((prev) =>
          prev.map((b) =>
            b.id === selectedBoothId
              ? { ...b, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
              : b
          )
        )
        return
      }

      if (isResizing && selectedBoothId && resizeHandle) {
        setBooths((prev) =>
          prev.map((b) => {
            if (b.id !== selectedBoothId) return b
            let { x, y, width, height } = b
            const minSize = 20

            if (resizeHandle.includes('w')) {
              const newX = Math.min(pos.x, b.x + b.width - minSize)
              width = b.x + b.width - newX
              x = newX
            }
            if (resizeHandle.includes('e')) {
              width = Math.max(minSize, pos.x - b.x)
            }
            if (resizeHandle.includes('n')) {
              const newY = Math.min(pos.y, b.y + b.height - minSize)
              height = b.y + b.height - newY
              y = newY
            }
            if (resizeHandle.includes('s')) {
              height = Math.max(minSize, pos.y - b.y)
            }

            const area = Math.round((width * height) / 100) / 100
            return { ...b, x, y, width, height, area }
          })
        )
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
    [isDrawing, drawStart, isDragging, isResizing, selectedBoothId, resizeHandle, dragOffset, mode, booths, screenToCanvas, getBoothAtPoint, getResizeHandle]
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

    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }, [isDrawing, drawStart, drawCurrent, booths])

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
        const success = await onSave(booths, planName)
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
        <div className="flex flex-wrap items-center gap-1.5 border-b bg-gray-50 px-3 py-2">
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder={isRTL ? 'اسم المخطط' : 'Plan Name'}
            className="h-8 w-48 border-gray-300 text-sm"
            dir={isRTL ? 'rtl' : 'ltr'}
          />

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant={mode === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('select')}
            className="h-8 gap-1.5"
          >
            <MousePointer2 className="h-3.5 w-3.5" />
            {t('admin.editor.selectMode')}
          </Button>
          <Button
            variant={mode === 'draw' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('draw')}
            className="h-8 gap-1.5"
          >
            <Square className="h-3.5 w-3.5" />
            {t('admin.editor.addBooth')}
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.3))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(1)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="ms-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-red-600 hover:bg-red-50"
              onClick={handleDeleteSelected}
              disabled={!selectedBoothId}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('admin.editor.deleteBooth')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash className="h-3.5 w-3.5" />
                  {t('admin.editor.clearAll')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isRTL ? 'تأكيد الحذف' : 'Confirm Clear'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL
                      ? 'هل أنت متأكد من حذف جميع الأجنحة؟'
                      : 'Are you sure you want to remove all booths? This action cannot be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700">
                    {t('common.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              size="sm"
              className="h-8 gap-1.5 bg-orange-500 hover:bg-orange-600"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {t('admin.editor.saveLayout')}
            </Button>

            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={onCancel}
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="min-h-[300px] flex-1 overflow-hidden bg-white">
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
      <div className="w-full shrink-0 border-t bg-gray-50 p-4 lg:w-72 lg:border-t-0 lg:border-s">
        <Card className="border-gray-200">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-sm font-semibold">
              {isRTL ? 'خصائص الجناح' : 'Booth Properties'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {selectedBooth ? (
              <>
                <div>
                  <Label className="mb-1 text-xs">{t('admin.editor.label')}</Label>
                  <Input
                    value={selectedBooth.label}
                    onChange={(e) =>
                      handleUpdateBooth(selectedBooth.id, { label: e.target.value })
                    }
                    className="h-8 text-sm"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div>
                  <Label className="mb-1 text-xs">{t('admin.editor.area')} (m²)</Label>
                  <Input
                    type="number"
                    value={selectedBooth.area}
                    onChange={(e) =>
                      handleUpdateBooth(selectedBooth.id, { area: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 text-sm"
                    dir="ltr"
                  />
                </div>

                <div>
                  <Label className="mb-1 text-xs">{t('admin.editor.type')}</Label>
                  <Select
                    value={selectedBooth.boothType}
                    onValueChange={(v) =>
                      handleUpdateBooth(selectedBooth.id, {
                        boothType: v as 'standard' | 'vip' | 'sponsor',
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{t('admin.editor.standard')}</SelectItem>
                      <SelectItem value="vip">{t('admin.editor.vip')}</SelectItem>
                      <SelectItem value="sponsor">{t('admin.editor.sponsor')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 text-xs">
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
                    className="h-8 text-sm"
                    dir="ltr"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {isRTL ? 'السعر الافتراضي' : 'Default'}: {PRICE_PER_SQM} {t('common.sar')}/m²
                  </p>
                </div>

                <Separator />

                <div className="text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>{isRTL ? 'الموضع X' : 'Position X'}:</span>
                    <span className="font-mono" dir="ltr">{Math.round(selectedBooth.x)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isRTL ? 'الموضع Y' : 'Position Y'}:</span>
                    <span className="font-mono" dir="ltr">{Math.round(selectedBooth.y)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isRTL ? 'العرض' : 'Width'}:</span>
                    <span className="font-mono" dir="ltr">{Math.round(selectedBooth.width)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isRTL ? 'الارتفاع' : 'Height'}:</span>
                    <span className="font-mono" dir="ltr">{Math.round(selectedBooth.height)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-sm border"
                    style={{
                      backgroundColor: BOOTH_TYPE_FILL[selectedBooth.boothType],
                      borderColor: BOOTH_TYPE_COLORS[selectedBooth.boothType],
                    }}
                  />
                  <span className="text-xs text-gray-500">{selectedBooth.boothType.toUpperCase()}</span>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                {mode === 'draw'
                  ? isRTL
                    ? 'انقر واسحب على اللوحة لرسم جناح جديد'
                    : 'Click and drag on the canvas to draw a new booth'
                  : isRTL
                    ? 'اختر جناحاً لتعديل خصائصه'
                    : 'Select a booth to edit its properties'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mt-3 border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{isRTL ? 'إجمالي الأجنحة' : 'Total Booths'}</span>
                <span className="font-semibold">{booths.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isRTL ? 'المساحة الإجمالية' : 'Total Area'}</span>
                <span className="font-semibold">{booths.reduce((s, b) => s + b.area, 0).toFixed(1)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isRTL ? 'الإيرادات المحتملة' : 'Potential Revenue'}</span>
                <span className="font-semibold">
                  {booths.reduce((s, b) => s + b.price, 0).toLocaleString()} {t('common.sar')}
                </span>
              </div>
            </div>

            {/* Type counts */}
            <Separator className="my-3" />
            <div className="space-y-1.5">
              {(['standard', 'vip', 'sponsor'] as const).map((type) => {
                const count = booths.filter((b) => b.boothType === type).length
                return (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: BOOTH_TYPE_COLORS[type] }}
                    />
                    <span className="text-gray-500">{type}</span>
                    <span className="ms-auto font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
