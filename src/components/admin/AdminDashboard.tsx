'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Eye,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

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

interface AdminDashboardProps {
  onLogout: () => void
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { t, isRTL } = useTranslation()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) {
        setBookings(data.data)
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
        fetchBookings()
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setActionLoading(null)
    }
  }

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter)

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length
  const approvedBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'completed').length
  const totalRevenue = bookings
    .filter((b) => b.status === 'approved' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  const stats = [
    { label: t('admin.totalBookings'), value: totalBookings, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('admin.pendingCount'), value: pendingBookings, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: t('admin.approvedCount'), value: approvedBookings, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t('admin.totalRevenue'), value: `${totalRevenue.toLocaleString()} ${t('common.sar')}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        isRTL ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      )
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <LayoutDashboard className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t('admin.dashboard')}</h2>
            <p className="text-sm text-gray-500">{t('admin.bookings')}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onLogout} className="text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="me-2 h-4 w-4" />
          {t('admin.logout')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">{t('admin.all')}</TabsTrigger>
            <TabsTrigger value="pending">{t('admin.pending')}</TabsTrigger>
            <TabsTrigger value="approved">{t('admin.approved')}</TabsTrigger>
            <TabsTrigger value="rejected">{t('admin.rejected')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-sm text-gray-500">
          {filteredBookings.length} {isRTL ? 'حجز' : 'bookings'}
        </span>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {t('admin.noBookings')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.entityName')}</TableHead>
                    <TableHead>{t('booking.unifiedNumber')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('admin.contact')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('admin.booths')}</TableHead>
                    <TableHead>{t('admin.totalPrice')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead className="text-end">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const boothLabels = booking.booths
                      ? booking.booths.map((b) => b.label).join(', ')
                      : ''
                    const isExpanded = expandedId === booking.id

                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                              className="flex items-center gap-1 font-medium text-gray-800 hover:text-orange-600"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              {booking.entityName}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm" dir="ltr">{booking.unifiedNumber}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            <div>{booking.contactName}</div>
                            <div className="text-gray-500" dir="ltr">{booking.mobile}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {boothLabels && (
                            <div className="flex flex-wrap gap-1">
                              {boothLabels.split(', ').map((label) => (
                                <Badge key={label} variant="outline" className="bg-orange-50 text-orange-700">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {booking.totalPrice.toLocaleString()} {t('common.sar')}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[booking.status] || ''} variant="outline">
                            {t(`admin.${booking.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailBooking(booking)}
                              title={t('admin.viewFiles')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => handleAction(booking.id, 'approve')}
                                  disabled={actionLoading === booking.id}
                                >
                                  {actionLoading === booking.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleAction(booking.id, 'reject')}
                                  disabled={actionLoading === booking.id}
                                >
                                  {actionLoading === booking.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Details Dialog */}
      {detailBooking && (
        <Dialog open={!!detailBooking} onOpenChange={() => setDetailBooking(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('admin.bookingDetails')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('booking.entityName')}</span>
                  <p className="font-medium">{detailBooking.entityName}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('booking.unifiedNumber')}</span>
                  <p className="font-medium font-mono" dir="ltr">{detailBooking.unifiedNumber}</p>
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
                <div className="col-span-2">
                  <span className="text-gray-500">{t('booking.address')}</span>
                  <p className="font-medium">{detailBooking.address}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="mb-2 font-semibold text-gray-700">{t('admin.booths')}</h4>
                {detailBooking.booths && (
                  <div className="flex flex-wrap gap-2">
                    {detailBooking.booths.map((booth) => (
                      <Badge key={booth.id} variant="outline" className="bg-orange-50 text-orange-700">
                        {booth.label} ({booth.area} {t('boothMap.sqm')})
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-sm">
                  <span className="text-gray-500">{t('admin.totalPrice')}:</span>{' '}
                  <span className="font-bold text-orange-600">{detailBooking.totalPrice.toLocaleString()} {t('common.sar')}</span>
                </p>
              </div>

              {/* Files */}
              <div className="border-t pt-3">
                <h4 className="mb-2 font-semibold text-gray-700">{t('admin.viewFiles')}</h4>
                <div className="flex gap-2">
                  {detailBooking.contractPath && (
                    <a
                      href={detailBooking.contractPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-700 transition-colors hover:bg-orange-100"
                    >
                      <FileText className="h-4 w-4" />
                      {t('admin.contractFile')}
                    </a>
                  )}
                  {detailBooking.receiptPath && (
                    <a
                      href={detailBooking.receiptPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-700 transition-colors hover:bg-orange-100"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {t('admin.receiptFile')}
                    </a>
                  )}
                  {!detailBooking.contractPath && !detailBooking.receiptPath && (
                    <span className="text-sm text-gray-500">{t('common.noData')}</span>
                  )}
                </div>
              </div>

              <div className="border-t pt-3 text-sm">
                <span className="text-gray-500">{t('admin.createdAt')}:</span>{' '}
                <span>{formatDate(detailBooking.createdAt)}</span>
              </div>

              {/* Actions */}
              {detailBooking.status === 'pending' && (
                <div className="flex gap-2 border-t pt-4">
                  <Button
                    onClick={() => {
                      handleAction(detailBooking.id, 'approve')
                      setDetailBooking(null)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={actionLoading === detailBooking.id}
                  >
                    <CheckCircle className="me-2 h-4 w-4" />
                    {t('admin.approve')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleAction(detailBooking.id, 'reject')
                      setDetailBooking(null)
                    }}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    disabled={actionLoading === detailBooking.id}
                  >
                    <XCircle className="me-2 h-4 w-4" />
                    {t('admin.reject')}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
