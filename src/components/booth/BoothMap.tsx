'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Info } from 'lucide-react'
import { toast } from 'sonner'

export interface BoothData {
  id: string
  label: string
  area: number
  status: string
  x: number
  y: number
  width: number
  height: number
  isLocked?: boolean
}

interface BoothMapProps {
  booths: BoothData[]
  selectedBoothIds: string[]
  onSelectBooths: (boothIds: string[]) => void
  onBookNow: () => void
}

const PRICE_PER_SQM = 1700

const STATUS_COLORS: Record<string, string> = {
  available: '#22c55e',
  pending: '#eab308',
  booked: '#ef4444',
  selected: '#3b82f6',
}

const STATUS_HOVER_COLORS: Record<string, string> = {
  available: '#16a34a',
  pending: '#ca8a04',
  booked: '#dc2626',
  selected: '#2563eb',
}

export default function BoothMap({ booths, selectedBoothIds, onSelectBooths, onBookNow }: BoothMapProps) {
  const { t, dir, isRTL } = useTranslation()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const getBoothStatus = useCallback((booth: BoothData): string => {
    if (selectedBoothIds.includes(booth.id)) return 'selected'
    return booth.status
  }, [selectedBoothIds])

  const handleBoothClick = useCallback((booth: BoothData, e: React.MouseEvent) => {
    e.stopPropagation()

    const status = getBoothStatus(booth)
    if (status === 'booked') {
      toast.error(isRTL ? 'هذا الجناح محجوز' : 'This booth is already booked')
      return
    }
    if (status === 'pending') {
      toast.warning(isRTL ? 'هذا الجناح قيد الحجز حالياً' : 'This booth is currently being booked')
      return
    }

    if (selectedBoothIds.includes(booth.id)) {
      onSelectBooths(selectedBoothIds.filter((id) => id !== booth.id))
    } else {
      onSelectBooths([...selectedBoothIds, booth.id])
    }
  }, [selectedBoothIds, onSelectBooths, getBoothStatus, isRTL])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const selectedBooths = booths.filter((b) => selectedBoothIds.includes(b.id))
  const totalArea = selectedBooths.reduce((sum, b) => sum + b.area, 0)
  const totalPrice = totalArea * PRICE_PER_SQM

  const renderBooth = (booth: BoothData) => {
    const status = getBoothStatus(booth)
    const isVIP = booth.label.startsWith('VIP')
    const fillColor = STATUS_COLORS[status] || STATUS_COLORS.available
    const hoverColor = STATUS_HOVER_COLORS[status] || STATUS_HOVER_COLORS.available

    return (
      <g
        key={booth.id}
        className="booth-item"
        style={{ cursor: status === 'booked' || status === 'pending' ? 'not-allowed' : 'pointer' }}
        onClick={(e) => handleBoothClick(booth, e)}
      >
        <rect
          x={booth.x}
          y={booth.y}
          width={booth.width}
          height={booth.height}
          rx={6}
          ry={6}
          fill={fillColor}
          stroke={isVIP ? '#f97316' : '#ffffff'}
          strokeWidth={isVIP ? 3 : 1.5}
          opacity={status === 'booked' ? 0.7 : 1}
          className="booth-rect"
          data-hover-color={hoverColor}
        />
        {/* VIP Badge */}
        {isVIP && (
          <>
            <rect
              x={booth.x + booth.width / 2 - 18}
              y={booth.y - 10}
              width={36}
              height={16}
              rx={8}
              ry={8}
              fill="#f97316"
            />
            <text
              x={booth.x + booth.width / 2}
              y={booth.y + 1}
              textAnchor="middle"
              fontSize={8}
              fontWeight="bold"
              fill="#ffffff"
            >
              VIP
            </text>
          </>
        )}
        {/* Booth Label */}
        <text
          x={booth.x + booth.width / 2}
          y={booth.y + (isVIP ? booth.height / 2 - 4 : booth.height / 2 - 6)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={isVIP ? 16 : 13}
          fontWeight="bold"
          fill="#ffffff"
          style={{ pointerEvents: 'none' }}
        >
          {booth.label}
        </text>
        {/* Area Text */}
        <text
          x={booth.x + booth.width / 2}
          y={booth.y + (isVIP ? booth.height / 2 + 14 : booth.height / 2 + 10)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={isVIP ? 11 : 9}
          fill="#ffffff"
          opacity={0.9}
          style={{ pointerEvents: 'none' }}
        >
          {booth.area} {t('boothMap.sqm')}
        </text>
        {/* Booked overlay icon */}
        {status === 'booked' && (
          <text
            x={booth.x + booth.width / 2}
            y={booth.y + booth.height / 2 + (isVIP ? 0 : -2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={22}
            fill="#ffffff"
            opacity={0.5}
            style={{ pointerEvents: 'none' }}
          >
            ✓
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Map Area */}
      <div className="flex-1">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gray-50 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('boothMap.title')}</CardTitle>
                <p className="mt-1 text-sm text-gray-500">{t('boothMap.subtitle')}</p>
              </div>
              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn} title={t('boothMap.zoom.in')}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut} title={t('boothMap.zoom.out')}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset} title={t('boothMap.zoom.reset')}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="relative overflow-hidden bg-gray-100"
              style={{ minHeight: 400 }}
              ref={svgRef as React.RefObject<HTMLDivElement>}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg
                viewBox="0 0 760 550"
                className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                style={{ minWidth: 400 }}
              >
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Background */}
                  <rect x="0" y="0" width="760" height="550" fill="#f1f5f9" rx="12" />

                  {/* Floor label */}
                  <text x="380" y="22" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">
                    {isRTL ? 'خريطة أرضية المعرض - الطابق الأول' : 'Exhibition Floor Plan - First Floor'}
                  </text>

                  {/* Grid lines for visual reference */}
                  <line x1="30" y1="30" x2="730" y2="30" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="30" y1="140" x2="730" y2="140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                  <line x1="30" y1="260" x2="730" y2="260" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                  <line x1="30" y1="380" x2="730" y2="380" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />

                  {/* Row Labels */}
                  <text x="30" y="55" fontSize="10" fill="#64748b" fontWeight="bold">A</text>
                  <text x="30" y="175" fontSize="10" fill="#64748b" fontWeight="bold">B</text>
                  <text x="30" y="295" fontSize="10" fill="#64748b" fontWeight="bold">C</text>
                  <text x="30" y="430" fontSize="10" fill="#64748b" fontWeight="bold">VIP</text>

                  {/* Entrance indicator */}
                  <rect x="330" y="530" width="100" height="16" rx="4" fill="#f97316" opacity="0.2" />
                  <text x="380" y="542" textAnchor="middle" fontSize="9" fill="#f97316" fontWeight="600">
                    {isRTL ? '↓ المدخل الرئيسي' : 'Main Entrance ↓'}
                  </text>

                  {/* Render all booths */}
                  {booths.map(renderBooth)}
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Legend & Summary */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-orange-500" />
              {t('boothMap.legend.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'available', color: STATUS_COLORS.available },
              { key: 'pending', color: STATUS_COLORS.pending },
              { key: 'booked', color: STATUS_COLORS.booked },
              { key: 'selected', color: STATUS_COLORS.selected },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{t(`boothMap.legend.${item.key}`)}</span>
              </div>
            ))}
            <div className="mt-2 rounded-md bg-orange-50 p-2 text-xs text-orange-700">
              {isRTL
                ? '💡 انقر على الأجنحة المتاحة لتحديدها. يمكنك اختيار أكثر من جناح.'
                : '💡 Click on available booths to select them. You can select multiple booths.'}
            </div>
          </CardContent>
        </Card>

        {/* Selection Summary */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4 text-orange-500" />
              {t('boothMap.selectBooths')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t('boothMap.boothsSelected')}
              </span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {selectedBooths.length}
              </Badge>
            </div>

            {selectedBooths.length > 0 && (
              <div className="space-y-2">
                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                  {selectedBooths.map((booth) => (
                    <div key={booth.id} className="flex items-center justify-between rounded-md bg-white px-3 py-1.5 text-sm shadow-sm">
                      <span className="font-medium">{booth.label}</span>
                      <span className="text-gray-500">{booth.area} {t('boothMap.sqm')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('boothMap.totalArea')}</span>
                    <span className="font-medium">{totalArea} {t('boothMap.sqm')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('boothMap.perSqm')}</span>
                    <span className="font-medium">{PRICE_PER_SQM.toLocaleString()} {t('boothMap.currency')}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t pt-2">
                    <span className="font-semibold">{t('boothMap.totalPrice')}</span>
                    <span className="text-lg font-bold text-orange-600">
                      {totalPrice.toLocaleString()} {t('boothMap.currency')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              size="lg"
              disabled={selectedBooths.length === 0}
              onClick={onBookNow}
            >
              <ShoppingCart className="ms-2 h-4 w-4" />
              {t('boothMap.bookNow')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
