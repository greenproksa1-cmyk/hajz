'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import AdminSidebar from './AdminSidebar'
import FloorPlanManager from './FloorPlanManager'
import BoothManagement from './BoothManagement'
import PaymentManagement from './PaymentManagement'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ErrorBoundary from '@/components/ErrorBoundary'
import { toast } from 'sonner'
import {
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileText,
  CreditCard,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
  Download,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  User,
} from 'lucide-react'
import { openOrDownloadFile } from '@/lib/file-viewer'

interface AdminDashboardNewProps {
  onLogout: () => void
}

// Helper: Build admin auth header from stored credentials
export function getAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  const creds = sessionStorage.getItem('admin_creds');
  if (!creds) return null;
  return btoa(creds);
}

export function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const key = getAdminKey();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(key ? { 'x-admin-key': key } : {}),
    },
  });
}

export default function AdminDashboardNew({ onLogout }: AdminDashboardNewProps) {
  const { t, dir, isRTL } = useTranslation()
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'floor-plans':
        return <FloorPlanManager />
      case 'booths':
        return <BoothManagement />
      case 'payments':
        return <PaymentManagement />
      case 'bookings':
        return <BookingsPanel isRTL={isRTL} t={t} />
      case 'dashboard':
      default:
        return <OverviewPanel isRTL={isRTL} t={t} onGoToBookings={() => setActiveTab('bookings')} />
    }
  }

  return (
    <div dir={dir} className="flex h-screen overflow-hidden bg-background text-foreground relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-background to-purple-600/5 pointer-events-none" />

      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      <div className="flex-1 min-w-0 min-h-0 overflow-hidden relative">
        <ScrollArea className="h-full w-full">
          <ErrorBoundary key={activeTab}>
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1800px] mx-auto">
              {renderContent()}
            </div>
          </ErrorBoundary>
        </ScrollArea>
      </div>
    </div>
  )
}

