'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  Loader2,
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Inbox,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import BookingTracker from './BookingTracker'
import BookingHistoryTable from './BookingHistoryTable'
import PaymentInstructions from './PaymentInstructions'
import FilePreview from '@/components/shared/FilePreview'

interface Booking {
  id: string
  entityName: string
  unifiedNumber: string
  address: string
  contactName: string
  jobTitle: string
  mobile: string
  phone: string
  email: string
  boothIds: string
  totalPrice: number
  status: string
  contractPath: string | null
  receiptPath: string | null
  otpVerified: boolean
  createdAt: string
  updatedAt: string
  booths?: Array<{ id: string; label: string; area: number }>
}

interface UserDashboardProps {
  email: string | null
  onBack: () => void
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
}

export default function UserDashboard({ email, onBack }: UserDashboardProps) {
  const { t, isRTL, lang } = useTranslation()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)

  const fetchBookings = useCallback(async () => {
    if (!email) {
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) {
        // Filter by email client-side
        const userBookings = data.data.filter(
          (b: Booking) => b.email.toLowerCase() === email.toLowerCase()
        )
        setBookings(userBookings)
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }, [email, t])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      b.entityName.toLowerCase().includes(query) ||
      b.id.toLowerCase().includes(query)
    return matchesStatus && matchesSearch
  })

  // Stats
  const totalBookings = bookings.length
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const approvedCount = bookings.filter(
    (b) => b.status === 'approved' || b.status === 'completed'
  ).length
  const rejectedCount = bookings.filter((b) => b.status === 'rejected').length

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        isRTL ? 'ar-SA' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    } catch {
      return dateStr
    }
  }

  const handleDownloadContract = async (booking: Booking) => {
    if (!booking.contractPath) {
      toast.error(isRTL ? 'لا يوجد عقد متاح' : 'No contract available')
      return
    }
    try {
      const response = await fetch(booking.contractPath)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `contract-${booking.entityName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: isRTL ? 'قيد المراجعة' : 'Pending',
      approved: isRTL ? 'موافق عليه' : 'Approved',
      rejected: isRTL ? 'مرفوض' : 'Rejected',
      completed: isRTL ? 'مكتمل' : 'Completed',
    }
    return map[status] || status
  }

  const ArrowBack = isRTL ? ArrowRight : ArrowLeft

  const stats = [
    {
      label: isRTL ? 'إجمالي الحجوزات' : 'Total Bookings',
      value: totalBookings,
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: isRTL ? 'قيد المراجعة' : 'Pending',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: isRTL ? 'موافق عليها' : 'Approved',
      value: approvedCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: isRTL ? 'مرفوضة' : 'Rejected',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <LayoutDashboard className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? 'لوحة المستخدم' : 'My Dashboard'}
            </h2>
            <p className="text-sm text-gray-500" dir="ltr">
              {email}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowBack className="me-2 h-4 w-4" />
          {t('common.back')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={
              isRTL
                ? 'ابحث برقم الحجز أو اسم الجهة...'
                : 'Search by booking ID or entity name...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">{isRTL ? 'الكل' : 'All'}</TabsTrigger>
            <TabsTrigger value="pending">{isRTL ? 'قيد المراجعة' : 'Pending'}</TabsTrigger>
            <TabsTrigger value="approved">{isRTL ? 'موافق عليه' : 'Approved'}</TabsTrigger>
            <TabsTrigger value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Booking List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Inbox className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">
              {isRTL ? 'لا توجد حجوزات' : 'No Bookings Found'}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? isRTL
                  ? 'جرّب تغيير معايير البحث'
                  : 'Try adjusting your search criteria'
                : isRTL
                  ? 'لم تقم بأي حجز بعد'
                  : 'You have not made any bookings yet'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {filteredBookings.map((booking) => {
              const boothLabels = booking.booths
                ? booking.booths.map((b) => b.label)
                : []
              const isExpanded = expandedId === booking.id

              return (
                <Card
                  key={booking.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-800">
                          {booking.entityName}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500" dir="ltr">
                          ID: {booking.id.slice(0, 10)}...
                        </p>
                      </div>
                      <Badge
                        className={STATUS_COLORS[booking.status] || ''}
                        variant="outline"
                      >
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>

                    {/* Booths */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {boothLabels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="bg-orange-50 text-orange-700 text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>

                    {/* Price & Date */}
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          {isRTL ? 'المبلغ' : 'Amount'}
                        </p>
                        <p className="text-sm font-bold text-blue-700">
                          {booking.totalPrice.toLocaleString()} {t('common.sar')}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-xs text-gray-500">
                          {isRTL ? 'التاريخ' : 'Date'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : booking.id)
                      }
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-gray-100 bg-gray-50 py-2 text-xs text-gray-500 transition-colors hover:bg-orange-50 hover:text-blue-700"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          {isRTL ? 'إخفاء التفاصيل' : 'Hide Details'}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </>
                      )}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 space-y-4">
                        {/* Booking Tracker */}
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            {isRTL ? 'حالة الحجز' : 'Booking Status'}
                          </h4>
                          <BookingTracker booking={booking} lang={lang} />
                        </div>

                        {/* Files */}
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            {isRTL ? 'الملفات' : 'Files'}
                          </h4>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <FilePreview
                              filePath={booking.contractPath}
                              fileName={isRTL ? 'العقد الموقع' : 'Signed Contract'}
                            />
                            <FilePreview
                              filePath={booking.receiptPath}
                              fileName={isRTL ? 'إيصال الدفع' : 'Payment Receipt'}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 text-blue-700 border-orange-200 hover:bg-orange-50"
                            onClick={() => setDetailBooking(booking)}
                          >
                            <Eye className="me-2 h-4 w-4" />
                            {isRTL ? 'عرض كامل' : 'Full View'}
                          </Button>
                          {booking.contractPath && (
                            <Button
                              variant="outline"
                              className="flex-1 border-orange-200 text-blue-700 hover:bg-orange-50"
                              onClick={() => handleDownloadContract(booking)}
                            >
                              <Download className="me-2 h-4 w-4" />
                              {isRTL ? 'تحميل العقد' : 'Download Contract'}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Desktop: History Table */}
          <div className="hidden md:block">
            <BookingHistoryTable
              bookings={filteredBookings}
              onViewDetails={(b) => setDetailBooking(b)}
              onDownloadContract={handleDownloadContract}
            />
          </div>
        </>
      )}

      {/* Detail Dialog */}
      {detailBooking && (
        <Dialog open={!!detailBooking} onOpenChange={() => setDetailBooking(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isRTL ? 'تفاصيل الحجز' : 'Booking Details'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('admin.status')}:</span>
                  <Badge
                    className={STATUS_COLORS[detailBooking.status] || ''}
                    variant="outline"
                  >
                    {getStatusLabel(detailBooking.status)}
                  </Badge>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(detailBooking.createdAt)}
                </span>
              </div>

              {/* Booking Tracker */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {isRTL ? 'رحلة الحجز' : 'Booking Journey'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingTracker booking={detailBooking} lang={lang} />
                </CardContent>
              </Card>

              {/* Entity Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {isRTL ? 'معلومات الجهة' : 'Entity Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-gray-500">{t('booking.entityName')}</span>
                      <p className="font-medium">{detailBooking.entityName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('booking.unifiedNumber')}</span>
                      <p className="font-mono font-medium" dir="ltr">{detailBooking.unifiedNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('booking.contactName')}</span>
                      <p className="font-medium">{detailBooking.contactName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('booking.jobTitle')}</span>
                      <p className="font-medium">{detailBooking.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('booking.mobile')}</span>
                      <p className="font-medium" dir="ltr">{detailBooking.mobile}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('booking.email')}</span>
                      <p className="font-medium" dir="ltr">{detailBooking.email}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">{t('booking.address')}</span>
                      <p className="font-medium">{detailBooking.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booths */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {isRTL ? 'الأجنحة المحجوزة' : 'Booked Booths'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detailBooking.booths && detailBooking.booths.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detailBooking.booths.map((booth) => (
                        <Badge
                          key={booth.id}
                          variant="outline"
                          className="bg-orange-50 text-orange-700"
                        >
                          {booth.label} ({booth.area} {t('boothMap.sqm')})
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{t('common.noData')}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {t('boothMap.totalPrice')}
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {detailBooking.totalPrice.toLocaleString()} {t('common.sar')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Instructions (only for pending) */}
              {detailBooking.status === 'pending' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {isRTL ? 'تعليمات الدفع' : 'Payment Instructions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentInstructions
                      amount={detailBooking.totalPrice}
                      currency={t('common.sar')}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Files */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {isRTL ? 'الملفات المرفقة' : 'Attached Files'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-500">
                        {isRTL ? 'العقد' : 'Contract'}
                      </p>
                      <FilePreview
                        filePath={detailBooking.contractPath}
                        fileName={`${isRTL ? 'عقد' : 'Contract'}-${detailBooking.entityName}.pdf`}
                        uploadDate={formatDate(detailBooking.createdAt)}
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-500">
                        {isRTL ? 'إيصال الدفع' : 'Payment Receipt'}
                      </p>
                      <FilePreview
                        filePath={detailBooking.receiptPath}
                        fileName={`${isRTL ? 'إيصال' : 'Receipt'}-${detailBooking.entityName}.pdf`}
                        uploadDate={formatDate(detailBooking.createdAt)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 border-t pt-4">
                {detailBooking.contractPath && (
                  <Button
                    onClick={() => handleDownloadContract(detailBooking)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="me-2 h-4 w-4" />
                    {isRTL ? 'تحميل العقد' : 'Download Contract'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setDetailBooking(null)}
                  className="flex-1"
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
