'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface Booking {
  id: string
  entityName: string
  unifiedNumber: string
  boothIds: string
  totalPrice: number
  status: string
  createdAt: string
  contractPath: string | null
  receiptPath: string | null
  booths?: Array<{ id: string; label: string; area: number }>
}

interface BookingHistoryTableProps {
  bookings: Booking[]
  onViewDetails: (booking: Booking) => void
  onDownloadContract: (booking: Booking) => void
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
}

const ITEMS_PER_PAGE = 5

export default function BookingHistoryTable({
  bookings,
  onViewDetails,
  onDownloadContract,
}: BookingHistoryTableProps) {
  const { t, isRTL } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedBookings = bookings.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        isRTL ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      )
    } catch {
      return dateStr
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

  if (bookings.length === 0) {
    return null
  }

  // Mobile Card View
  const MobileCard = ({ booking }: { booking: Booking }) => {
    const boothLabels = booking.booths
      ? booking.booths.map((b) => b.label)
      : []
    const isExpanded = expandedId === booking.id

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">
                {booking.entityName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {formatDate(booking.createdAt)}
              </p>
            </div>
            <Badge className={STATUS_COLORS[booking.status] || ''} variant="outline">
              {getStatusLabel(booking.status)}
            </Badge>
          </div>

          {/* Booth badges */}
          {boothLabels.length > 0 && (
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
          )}

          {/* Price */}
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <span className="text-sm font-bold text-blue-700">
              {booking.totalPrice.toLocaleString()} {t('common.sar')}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(booking)}
                className="h-8 px-2 text-blue-700 hover:bg-orange-50"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {booking.contractPath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadContract(booking)}
                  className="h-8 px-2 text-blue-700 hover:bg-orange-50"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpandedId(isExpanded ? null : booking.id)}
            className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-gray-500 hover:text-blue-700"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                {isRTL ? 'إخفاء' : 'Show Less'}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                {isRTL ? 'المزيد' : 'Show More'}
              </>
            )}
          </button>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  {isRTL ? 'رقم الحجز' : 'Booking ID'}
                </span>
                <span className="font-mono" dir="ltr">
                  {booking.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('booking.unifiedNumber')}</span>
                <span className="font-mono" dir="ltr">
                  {booking.unifiedNumber}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table - hidden on mobile */}
      <div className="hidden overflow-x-auto md:block">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16">
                  {isRTL ? 'رقم' : 'ID'}
                </TableHead>
                <TableHead>
                  {isRTL ? 'الجهة' : 'Entity'}
                </TableHead>
                <TableHead>
                  {isRTL ? 'الأجنحة' : 'Booths'}
                </TableHead>
                <TableHead>
                  {isRTL ? 'المبلغ' : 'Amount'}
                </TableHead>
                <TableHead>
                  {t('admin.status')}
                </TableHead>
                <TableHead>
                  {isRTL ? 'التاريخ' : 'Date'}
                </TableHead>
                <TableHead className="text-end">
                  {isRTL ? 'إجراءات' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking, index) => {
                const boothLabels = booking.booths
                  ? booking.booths.map((b) => b.label)
                  : []
                const isExpanded = expandedId === booking.id

                return (
                  <TableRow
                    key={booking.id}
                    className={index % 2 === 1 ? 'bg-gray-50/50' : ''}
                  >
                    <TableCell>
                      <span
                        className="font-mono text-xs text-gray-500"
                        dir="ltr"
                      >
                        {booking.id.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : booking.id)
                          }
                          className="font-medium text-gray-800 hover:text-blue-700"
                        >
                          {booking.entityName}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {boothLabels.length > 0 ? (
                          boothLabels.map((label) => (
                            <Badge
                              key={label}
                              variant="outline"
                              className="bg-orange-50 text-orange-700 text-xs"
                            >
                              {label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-800">
                        {booking.totalPrice.toLocaleString()} {t('common.sar')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={STATUS_COLORS[booking.status] || ''}
                        variant="outline"
                      >
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(booking.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(booking)}
                          className="h-8 px-2 text-blue-700 hover:bg-orange-50"
                          title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {booking.contractPath && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadContract(booking)}
                            className="h-8 px-2 text-blue-700 hover:bg-orange-50"
                            title={isRTL ? 'تحميل العقد' : 'Download Contract'}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards - shown only on mobile */}
      <div className="space-y-3 md:hidden">
        {paginatedBookings.map((booking) => (
          <MobileCard key={booking.id} booking={booking} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isRTL
              ? `عرض ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, bookings.length)} من ${bookings.length}`
              : `Showing ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, bookings.length)} of ${bookings.length}`}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2"
            >
              {isRTL ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 p-0 ${
                  currentPage === page
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : ''
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2"
            >
              {isRTL ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