// ============== Overview Panel ==============
function OverviewPanel({
  isRTL,
  t,
  onGoToBookings,
}: {
  isRTL: boolean
  t: (k: string) => string
  onGoToBookings: () => void
}) {
  const [bookings, setBookings] = useState<any[]>([])
  const [booths, setBooths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [bookingsRes, boothsRes] = await Promise.all([
        adminFetch('/api/admin/bookings'),
        fetch('/api/booths'),
      ])
      const bookingsData = await bookingsRes.json()
      const boothsData = await boothsRes.json()
      if (bookingsData.success) setBookings(Array.isArray(bookingsData.data) ? bookingsData.data : [])
      if (boothsData.success) setBooths(Array.isArray(boothsData.data) ? boothsData.data : [])
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleReset = async () => {
    try {
      setIsResetting(true)
      const res = await adminFetch('/api/admin/reset', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(
          isRTL
            ? `تم حذف ${data.data.deletedBookings} حجز وإعادة تعيين ${data.data.resetBooths} بوث`
            : `Deleted ${data.data.deletedBookings} bookings, reset ${data.data.resetBooths} booths`
        )
        setShowResetConfirm(false)
        await fetchData()
      } else {
        toast.error(isRTL ? 'فشل إعادة التعيين' : 'Reset failed')
      }
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred')
    } finally {
      setIsResetting(false)
    }
  }

  const totalBookings = bookings?.length || 0
  const pendingBookings = bookings?.filter((b: any) => b?.status === 'pending').length || 0
  const approvedBookings = bookings?.filter(
    (b: any) => b?.status === 'approved' || b?.status === 'completed'
  ).length || 0
  const totalRevenue = bookings
    ?.filter((b: any) => b?.status === 'approved' || b?.status === 'completed')
    .reduce((sum: number, b: any) => sum + (b?.totalPrice || 0), 0) || 0

  const availableBooths = booths?.filter((b: any) => b?.status === 'available').length || 0
  const bookedBooths = booths?.filter((b: any) => b?.status === 'booked').length || 0
  const totalBooths = booths?.length || 0

  const stats = [
    {
      label: isRTL ? 'إجمالي الحجوزات' : 'Total Bookings',
      value: totalBookings,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500',
    },
    {
      label: isRTL ? 'بانتظار المراجعة' : 'Pending Review',
      value: pendingBookings,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-500',
    },
    {
      label: isRTL ? 'الحجوزات المؤكدة' : 'Approved Bookings',
      value: approvedBookings,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-500',
    },
    {
      label: isRTL ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `${totalRevenue.toLocaleString()} ${isRTL ? 'ر.س' : 'SAR'}`,
      color: 'text-emerald-700 dark:text-emerald-500',
      bg: 'bg-emerald-600',
    },
  ]

  const occupancyRate = totalBooths > 0 ? Math.round((bookedBooths / totalBooths) * 100) : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isRTL ? 'نظرة عامة' : 'Overview'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRTL
              ? 'ملخص سريع لحالة المعرض والحجوزات ومراجعة العقود والحوالات'
              : 'Quick summary of exhibition status, contracts, and payments'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>

          {!showResetConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
              {isRTL ? 'حذف كل الحجوزات' : 'Clear All Bookings'}
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span className="text-xs text-red-700 font-medium">
                {isRTL ? 'هل أنت متأكد من حذف جميع الحجوزات وتصفير البوثات؟' : 'Are you sure to delete all bookings?'}
              </span>
              <Button
                size="sm"
                className="h-7 bg-red-600 hover:bg-red-700 text-white text-xs px-3"
                onClick={handleReset}
                disabled={isResetting}
              >
                {isResetting ? '...' : (isRTL ? 'نعم، احذف الكل' : 'Yes, Delete All')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setShowResetConfirm(false)}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`absolute left-0 top-0 h-1 w-full ${stat.bg} opacity-80`} />
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold drop-shadow-sm ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Booth occupancy */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-foreground">
          {isRTL ? 'إشغال الأجنحة' : 'Booth Occupancy'}
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative h-36 w-36 drop-shadow-md">
            <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                className="text-muted/20"
                strokeWidth="14"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#dc2626"
                strokeWidth="14"
                strokeDasharray={`${(occupancyRate / 100) * 314} 314`}
                strokeLinecap="round"
                className="drop-shadow-sm transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-foreground">
                {occupancyRate}%
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-4 w-full sm:w-auto">
            <div className="flex items-center justify-between rounded-lg bg-red-500/10 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
                <span className="font-medium text-foreground">{isRTL ? 'محجوز' : 'Booked'}</span>
              </div>
              <span className="font-bold text-foreground">{bookedBooths}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="font-medium text-foreground">{isRTL ? 'متاح' : 'Available'}</span>
              </div>
              <span className="font-bold text-foreground">{availableBooths}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/20 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                <span className="font-medium text-foreground">{isRTL ? 'الإجمالي' : 'Total'}</span>
              </div>
              <span className="font-bold text-foreground">{totalBooths}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {isRTL ? 'أحدث الحجوزات' : 'Recent Bookings'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onGoToBookings} className="text-blue-600 hover:text-blue-700">
            {isRTL ? 'عرض كل الحجوزات والمستندات ←' : 'View All Bookings & Docs →'}
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <span className="animate-pulse">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</span>
          </div>
        ) : bookings.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{isRTL ? 'لا توجد أي حجوزات حالياً' : 'No bookings found'}</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:bg-accent/50 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{booking.entityName}</p>
                  <p className="text-sm text-muted-foreground mt-1" dir="ltr">
                    {booking.email} <span className="mx-1">•</span> {booking.booths?.length || 0}{' '}
                    {isRTL ? 'أجنحة' : 'booths'}
                  </p>
                </div>
                <div className="ms-4 flex items-center gap-4">
                  <div className="text-end">
                    <p className="font-bold text-foreground text-lg">
                      {booking.totalPrice.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{isRTL ? 'ر.س' : 'SAR'}</span>
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={booking.status} isRTL={isRTL} t={t} />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onGoToBookings}
                    className="h-8 gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {isRTL ? 'معاينة' : 'Review'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============== Bookings Panel ==============
function BookingsPanel({ isRTL, t }: { isRTL: boolean; t: (k: string) => string }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const res = await adminFetch('/api/admin/bookings')
      const data = await res.json()
      if (data.success) {
        setBookings(Array.isArray(data.data) ? data.data : [])
      }
    } catch {
      toast.error(isRTL ? 'خطأ في جلب الحجوزات' : 'Error fetching bookings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter)

  // Handle status update (can change to approved, rejected, or pending at any time!)
  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    const prevBookings = [...bookings];
    setActionLoadingId(id);

    // Optimistic Update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev: any) => ({ ...prev, status: newStatus }));
    }

    try {
      const res = await adminFetch('/api/admin/bookings', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (!data.success) {
        // Rollback
        setBookings(prevBookings);
        toast.error(isRTL ? 'فشل تحديث الحجز' : 'Failed to update booking')
      } else {
        if (newStatus === 'approved') {
          toast.success(isRTL ? '✅ تمت الموافقة على الحجز بنجاح وتم تأكيد حجز البوث' : 'Booking approved successfully')
        } else if (newStatus === 'rejected') {
          toast.success(isRTL ? '❌ تم تحويل الحجز إلى مرفوض وتم تحرير البوث' : 'Booking marked as rejected')
        } else {
          toast.success(isRTL ? '🔄 تمت إعادة الحجز إلى قيد المراجعة' : 'Booking status reset to pending')
        }
      }
    } catch {
      // Rollback
      setBookings(prevBookings);
      toast.error(isRTL ? 'حدث خطأ في الاتصال' : 'Network error')
    } finally {
      setActionLoadingId(null);
    }
  }

  const handleOpenDoc = (filePath: string | null | undefined, docName: string) => {
    if (!filePath) {
      toast.error(isRTL ? 'الملف غير متوفر أو لم يتم رفعه' : 'File is not available')
      return;
    }
    openOrDownloadFile(filePath, docName)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isRTL ? 'إدارة ومراجعة الحجوزات' : 'Bookings & Document Review'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? `عرض ${filteredBookings.length} حجز - يمكنك معاينة العقد وسند التحويل واتخاذ قرار القبول أو الرفض وتعديله بأي وقت`
              : `Showing ${filteredBookings.length} bookings - review signed contracts, receipts, and approve/reject`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl border border-border p-1.5 bg-card shadow-sm">
          {[
            { key: 'all', label: isRTL ? 'الكل' : 'All' },
            { key: 'pending', label: isRTL ? 'قيد المراجعة' : 'Pending' },
            { key: 'approved', label: isRTL ? 'موافق عليه' : 'Approved' },
            { key: 'rejected', label: isRTL ? 'مرفوض' : 'Rejected' },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-lg px-3.5 ${filter === tab.key ? 'shadow-sm bg-blue-600 text-white' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground animate-pulse">
            {isRTL ? 'جارٍ تحميل الحجوزات والمستندات...' : 'Loading bookings and documents...'}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/50 py-16 text-center shadow-sm">
            <p className="text-muted-foreground">{isRTL ? 'لا توجد أي حجوزات في هذا القسم' : 'No bookings in this section'}</p>
          </div>
        ) : (
          filteredBookings.map((booking: any) => {
            const hasContract = Boolean(booking.contractPath || booking.signedContractPath)
            const contractUrl = booking.contractPath || booking.signedContractPath
            const hasReceipt = Boolean(booking.receiptPath || booking.payment?.receiptPath)
            const receiptUrl = booking.receiptPath || booking.payment?.receiptPath

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-500/30 space-y-4"
              >
                {/* Top Section: Entity Details & Price */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/50 pb-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-xl text-foreground flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
                        {booking.entityName}
                      </span>
                      <StatusBadge status={booking.status} isRTL={isRTL} t={t} />
                      <span className="text-xs font-mono bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                        #{booking.id.substring(0, 8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs sm:text-sm text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="text-foreground font-medium">{booking.contactName}</span>
                        {booking.jobTitle && <span className="opacity-75">({booking.jobTitle})</span>}
                      </div>
                      <div className="flex items-center gap-1.5" dir="ltr">
                        <Phone className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span className="font-mono text-foreground font-medium">{booking.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5" dir="ltr">
                        <Mail className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{booking.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-70 font-mono">الرقم الموحد:</span>
                        <span className="font-mono font-medium text-foreground" dir="ltr">{booking.unifiedNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(booking.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {booking.address && (
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span className="truncate">{booking.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Booths list */}
                    {booking.booths && booking.booths.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-blue-500" />
                          {isRTL ? 'الأجنحة المحجوزة:' : 'Booths:'}
                        </span>
                        {booking.booths.map((booth: any) => (
                          <span
                            key={booth.id || booth.label}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          >
                            <span>{booth.label}</span>
                            <span className="text-[10px] font-normal opacity-80 font-mono">({booth.area} م²)</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total price badge */}
                  <div className="text-start sm:text-end shrink-0 bg-muted/40 p-3 sm:p-4 rounded-xl border border-border/50">
                    <span className="text-xs text-muted-foreground block mb-0.5">{isRTL ? 'الإجمالي المطلوب' : 'Total Price'}</span>
                    <span className="text-2xl font-black text-blue-600 tracking-tight">
                      {booking.totalPrice.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">{isRTL ? 'ر.س' : 'SAR'}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Section: Documents + Action Buttons */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-1">
                  {/* Documents Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold text-foreground opacity-90 me-1">
                      {isRTL ? 'المستندات المرفوعة:' : 'Uploaded Files:'}
                    </span>

                    {/* Contract Button */}
                    {hasContract ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDoc(contractUrl, `عقد-${booking.entityName}.pdf`)}
                        className="gap-2 border-orange-200 bg-orange-50/80 text-orange-800 hover:bg-orange-100 hover:border-orange-300 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900 shadow-sm h-9"
                      >
                        <FileText className="h-4 w-4 text-orange-600" />
                        <span className="font-bold">{isRTL ? 'معاينة العقد الموقع 📄' : 'Signed Contract 📄'}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic px-2 py-1 bg-muted/50 rounded-md">
                        {isRTL ? 'العقد غير مرفوع ⚠️' : 'No Contract ⚠️'}
                      </span>
                    )}

                    {/* Receipt Button */}
                    {hasReceipt ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDoc(receiptUrl, `سند-حوالة-${booking.entityName}.pdf`)}
                        className="gap-2 border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900 shadow-sm h-9"
                      >
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold">{isRTL ? 'معاينة سند الحوالة 💳' : 'Bank Receipt 💳'}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic px-2 py-1 bg-muted/50 rounded-md">
                        {isRTL ? 'سند الحوالة غير مرفوع ⚠️' : 'No Receipt ⚠️'}
                      </span>
                    )}

                    {/* Full details dialog trigger */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedBooking(booking)}
                      className="gap-1.5 text-muted-foreground hover:text-foreground h-9"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{isRTL ? 'تفاصيل كاملة' : 'Details'}</span>
                    </Button>
                  </div>

                  {/* Flexible Status Decision & Modification Actions */}
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    {/* If status is Pending */}
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5 h-9 font-bold px-4"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleStatusChange(booking.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4" />
                          {isRTL ? 'موافقة وتأكيد الحجز' : 'Approve Booking'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5 h-9 font-bold px-4"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleStatusChange(booking.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                          {isRTL ? 'رفض الحجز' : 'Reject Booking'}
                        </Button>
                      </>
                    )}

                    {/* If status is already Approved (Allow changing back to rejected or pending) */}
                    {(booking.status === 'approved' || booking.status === 'completed') && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          {isRTL ? 'تمت الموافقة مسبقاً' : 'Approved'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs gap-1"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleStatusChange(booking.id, 'rejected')}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {isRTL ? 'تعديل إلى مرفوض' : 'Change to Rejected'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground h-8 text-xs gap-1"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleStatusChange(booking.id, 'pending')}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {isRTL ? 'إعادة للمراجعة' : 'Reset to Pending'}
                        </Button>
                      </div>
                    )}

                    {/* If status is already Rejected (Allow changing back to approved or pending) */}
                    {booking.status === 'rejected' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                          {isRTL ? 'تم الرفض مسبقاً' : 'Rejected'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-8 text-xs gap-1"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleStatusChange(booking.id, 'approved')}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {isRTL ? 'تعديل إلى موافق عليه' : 'Change to Approved'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground h-8 text-xs gap-1"
                          disabled={actionLoadingId === booking.id}
                          onClick={() => handleStatusChange(booking.id, 'pending')}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {isRTL ? 'إعادة للمراجعة' : 'Reset to Pending'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Booking Full Details Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>{isRTL ? 'تفاصيل الحجز والمستندات' : 'Booking Details & Documents'}</span>
                <StatusBadge status={selectedBooking.status} isRTL={isRTL} t={t} />
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Entity Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">{isRTL ? 'اسم الجهة / الشركة' : 'Entity Name'}</span>
                  <p className="font-bold text-foreground text-base">{selectedBooking.entityName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">{isRTL ? 'الرقم الموحد (700)' : 'Unified Number'}</span>
                  <p className="font-mono font-bold text-foreground" dir="ltr">{selectedBooking.unifiedNumber}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">{isRTL ? 'جهة الاتصال' : 'Contact Person'}</span>
                  <p className="font-medium text-foreground">{selectedBooking.contactName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">{isRTL ? 'المسمى الوظيفي' : 'Job Title'}</span>
                  <p className="font-medium text-foreground">{selectedBooking.jobTitle || '---'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">{isRTL ? 'الجوال' : 'Mobile'}</span>
                  <p className="font-mono font-medium text-foreground" dir="ltr">{selectedBooking.mobile}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                  <p className="font-mono font-medium text-foreground truncate" dir="ltr">{selectedBooking.email}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block mb-1">{isRTL ? 'العنوان' : 'Address'}</span>
                  <p className="font-medium text-foreground">{selectedBooking.address || '---'}</p>
                </div>
              </div>

              {/* Booths and Price */}
              <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                <h4 className="font-bold text-sm text-foreground">{isRTL ? 'الأجنحة المختارة' : 'Selected Booths'}</h4>
                {selectedBooking.booths && selectedBooking.booths.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.booths.map((booth: any) => (
                      <div key={booth.id || booth.label} className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                        {booth.label} - {booth.area} م²
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{isRTL ? 'تم حفظ معرفات البوثات' : 'Booths recorded'}</p>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-bold text-muted-foreground">{isRTL ? 'إجمالي السعر:' : 'Total Price:'}</span>
                  <span className="text-xl font-black text-blue-600">{selectedBooking.totalPrice.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}</span>
                </div>
              </div>

              {/* Documents Action Section */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
                <h4 className="font-bold text-sm text-foreground">{isRTL ? 'المستندات المرفقة للمراجعة' : 'Attached Documents'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Contract */}
                  <div className="p-3 bg-card rounded-lg border border-border flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-foreground mb-0.5">{isRTL ? 'وثيقة العقد الموقع' : 'Signed Contract'}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedBooking.contractPath || selectedBooking.signedContractPath
                          ? (isRTL ? 'تم رفع العقد من قبل العميل' : 'Contract uploaded')
                          : (isRTL ? 'لم يتم رفع العقد' : 'Not uploaded')}
                      </p>
                    </div>
                    {(selectedBooking.contractPath || selectedBooking.signedContractPath) && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenDoc(selectedBooking.contractPath || selectedBooking.signedContractPath, `عقد-${selectedBooking.entityName}.pdf`)}
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-2 w-full text-xs font-bold"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {isRTL ? 'فتح ومعاينة العقد' : 'Open Contract'}
                      </Button>
                    )}
                  </div>

                  {/* Receipt */}
                  <div className="p-3 bg-card rounded-lg border border-border flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-foreground mb-0.5">{isRTL ? 'إيصال / سند الحوالة' : 'Bank Transfer Receipt'}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedBooking.receiptPath || selectedBooking.payment?.receiptPath
                          ? (isRTL ? 'تم رفع سند التحويل البنكي' : 'Receipt uploaded')
                          : (isRTL ? 'لم يتم رفع السند' : 'Not uploaded')}
                      </p>
                    </div>
                    {(selectedBooking.receiptPath || selectedBooking.payment?.receiptPath) && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenDoc(selectedBooking.receiptPath || selectedBooking.payment?.receiptPath, `سند-${selectedBooking.entityName}.pdf`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full text-xs font-bold"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        {isRTL ? 'فتح ومعاينة السند' : 'Open Receipt'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Decision Controls */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border justify-end">
                <Button
                  onClick={() => handleStatusChange(selectedBooking.id, 'approved')}
                  disabled={selectedBooking.status === 'approved' || actionLoadingId === selectedBooking.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isRTL ? 'موافقة على الحجز' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedBooking.id, 'rejected')}
                  disabled={selectedBooking.status === 'rejected' || actionLoadingId === selectedBooking.id}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 font-bold"
                >
                  <XCircle className="h-4 w-4" />
                  {isRTL ? 'رفض الحجز' : 'Reject'}
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedBooking.id, 'pending')}
                  disabled={selectedBooking.status === 'pending' || actionLoadingId === selectedBooking.id}
                  variant="ghost"
                  className="text-muted-foreground gap-1.5 font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  {isRTL ? 'إعادة للمراجعة' : 'Reset'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ============== Status Badge ==============
function StatusBadge({
  status,
  isRTL,
  t,
}: {
  status: string
  isRTL: boolean
  t: (key: string) => string
}) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20',
    approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  }
  const labels: Record<string, string> = {
    pending: isRTL ? 'قيد المراجعة' : 'Pending',
    approved: isRTL ? 'موافق عليه' : 'Approved',
    rejected: isRTL ? 'مرفوض' : 'Rejected',
    completed: isRTL ? 'مكتمل' : 'Completed',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${colors[status] || 'bg-muted text-muted-foreground border border-border'}`}
    >
      {labels[status] || t(`admin.${status}`)}
    </span>
  )
}
