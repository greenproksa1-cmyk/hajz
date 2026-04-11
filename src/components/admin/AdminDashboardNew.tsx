'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import AdminSidebar from './AdminSidebar'
import FloorPlanManager from './FloorPlanManager'
import BoothManagement from './BoothManagement'
import PaymentManagement from './PaymentManagement'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import ErrorBoundary from '@/components/ErrorBoundary'

interface AdminDashboardNewProps {
  onLogout: () => void
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
        return <BookingsPanel />
      case 'dashboard':
      default:
        return <OverviewPanel />
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
function OverviewPanel() {
  const { t, isRTL } = useTranslation()
  const [bookings, setBookings] = useState<any[]>([])
  const [booths, setBooths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [bookingsRes, boothsRes] = await Promise.all([
        fetch('/api/bookings'),
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
      label: t('admin.totalBookings'),
      value: totalBookings,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500',
    },
    {
      label: t('admin.pendingCount'),
      value: pendingBookings,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-500',
    },
    {
      label: t('admin.approvedCount'),
      value: approvedBookings,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-500',
    },
    {
      label: t('admin.totalRevenue'),
      value: `${totalRevenue.toLocaleString()} ${t('common.sar')}`,
      color: 'text-blue-700 dark:text-blue-500',
      bg: 'bg-blue-600',
    },
  ]

  const occupancyRate = totalBooths > 0 ? Math.round((bookedBooths / totalBooths) * 100) : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {isRTL ? 'نظرة عامة' : 'Overview'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRTL
            ? 'ملخص سريع لحالة المعرض والحجوزات'
            : 'Quick summary of exhibition status and bookings'}
        </p>
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
                stroke="#f97316"
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
            <div className="flex items-center justify-between rounded-lg bg-blue-600/10 px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
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

      {/* Recent Bookings */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          {isRTL ? 'أحدث الحجوزات' : 'Recent Bookings'}
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <span className="animate-pulse">{t('common.loading')}</span>
          </div>
        ) : bookings.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{t('admin.noBookings')}</p>
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
                <div className="ms-4 text-end">
                  <p className="font-bold text-foreground text-lg">
                    {booking.totalPrice.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{t('common.sar')}</span>
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={booking.status} isRTL={isRTL} t={t} />
                  </div>
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
function BookingsPanel() {
  const { t, isRTL } = useTranslation()
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) {
        setBookings(Array.isArray(data.data) ? data.data : [])
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter)

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const prevBookings = [...bookings];
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Optimistic Update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
        }),
      })
      const data = await res.json()
      if (data.success) {
        // Success
      } else {
        // Rollback
        setBookings(prevBookings);
      }
    } catch {
      // Rollback
      setBookings(prevBookings);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('admin.bookings')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredBookings.length} {isRTL ? 'حجز' : 'bookings'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 rounded-lg border border-border p-1 bg-card/50 backdrop-blur-sm">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-md ${filter === status ? 'shadow-sm' : ''}`}
              onClick={() => setFilter(status)}
            >
              {t(`admin.${status}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            {t('common.loading')}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/50 py-16 text-center shadow-sm">
            <p className="text-muted-foreground">{t('admin.noBookings')}</p>
          </div>
        ) : (
          filteredBookings.map((booking: any) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-foreground">{booking.entityName}</p>
                    <StatusBadge status={booking.status} isRTL={isRTL} t={t} />
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <p dir="ltr" className="flex items-center gap-1">
                      <span className="opacity-70">@</span> {booking.email}
                    </p>
                    <p>
                      <span className="opacity-70">{t('booking.mobile')}:</span>{' '}
                      <span dir="ltr">{booking.mobile}</span>
                    </p>
                  </div>
                  {booking.booths && booking.booths.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {booking.booths.map((booth: any) => (
                        <span
                          key={booth.id}
                          className="inline-flex items-center rounded-md bg-blue-600/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-500 border border-blue-600/20"
                        >
                          {booth.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-3 sm:gap-4">
                  <div className="text-end">
                    <p className="text-2xl font-bold text-foreground">
                      {booking.totalPrice.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-muted-foreground">{t('common.sar')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(booking.createdAt).toLocaleDateString(
                        isRTL ? 'ar-SA' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </p>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-9 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        onClick={() => handleAction(booking.id, 'approve')}
                      >
                        {t('admin.approve')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:border-red-900 shadow-sm"
                        onClick={() => handleAction(booking.id, 'reject')}
                      >
                        {t('admin.reject')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
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
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  }
  const labels: Record<string, string> = {
    pending: isRTL ? 'قيد المراجعة' : 'Pending',
    approved: isRTL ? 'موافق عليه' : 'Approved',
    rejected: isRTL ? 'مرفوض' : 'Rejected',
    completed: isRTL ? 'مكتمل' : 'Completed',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || 'bg-muted text-muted-foreground border border-border'}`}
    >
      {labels[status] || t(`admin.${status}`)}
    </span>
  )
}
