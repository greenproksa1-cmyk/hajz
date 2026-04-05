'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import AdminSidebar from './AdminSidebar'
import FloorPlanManager from './FloorPlanManager'
import BoothManagement from './BoothManagement'
import PaymentManagement from './PaymentManagement'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    <div dir={dir} className="flex h-[calc(100vh-3rem)] overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-3 sm:p-4 lg:p-6 w-full max-w-[1800px] mx-auto">{renderContent()}</div>
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
      if (bookingsData.success) setBookings(bookingsData.data)
      if (boothsData.success) setBooths(boothsData.data)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length
  const approvedBookings = bookings.filter(
    (b: any) => b.status === 'approved' || b.status === 'completed'
  ).length
  const totalRevenue = bookings
    .filter((b: any) => b.status === 'approved' || b.status === 'completed')
    .reduce((sum: number, b: any) => sum + b.totalPrice, 0)

  const availableBooths = booths.filter((b: any) => b.status === 'available').length
  const bookedBooths = booths.filter((b: any) => b.status === 'booked').length

  const stats = [
    {
      label: t('admin.totalBookings'),
      value: totalBookings,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t('admin.pendingCount'),
      value: pendingBookings,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: t('admin.approvedCount'),
      value: approvedBookings,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: t('admin.totalRevenue'),
      value: `${totalRevenue.toLocaleString()} ${t('common.sar')}`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isRTL ? 'نظرة عامة' : 'Overview'}
        </h2>
        <p className="text-sm text-gray-500">
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
            className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Booth occupancy */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">
          {isRTL ? 'إشغال الأجنحة' : 'Booth Occupancy'}
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#f97316"
                strokeWidth="12"
                strokeDasharray={`${(bookedBooths / Math.max(booths.length, 1)) * 314} 314`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {Math.round((bookedBooths / Math.max(booths.length, 1)) * 100)}%
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-sm text-gray-600">{isRTL ? 'محجوز' : 'Booked'}</span>
              </div>
              <span className="font-semibold">{bookedBooths}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">{isRTL ? 'متاح' : 'Available'}</span>
              </div>
              <span className="font-semibold">{availableBooths}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-300" />
                <span className="text-sm text-gray-600">{isRTL ? 'الإجمالي' : 'Total'}</span>
              </div>
              <span className="font-semibold">{booths.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">
          {isRTL ? 'أحدث الحجوزات' : 'Recent Bookings'}
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            {t('common.loading')}
          </div>
        ) : bookings.length === 0 ? (
          <p className="py-8 text-center text-gray-400">{t('admin.noBookings')}</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-800">{booking.entityName}</p>
                  <p className="text-xs text-gray-500" dir="ltr">
                    {booking.email} · {booking.booths?.length || 0}{' '}
                    {isRTL ? 'أجنحة' : 'booths'}
                  </p>
                </div>
                <div className="ms-4 text-end">
                  <p className="font-semibold text-gray-800">
                    {booking.totalPrice.toLocaleString()} {t('common.sar')}
                  </p>
                  <StatusBadge status={booking.status} isRTL={isRTL} t={t} />
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
      if (data.success) setBookings(data.data)
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
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchBookings()
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('admin.bookings')}</h2>
          <p className="text-sm text-gray-500">
            {filteredBookings.length} {isRTL ? 'حجز' : 'bookings'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {t(`admin.${status}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">
            {t('common.loading')}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl border bg-white py-16 text-center shadow-sm">
            <p className="text-gray-500">{t('admin.noBookings')}</p>
          </div>
        ) : (
          filteredBookings.map((booking: any) => (
            <div
              key={booking.id}
              className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{booking.entityName}</p>
                    <StatusBadge status={booking.status} isRTL={isRTL} t={t} />
                  </div>
                  <p className="text-sm text-gray-500" dir="ltr">
                    {booking.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="text-gray-400">{t('booking.mobile')}:</span>{' '}
                    <span dir="ltr">{booking.mobile}</span>
                  </p>
                  {booking.booths && booking.booths.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {booking.booths.map((booth: any) => (
                        <span
                          key={booth.id}
                          className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700"
                        >
                          {booth.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <div className="text-end">
                    <p className="font-bold text-gray-800">
                      {booking.totalPrice.toLocaleString()} {t('common.sar')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString(
                        isRTL ? 'ar-SA' : 'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </p>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="h-8 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(booking.id, 'approve')}
                      >
                        {t('admin.approve')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-red-200 text-red-600 hover:bg-red-50"
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
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  }
  const labels: Record<string, string> = {
    pending: isRTL ? 'قيد المراجعة' : 'Pending',
    approved: isRTL ? 'موافق عليه' : 'Approved',
    rejected: isRTL ? 'مرفوض' : 'Rejected',
    completed: isRTL ? 'مكتمل' : 'Completed',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {labels[status] || t(`admin.${status}`)}
    </span>
  )
}
