'use client'

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Info } from 'lucide-react'
import { toast } from 'sonner'
import ErrorBoundary from '@/components/ErrorBoundary'
import { cn } from '@/lib/utils'

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
  dimensions?: { width: number; height: number; name: string } | null
}

const DEFAULT_DIMENSIONS = {
  width: 1200,
  height: 800,
  name: ''
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

interface BoothItemProps {
  booth: BoothData
  status: string
  isVIP: boolean
  onClick: (booth: BoothData, e: React.MouseEvent) => void
  isInteracting: boolean
  t: any
}

const BoothItem = memo(({ booth, status, isVIP, onClick, isInteracting, t }: BoothItemProps) => {
  const isSelected = status === 'selected'
  const isBooked = status === 'booked'
  
  const typeStr = (booth?.boothType || '').toLowerCase()
  const isSP = typeStr === 'sponsor' || typeStr === 'راعي' || typeStr.includes('sponsor') || (booth?.label?.startsWith('SP') || false)
  const isVIPSafe = typeStr === 'vip' || typeStr.includes('vip') || isVIP || (booth?.label?.startsWith('VIP') || false)
  
  let fillUrl = 'url(#grad-standard)'
  let textColor = '#ffffff'
  
  if (isBooked) {
    fillUrl = 'url(#grad-disabled)'
    textColor = '#4b5563'
  } else if (isVIPSafe) {
    fillUrl = 'url(#grad-vip)'
  } else if (isSP) {
    fillUrl = 'url(#grad-sp)'
    textColor = '#1f2937'
  }

  return (
    <g
      className={cn("booth-item group transition-transform duration-300", !isInteracting && "hover:scale-[1.03]")}
      style={{ 
        cursor: isBooked ? 'not-allowed' : 'pointer',
        transformOrigin: 'center',
        transformBox: 'fill-box'
      }}
      onClick={(e) => onClick(booth, e)}
    >
      {/* Selection Glow Ring */}
      {isSelected && (
        <rect
          x={booth.x - 4}
          y={booth.y - 4}
          width={booth.width + 8}
          height={booth.height + 8}
          rx={16}
          ry={16}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth={3}
          filter="url(#neon-glow)"
          className="animate-pulse"
        />
      )}

      {/* Main Elevated Surface */}
      <rect
        x={booth.x}
        y={booth.y}
        width={booth.width}
        height={booth.height}
        rx={12}
        ry={12}
        fill={fillUrl}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1.5}
        filter={isInteracting ? undefined : "url(#booth-shadow)"}
        className="booth-rect transition-all duration-300 group-hover:filter-hover-shadow"
      />

      {/* Category Icons */}
      {!isBooked && (isVIPSafe || isSP) && (
        <svg
          x={booth.x + booth.width / 2 - 10}
          y={booth.y + booth.height / 2 - 24}
          width={20}
          height={20}
          viewBox="0 0 24 24"
        >
          {isVIPSafe ? (
            <path
              d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"
              fill={textColor}
              opacity={0.9}
            />
          ) : (
            <path
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill={textColor}
              opacity={0.9}
            />
          )}
        </svg>
      )}

      {/* Labels */}
      <text
        x={booth.x + booth.width / 2}
        y={booth.y + booth.height / 2 + (isBooked || (!isVIPSafe && !isSP) ? -5 : 5)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="800"
        fill={textColor}
        style={{ pointerEvents: 'none' }}
        className="font-sans"
      >
        {booth?.label || ''}
      </text>
      
      <text
        x={booth.x + booth.width / 2}
        y={booth.y + booth.height / 2 + (isBooked || (!isVIPSafe && !isSP) ? 12 : 20)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight="600"
        fill={textColor}
        opacity={0.75}
        style={{ pointerEvents: 'none' }}
        className="font-sans"
      >
        {booth.area} {t('boothMap.sqm') || 'm²'}
      </text>

      {/* Lock icon if booked */}
      {isBooked && (
        <text
          x={booth.x + booth.width / 2}
          y={booth.y + booth.height / 2 - 20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fill={textColor}
          opacity={0.6}
          style={{ pointerEvents: 'none' }}
        >
          🔒
        </text>
      )}
    </g>
  )
}, (prev, next) => {
  return prev.booth.id === next.booth.id && 
         prev.status === next.status && 
         prev.isInteracting === next.isInteracting &&
         prev.isVIP === next.isVIP
})

export default function BoothMap({ booths, selectedBoothIds, onSelectBooths, onBookNow, dimensions }: BoothMapProps) {
  const { t, dir, isRTL } = useTranslation()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  const handleZoomIn = () => {
    setIsZooming(true)
    setZoom((z) => Math.min(z + 0.2, 3))
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)
    zoomTimeoutRef.current = setTimeout(() => setIsZooming(false), 300)
  }
  const handleZoomOut = () => {
    setIsZooming(true)
    setZoom((z) => Math.max(z - 0.2, 0.5))
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)
    zoomTimeoutRef.current = setTimeout(() => setIsZooming(false), 300)
  }
  const handleReset = () => {
    setIsZooming(true)
    setZoom(1)
    setPan({ x: 0, y: 0 })
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current)
    zoomTimeoutRef.current = setTimeout(() => setIsZooming(false), 300)
  }

  const selectedBooths = booths.filter((b) => selectedBoothIds.includes(b.id))
  const totalArea = selectedBooths.reduce((sum, b) => sum + b.area, 0)
  const totalPrice = totalArea * PRICE_PER_SQM

  const isInteracting = isPanning || isZooming
  const effectiveDim = dimensions || { width: 760, height: 550 }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-4 lg:flex-row animate-in fade-in duration-700">
        {/* Map Area */}
        <div className="flex-1">
          <Card className="overflow-hidden border-border bg-card shadow-xl rounded-2xl">
            <CardHeader className="border-b bg-muted/30 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{t('boothMap.title')}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{t('boothMap.subtitle')}</p>
                </div>
                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-background p-1.5 rounded-xl border border-border shadow-sm">
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" onClick={handleZoomIn} title={t('boothMap.zoom.in')}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" onClick={handleZoomOut} title={t('boothMap.zoom.out')}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" onClick={handleReset} title={t('boothMap.zoom.reset')}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="relative overflow-hidden bg-slate-200/50"
                style={{ minHeight: 500 }}
                ref={svgRef as React.RefObject<HTMLDivElement>}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg
                  viewBox={`0 0 ${effectiveDim.width} ${effectiveDim.height}`}
                  className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={handleMouseDown}
                  style={{ minWidth: 400 }}
                >
                  <defs>
                    <filter id="booth-shadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
                    </filter>
                    <filter id="booth-shadow-hover" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="12" stdDeviation="8" floodOpacity="0.25" />
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" />
                    </filter>
                    <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <linearGradient id="grad-vip" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="grad-sp" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#F8FAFC', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#94A3B8', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="grad-standard" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#047857', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="grad-disabled" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#E5E7EB', stopOpacity: 0.9 }} />
                      <stop offset="100%" style={{ stopColor: '#9CA3AF', stopOpacity: 0.9 }} />
                    </linearGradient>

                    <style>
                      {`
                        .hover\\:filter-hover-shadow:hover {
                          filter: url(#booth-shadow-hover) !important;
                        }
                      `}
                    </style>

                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Background */}
                    <rect x="0" y="0" width={effectiveDim.width} height={effectiveDim.height} fill="#ffffff" rx="12" />
                    <rect x="0" y="0" width={effectiveDim.width} height={effectiveDim.height} fill="url(#grid-pattern)" opacity="0.05" />

                    {/* Floor label */}
                    <text x={effectiveDim.width / 2} y="30" textAnchor="middle" fontSize="14" fill="#64748b" fontWeight="600" className="uppercase tracking-widest">
                      {effectiveDim.name || (isRTL ? 'مخطط أرضية المعرض' : 'Exhibition Floor Plan')}
                    </text>

                    {/* Grid lines for visual reference */}
                    <g opacity={0.3}>
                      <line x1="30" y1="50" x2={effectiveDim.width - 30} y2="50" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="30" y1="160" x2={effectiveDim.width - 30} y2="160" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
                      <line x1="30" y1="280" x2={effectiveDim.width - 30} y2="280" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
                      <line x1="30" y1="400" x2={effectiveDim.width - 30} y2="400" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
                    </g>

                    {/* Entrance indicator */}
                    <rect x={effectiveDim.width / 2 - 50} y={effectiveDim.height - 26} width="100" height="16" rx="4" fill="#f97316" opacity="0.2" />
                    <text x={effectiveDim.width / 2} y={effectiveDim.height - 14} textAnchor="middle" fontSize="9" fill="#f97316" fontWeight="600">
                      {isRTL ? '↓ المدخل الرئيسي' : 'Main Entrance ↓'}
                    </text>

                    {/* Render all booths */}
                    {booths.map((booth) => (
                      <BoothItem
                        key={booth.id}
                        booth={booth}
                        status={getBoothStatus(booth)}
                        isVIP={booth.label.startsWith('VIP')}
                        onClick={handleBoothClick}
                        isInteracting={isInteracting}
                        t={t}
                      />
                    ))}
                  </g>
                </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic UI Sidebar (Right Side) */}
      <div className="w-full lg:w-[340px] shrink-0">
        <div className="sticky top-24 rounded-[24px] border border-white/50 bg-white/70 p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-8 text-center pb-4 border-b border-gray-100">
             <h3 className="text-gray-500 font-medium text-sm">{isRTL ? 'تفاصيل البوت' : 'Booth Details'}</h3>
          </div>

          {selectedBooths.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-gray-300">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{isRTL ? 'اختر بوثاً من الخريطة' : 'Select a booth from the map'}</h4>
              <p className="text-sm text-gray-400 max-w-[220px] mx-auto leading-relaxed">{isRTL ? 'انقر على أي بوث متاح لعرض تفاصيله وحجزه' : 'Click on any available booth to view its details and book it.'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedBooths.map((booth, idx) => {
                const typeStr = (booth?.boothType || '').toLowerCase()
                const isVIP = typeStr === 'vip' || typeStr.includes('vip') || (booth?.label?.startsWith('VIP') || false)
                const isSP = typeStr === 'sponsor' || typeStr === 'راعي' || typeStr.includes('sponsor') || (booth?.label?.startsWith('SP') || false)
                const catLabel = isVIP ? 'VIP' : (isSP ? (isRTL ? 'راعي' : 'Sponsor') : (isRTL ? 'عادي' : 'Standard'))
                
                return (
                  <div key={booth.id} className={idx > 0 ? "pt-6 border-t border-gray-100" : ""}>
                    {/* Header: Status badge & Title */}
                    <div className="flex items-start justify-between mb-2">
                       <Badge className="bg-[#e6f7ef] text-[#059669] hover:bg-[#e6f7ef] rounded-full border-none px-3 font-semibold shadow-none">
                         {isRTL ? 'متاح' : 'Available'}
                       </Badge>
                       <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900" dir="ltr">
                            {booth.label}
                            {isVIP && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#D4AF37]"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>}
                            {isSP && <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#A0AEC0]"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{isVIP ? (isRTL ? 'بوث VIP حصري' : 'Exclusive VIP Booth') : (isSP ? (isRTL ? 'مساحة رعاة' : 'Sponsor Space') : (isRTL ? 'مساحة عادية' : 'Standard Space'))}</p>
                       </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                       <div className="bg-gray-50/80 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100/50 transition-colors hover:bg-gray-100/80">
                         <span className="text-xs text-gray-400 mb-1">{isRTL ? 'الفئة' : 'Category'}</span>
                         <span className="text-sm font-bold text-gray-800">{catLabel}</span>
                       </div>
                       <div className="bg-gray-50/80 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100/50 transition-colors hover:bg-gray-100/80">
                         <span className="text-xs text-gray-400 mb-1">{isRTL ? 'المساحة' : 'Area'}</span>
                         <span className="text-sm font-bold text-gray-800" dir="ltr">{booth.area} {t('boothMap.sqm') || 'm²'}</span>
                       </div>
                       <div className="bg-gray-50/80 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100/50 col-span-2 transition-colors hover:bg-gray-100/80">
                         <span className="text-xs text-gray-400 mb-1">{isRTL ? 'السعر' : 'Price'}</span>
                         <span className="text-base font-bold text-gray-800" dir="ltr">{isRTL ? 'SAR' : ''} {PRICE_PER_SQM ? (booth.area * PRICE_PER_SQM).toLocaleString() : '---'} {!isRTL ? 'SAR' : ''}</span>
                       </div>
                    </div>
                  </div>
                )
              })}

              <Button
                className="w-full bg-[#059669] hover:bg-[#047857] text-white shadow-[0_8px_20px_rgba(5,150,105,0.25)] rounded-[16px] h-14 text-[15px] font-bold transition-transform active:scale-95 mt-4"
                disabled={selectedBooths.length === 0}
                onClick={onBookNow}
              >
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  {isRTL ? 'احجز الآن (قفل مؤقت 10 دقائق)' : 'Book Now (10 Min Lock)'}
                </div>
              </Button>
            </div>
          )}

          {/* Legend section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <h4 className="text-xs text-gray-400 font-medium mb-4 text-end w-full pr-2">{isRTL ? 'دليل الألوان' : 'Color Legend'}</h4>
             <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs text-gray-600 font-medium px-2">
               {/* VIP */}
               <div className="flex items-center justify-end gap-3">
                 <span>VIP</span>
                 <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-white shadow-sm">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>
                 </div>
               </div>
               {/* Standard */}
               <div className="flex items-center justify-end gap-3">
                 <span>{isRTL ? 'عادي' : 'Standard'}</span>
                 <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-[#10B981] to-[#047857] text-white shadow-sm">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/></svg>
                 </div>
               </div>
               {/* SP */}
               <div className="flex items-center justify-end gap-3">
                 <span>{isRTL ? 'راعي' : 'Sponsor'}</span>
                 <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-[#E2E8F0] to-[#94A3B8] text-gray-700 shadow-sm">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                 </div>
               </div>
               {/* Reserved */}
               <div className="flex items-center justify-end gap-3">
                 <span>{isRTL ? 'محجوز مؤقتاً' : 'Reserved'}</span>
                 <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-[#E5E7EB] to-[#9CA3AF] text-gray-500 shadow-sm opacity-80">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
