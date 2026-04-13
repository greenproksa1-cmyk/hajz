'use client'

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Info, Map as MapIcon, Layers, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
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
    textColor = '#64748b'
  } else if (isVIPSafe) {
    fillUrl = 'url(#grad-vip)'
    textColor = '#451a03'
  } else if (isSP) {
    fillUrl = 'url(#grad-sp)'
    textColor = '#334155'
  }

  return (
    <motion.g
      initial={false}
      animate={{ 
        scale: isInteracting ? 1 : (isSelected ? 1.05 : 1),
      }}
      className={cn("booth-item group transition-all duration-300", !isInteracting && "hover:filter-[url(#booth-shadow-hover)]")}
      style={{ 
        cursor: isBooked ? 'not-allowed' : 'pointer',
        transformOrigin: 'center',
        transformBox: 'fill-box'
      }}
      onClick={(e) => onClick(booth, e)}
    >
      {/* Selection Glow Ring */}
      <AnimatePresence>
        {isSelected && (
          <motion.rect
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            x={booth.x - 6}
            y={booth.y - 6}
            width={booth.width + 12}
            height={booth.height + 12}
            rx={18}
            ry={18}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            filter="url(#neon-glow)"
            style={{ 
              transformOrigin: 'center',
              transformBox: 'fill-box'
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Elevated Surface */}
      <rect
        x={booth.x}
        y={booth.y}
        width={booth.width}
        height={booth.height}
        rx={12}
        ry={12}
        fill={fillUrl}
        stroke={isSelected ? "#3b82f6" : "rgba(255,255,255,0.4)"}
        strokeWidth={isSelected ? 3 : 1.5}
        filter={isInteracting ? undefined : "url(#booth-shadow)"}
        className="booth-rect transition-all duration-300 shadow-inner"
      />

      {/* Labels */}
      <text
        x={booth.x + booth.width / 2}
        y={booth.y + booth.height / 2 + (isBooked || (!isVIPSafe && !isSP) ? -5 : 5)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="900"
        fill={textColor}
        style={{ pointerEvents: 'none' }}
        className="font-sans select-none"
      >
        {booth?.label || ''}
      </text>
      
      <text
        x={booth.x + booth.width / 2}
        y={booth.y + booth.height / 2 + (isBooked || (!isVIPSafe && !isSP) ? 12 : 20)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight="700"
        fill={textColor}
        opacity={0.8}
        style={{ pointerEvents: 'none' }}
        className="font-sans select-none tracking-tight"
      >
        {booth.area} {t('boothMap.sqm') || 'm²'}
      </text>

      {/* Iconography */}
      {!isBooked && (isVIPSafe || isSP) && (
        <text
           x={booth.x + booth.width / 2}
           y={booth.y + booth.height / 2 - 22}
           textAnchor="middle"
           dominantBaseline="central"
           fontSize={12}
           style={{ pointerEvents: 'none' }}
        >
          {isVIPSafe ? '✨' : '⭐'}
        </text>
      )}

      {/* Lock icon if booked */}
      {isBooked && (
        <text
          x={booth.x + booth.width / 2}
          y={booth.y + booth.height / 2 - 20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fill={textColor}
          opacity={0.4}
          style={{ pointerEvents: 'none' }}
        >
          🔒
        </text>
      )}
    </motion.g>
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
      <div className="flex flex-col gap-6 lg:flex-row animate-in fade-in duration-1000">
        {/* Map Area - Dashboard Style */}
        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] lg:rounded-[2.5rem] border-0 outline-none ring-1 ring-slate-100">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-5 py-4 sm:px-8 sm:py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <MapIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{t('boothMap.title')}</CardTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('boothMap.subtitle')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Modern Zoom Controls */}
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-50 rounded-xl transition-all" onClick={handleZoomIn} title={t('boothMap.zoom.in')}>
                    <ZoomIn className="h-5 w-5 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-50 rounded-xl transition-all" onClick={handleZoomOut} title={t('boothMap.zoom.out')}>
                    <ZoomOut className="h-5 w-5 text-slate-600" />
                  </Button>
                  <div className="w-px h-6 bg-slate-100 mx-1" />
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-50 rounded-xl transition-all" onClick={handleReset} title={t('boothMap.zoom.reset')}>
                    <RotateCcw className="h-5 w-5 text-slate-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="relative overflow-hidden bg-[#f8fafc] group/map min-h-[400px] lg:min-h-[600px]"
                ref={svgRef as React.RefObject<HTMLDivElement>}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg
                  viewBox={`0 0 ${effectiveDim.width} ${effectiveDim.height}`}
                  className={`w-full h-full transition-opacity duration-500 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={handleMouseDown}
                >
                  <defs>
                    <filter id="booth-shadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.08" />
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.04" />
                    </filter>
                    <filter id="booth-shadow-hover" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="12" stdDeviation="12" floodOpacity="0.12" />
                    </filter>
                    <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <linearGradient id="grad-vip" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ffedd5', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="grad-sp" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ede9fe', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="grad-standard" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
                    </linearGradient>

                    <linearGradient id="grad-disabled" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#f1f5f9', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#94a3b8', stopOpacity: 1 }} />
                    </linearGradient>

                    <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.4" />
                    </pattern>
                  </defs>

                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Background Surface */}
                    <rect x="0" y="0" width={effectiveDim.width} height={effectiveDim.height} fill="#ffffff" rx="12" />
                    <rect x="0" y="0" width={effectiveDim.width} height={effectiveDim.height} fill="url(#grid-pattern)" />

                    {/* Floor Plan Boundaries */}
                    <rect x="20" y="20" width={effectiveDim.width - 40} height={effectiveDim.height - 40} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="10 10" rx="10" />

                    {/* Floor label */}
                    <text x={effectiveDim.width / 2} y="50" textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight="800" className="uppercase tracking-[0.2em] select-none">
                      {effectiveDim.name || (isRTL ? 'مخطط أرضية المعرض الرئيسي' : 'Main Exhibition Floor Plan')}
                    </text>

                    {/* Entrance indicator */}
                    <g transform={`translate(${effectiveDim.width / 2 - 60}, ${effectiveDim.height - 40})`}>
                       <rect width="120" height="30" rx="15" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                       <text x="60" y="20" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="800" className="select-none uppercase tracking-widest">
                         {isRTL ? 'المدخل الرئيسي ↓' : '↓ Main Entrance'}
                       </text>
                    </g>

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
                
                {/* Floating Map Info Overlay */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-lg pointer-events-none opacity-0 group-hover/map:opacity-100 transition-opacity">
                   <Info className="h-4 w-4 text-blue-600" />
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                     {isRTL ? 'استخدم الماوس للتحريك والتكبير' : 'Drag to pan, Scroll to zoom'}
                   </span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic UI Sidebar (Right Side) */}
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-white border border-slate-100 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px]" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Layers className="h-4 w-4" />
                   </div>
                   <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">{isRTL ? 'تفاصيل الحجز' : 'Booking Details'}</h3>
                </div>

                {selectedBooths.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-8 w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-200"
                    >
                      <MapIcon className="h-10 w-10" />
                    </motion.div>
                    <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{isRTL ? 'اختر موقعك المفضل' : 'Choose Your Spot'}</h4>
                    <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed font-medium">
                      {isRTL 
                        ? 'انقر على أي بوث متاح في المخطط التفاعلي لعرض تفاصيله وبدء عملية الحجز الفوري.' 
                        : 'Click on any available booth in the interactive map to view details and start booking.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {selectedBooths.map((booth, idx) => {
                        const typeStr = (booth?.boothType || '').toLowerCase()
                        const isVIP = typeStr === 'vip' || typeStr.includes('vip') || (booth?.label?.startsWith('VIP') || false)
                        const isSP = typeStr === 'sponsor' || typeStr === 'راعي' || typeStr.includes('sponsor') || (booth?.label?.startsWith('SP') || false)
                        
                        return (
                          <motion.div 
                            key={booth.id}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                          >
                            <div className="flex items-center justify-between">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isRTL ? 'رقم البوث' : 'Booth Ref'}</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-3xl font-black text-slate-900 tracking-tighter">{booth.label}</span>
                                     {isVIP && <span className="h-5 w-5 flex items-center justify-center text-lg">✨</span>}
                                  </div>
                               </div>
                               <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 rounded-xl px-4 py-1.5 border-emerald-100/50 shadow-none font-black text-[10px] uppercase tracking-widest">
                                 {isRTL ? 'متاح الآن' : 'Available'}
                               </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-slate-50 rounded-2xl p-4 transition-colors hover:bg-slate-100/80">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{isRTL ? 'المساحة' : 'Total Area'}</span>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-slate-900">{booth.area}</span>
                                    <span className="text-[10px] font-bold text-slate-500">{t('boothMap.sqm') || 'm²'}</span>
                                 </div>
                               </div>
                               <div className="bg-slate-50 rounded-2xl p-4 transition-colors hover:bg-slate-100/80">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{isRTL ? 'الفئة' : 'Category'}</span>
                                 <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                   {isVIP ? 'VIP' : (isSP ? (isRTL ? 'راعي' : 'Sponsor') : (isRTL ? 'عادي' : 'Standard'))}
                                 </span>
                               </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>

                    <div className="pt-6 border-t border-slate-50">
                       <div className="flex items-center justify-between mb-6">
                         <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{isRTL ? 'إجمالي التكلفة' : 'Estimated Cost'}</span>
                         <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black text-slate-900 tracking-tighter">
                             {PRICE_PER_SQM ? totalPrice.toLocaleString() : '---'}
                           </span>
                           <span className="text-sm font-bold text-slate-500">{isRTL ? 'ريال' : 'SAR'}</span>
                         </div>
                       </div>
                       
                       <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 rounded-2xl h-16 text-lg font-black transition-all active:scale-95 group/btn"
                        disabled={selectedBooths.length === 0}
                        onClick={onBookNow}
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="h-5 w-5 transition-transform group-hover/btn:-rotate-12" />
                          {isRTL ? 'تأكيد وحجز الآن' : 'Confirm & Book Now'}
                        </div>
                      </Button>
                      <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
                         {isRTL ? 'سيتم حجز الموقع مؤقتاً لمدة 10 دقائق' : 'Spots are held for 10 minutes only'}
                      </p>
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* New Modern Legend */}
          <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]" />
             <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                   <Settings2 className="h-4 w-4 text-blue-400" />
                   <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">{isRTL ? 'دليل الألوان الشامل' : 'Color Spectrum Guide'}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <LegendItem color="bg-gradient-to-br from-emerald-400 to-emerald-600" label={isRTL ? 'متاح ريادي' : 'Available'} isRTL={isRTL} />
                   <LegendItem color="bg-gradient-to-br from-amber-300 to-orange-500" label="VIP Package" isRTL={isRTL} />
                   <LegendItem color="bg-gradient-to-br from-slate-200 to-slate-400" label={isRTL ? 'مخصص للرعاة' : 'Sponsors'} isRTL={isRTL} />
                   <LegendItem color="bg-gradient-to-br from-slate-700 to-slate-800 opacity-50" label={isRTL ? 'محجوز رسمياً' : 'Reserved'} isRTL={isRTL} />
                </div>
             </div>
          </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function LegendItem({ color, label, isRTL }: { color: string, label: string, isRTL: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
       <div className={`h-4 w-4 rounded-md ${color} ring-2 ring-white/10`} />
       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
  )
}
