'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  FileText,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentRecord {
  id: string
  bookingId: string
  entityName: string
  amount: number
  status: 'pending' | 'verified' | 'rejected'
  receiptPath: string | null
  contractPath: string | null
  bookingStatus: string
  createdAt: string
}

const PAYMENT_STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  verified: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
}

export default function PaymentManagement() {
  const { t, isRTL } = useTranslation()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [receiptDialog, setReceiptDialog] = useState<PaymentRecord | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) {
        // Transform bookings into payment records
        const paymentRecords: PaymentRecord[] = data.data
          .filter((b: { receiptPath: string | null }) => b.receiptPath || b.contractPath)
          .map((b: {
            id: string
            entityName: string
            totalPrice: number
            status: string
            receiptPath: string | null
            contractPath: string | null
            createdAt: string
          }) => ({
            id: b.id,
            bookingId: b.id,
            entityName: b.entityName,
            amount: b.totalPrice,
            status: (b.status === 'approved' || b.status === 'completed' ? 'verified' : b.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'verified' | 'rejected',
            receiptPath: b.receiptPath,
            contractPath: b.contractPath,
            bookingStatus: b.status,
            createdAt: b.createdAt,
          }))
        setPayments(paymentRecords)
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const filteredPayments =
    statusFilter === 'all'
      ? payments
      : payments.filter((p) => p.status === statusFilter)

  const handleVerify = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', paymentStatus: 'verified' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
        fetchPayments()
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', paymentStatus: 'rejected' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('common.success'))
        fetchPayments()
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    }
  }

  const statusCounts = {
    all: payments.length,
    pending: payments.filter((p) => p.status === 'pending').length,
    verified: payments.filter((p) => p.status === 'verified').length,
    rejected: payments.filter((p) => p.status === 'rejected').length,
  }

  const totalVerified = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

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

  const isImageFile = (path: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <CreditCard className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? 'إدارة المدفوعات' : 'Payment Management'}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL ? 'مراجعة وإدارة المدفوعات والحوالات البنكية' : 'Review and manage payments and bank transfers'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{isRTL ? 'الإجمالي' : 'Total'}</p>
              <p className="text-lg font-bold">{statusCounts.all}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-yellow-600">{isRTL ? 'قيد المراجعة' : 'Pending'}</p>
              <p className="text-lg font-bold text-yellow-700">{statusCounts.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600">{isRTL ? 'تم التحقق' : 'Verified'}</p>
              <p className="text-lg font-bold text-green-700">{statusCounts.verified}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-red-600">{isRTL ? 'مرفوض' : 'Rejected'}</p>
              <p className="text-lg font-bold text-red-700">{statusCounts.rejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-green-600">{isRTL ? 'إيرادات محققة' : 'Verified Revenue'}</p>
              <p className="text-2xl font-bold text-green-700">
                {totalVerified.toLocaleString()} {t('common.sar')}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-300" />
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-yellow-600">{isRTL ? 'بانتظار المراجعة' : 'Pending Amount'}</p>
              <p className="text-2xl font-bold text-yellow-700">
                {totalPending.toLocaleString()} {t('common.sar')}
              </p>
            </div>
            <Clock className="h-10 w-10 text-yellow-300" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'جميع المدفوعات' : 'All Payments'}</SelectItem>
                <SelectItem value="pending">{isRTL ? 'قيد المراجعة' : 'Pending'}</SelectItem>
                <SelectItem value="verified">{isRTL ? 'تم التحقق' : 'Verified'}</SelectItem>
                <SelectItem value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-gray-500">
            {filteredPayments.length} {isRTL ? 'دفعة' : 'payments'}
          </span>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>{isRTL ? 'لا توجد مدفوعات' : 'No payments found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'رقم الحجز' : 'Booking ID'}</TableHead>
                    <TableHead>{t('admin.entityName')}</TableHead>
                    <TableHead>{t('admin.payments.amount')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead>{t('admin.payments.receipt')}</TableHead>
                    <TableHead>{t('admin.createdAt')}</TableHead>
                    <TableHead className="text-end">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const statusCfg = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending
                    const StatusIcon = statusCfg.icon

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <span className="font-mono text-xs" dir="ltr">
                            {payment.bookingId.substring(0, 8)}...
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{payment.entityName}</TableCell>
                        <TableCell className="font-semibold">
                          {payment.amount.toLocaleString()} {t('common.sar')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusCfg.color}>
                            <StatusIcon className="me-1 h-3 w-3" />
                            {payment.status === 'verified'
                              ? isRTL ? 'تم التحقق' : 'Verified'
                              : payment.status === 'rejected'
                                ? isRTL ? 'مرفوض' : 'Rejected'
                                : isRTL ? 'قيد المراجعة' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {payment.receiptPath && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-orange-600 hover:bg-orange-50"
                                onClick={() => setReceiptDialog(payment)}
                              >
                                {isImageFile(payment.receiptPath) ? (
                                  <ImageIcon className="h-3.5 w-3.5" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5" />
                                )}
                                {t('admin.payments.receipt')}
                              </Button>
                            )}
                            {payment.contractPath && (
                              <a
                                href={payment.contractPath}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <FileText className="h-3.5 w-3.5" />
                                  {t('admin.contractFile')}
                                </Button>
                              </a>
                            )}
                            {!payment.receiptPath && !payment.contractPath && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {payment.status === 'pending' && (
                              <>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {isRTL ? 'تأكيد التحقق' : 'Confirm Verification'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {isRTL
                                          ? 'هل تريد تأكيد هذا الدفع واعتماد الحجز؟'
                                          : 'Do you want to verify this payment and approve the booking?'}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleVerify(payment.bookingId)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="me-1 h-4 w-4" />
                                        {t('admin.payments.verify')}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {isRTL ? 'رفض الدفع' : 'Reject Payment'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {isRTL
                                          ? 'هل أنت متأكد من رفض هذا الدفع؟'
                                          : 'Are you sure you want to reject this payment?'}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleReject(payment.bookingId)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        <XCircle className="me-1 h-4 w-4" />
                                        {t('admin.payments.reject')}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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

      {/* Receipt Preview Dialog */}
      <Dialog open={!!receiptDialog} onOpenChange={() => setReceiptDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.payments.receipt')}</DialogTitle>
          </DialogHeader>
          {receiptDialog?.receiptPath && isImageFile(receiptDialog.receiptPath) && (
            <div className="flex justify-center">
              <img
                src={receiptDialog.receiptPath}
                alt={t('admin.payments.receipt')}
                className="max-h-[500px] rounded-lg border object-contain"
              />
            </div>
          )}
          {receiptDialog?.receiptPath && !isImageFile(receiptDialog.receiptPath) && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <FileText className="h-16 w-16 text-gray-400" />
              <p className="text-sm text-gray-500">{isRTL ? 'ملف PDF' : 'PDF File'}</p>
              <a
                href={receiptDialog.receiptPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {isRTL ? 'فتح الملف' : 'Open File'}
                </Button>
              </a>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialog(null)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
