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
import { generateContractPDF } from '@/lib/pdf-export'
import { ContractTemplate } from '@/components/ContractTemplate'

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
  rawBooking: any
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
        const rawData = Array.isArray(data.data) ? data.data : []
        const paymentRecords: PaymentRecord[] = rawData
          .filter((b: any) => b?.receiptPath || b?.contractPath)
          .map((b: any) => ({
            id: b.id,
            bookingId: b.id,
            entityName: b.entityName || '',
            amount: b.totalPrice || 0,
            status: (b.status === 'approved' || b.status === 'completed' ? 'verified' : b.status === 'rejected' ? 'rejected' : 'pending') as 'pending' | 'verified' | 'rejected',
            receiptPath: b.receiptPath,
            contractPath: b.contractPath,
            bookingStatus: b.status,
            createdAt: b.createdAt,
            rawBooking: b,
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

  const [downloadingContractId, setDownloadingContractId] = useState<string | null>(null)
  const [contractToRender, setContractToRender] = useState<any | null>(null)

  const handleDownloadPDF = (booking: any) => {
    setDownloadingContractId(booking.id)
    setContractToRender(booking)
    setTimeout(async () => {
      toast.info(isRTL ? 'جاري تصدير العقد...' : 'Generating PDF...')
      const success = await generateContractPDF(`contract-pdf-${booking.id}`, `Contract_${booking.entityName.replace(/\s+/g, '_')}.pdf`)
      if (success) toast.success(isRTL ? 'تم حفظ العقد بنجاح!' : 'Contract saved successfully!')
      setDownloadingContractId(null)
      // We don't nullify contractToRender immediately to avoid react unmounting it before html2canvas completes
      setTimeout(() => setContractToRender(null), 1000)
    }, 150)
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <CreditCard className="h-5 w-5 text-blue-700" />
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

      {/* List Container */}
      <Card className="border-none bg-transparent shadow-none sm:border sm:bg-white sm:shadow-sm">
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>{isRTL ? 'لا توجد مدفوعات' : 'No payments found'}</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
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
                    {filteredPayments.map((payment) => (
                      <PaymentTableRow 
                        key={payment.id} 
                        payment={payment} 
                        onVerify={handleVerify}
                        onReject={handleReject}
                        onDownloadPDF={handleDownloadPDF}
                        onViewReceipt={setReceiptDialog}
                        downloadingId={downloadingContractId}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="grid gap-4 md:hidden">
                {filteredPayments.map((payment) => (
                  <MobilePaymentCard 
                    key={payment.id} 
                    payment={payment}
                    onVerify={handleVerify}
                    onReject={handleReject}
                    onDownloadPDF={handleDownloadPDF}
                    onViewReceipt={setReceiptDialog}
                    downloadingId={downloadingContractId}
                  />
                ))}
              </div>
            </>
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
      {/* Hidden Contract Template for PDF Export */}
      <div style={{ position: 'fixed', left: '-5000px', top: 0, pointerEvents: 'none', opacity: 0 }}>
        {contractToRender && (
          <ContractTemplate 
            id={`contract-pdf-${contractToRender.id}`}
            companyName={contractToRender.entityName}
            crNumber={contractToRender.unifiedNumber}
            address={contractToRender.address}
            contactPerson={contractToRender.contactName}
            jobTitle={contractToRender.jobTitle}
            mobile={contractToRender.mobile}
            phone={contractToRender.phone}
            email={contractToRender.email}
            booths={Array.isArray(contractToRender.booths) ? contractToRender.booths.map((b: any) => ({
              label: b.label,
              category: b.boothType || 'Shell Stand',
              area: b.area,
              price: (contractToRender.totalPrice || 0) / (contractToRender.booths?.length || 1)
            })) : [{ label: 'A1', category: 'Shell Stand', area: 9, price: contractToRender.totalPrice || 0 }]}
            bookingRef={contractToRender.id.toUpperCase().substring(0, 8)}
            exhibits="General Exhibit"
            sponsorshipLevel={contractToRender.sponsorshipLevel || "Co-Sponsor"}
          />
        )}
      </div>



    </div>
  )
}

function PaymentTableRow({ payment, onVerify, onReject, onDownloadPDF, onViewReceipt, downloadingId }: any) {
  const { t, isRTL } = useTranslation()
  const statusCfg = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending
  const StatusIcon = statusCfg.icon
  const isImageFile = (path: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path)
  
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
    <TableRow>
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
              className="gap-1 text-blue-700 hover:bg-orange-50"
              onClick={() => onViewReceipt(payment)}
            >
              {isImageFile(payment.receiptPath) ? (
                <ImageIcon className="h-3.5 w-3.5" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              {t('admin.payments.receipt')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-blue-600 hover:bg-blue-50"
            onClick={() => onDownloadPDF(payment.rawBooking)}
            disabled={downloadingId === payment.bookingId}
          >
            {downloadingId === payment.bookingId ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> : <FileText className="h-3.5 w-3.5" />}
            {isRTL ? 'تحميل' : 'Download'}
          </Button>
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
                  <Button variant="ghost" size="sm" className="text-green-600 border border-green-100 bg-green-50/50">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                      <AlertDialogTitle>{isRTL ? 'تأكيد التحقق' : 'Confirm Verification'}</AlertDialogTitle>
                      <AlertDialogDescription>
                         {isRTL ? 'هل تريد تأكيد هذا الدفع واعتماد الحجز؟' : 'Do you want to verify this payment?'}
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onVerify(payment.bookingId)} className="bg-green-600">
                         {t('admin.payments.verify')}
                      </AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-600 border border-red-100 bg-red-50/50">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                      <AlertDialogTitle>{isRTL ? 'رفض الدفع' : 'Reject Payment'}</AlertDialogTitle>
                      <AlertDialogDescription>
                         {isRTL ? 'هل أنت متأكد من رفض هذا الدفع؟' : 'Are you sure you want to reject this payment?'}
                      </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onReject(payment.bookingId)} className="bg-red-600">
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
}

function MobilePaymentCard({ payment, onVerify, onReject, onDownloadPDF, onViewReceipt, downloadingId }: any) {
  const { t, isRTL } = useTranslation()
  const statusCfg = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending
  const StatusIcon = statusCfg.icon
  const isImageFile = (path: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path)
  
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
    <Card className="border-slate-200 overflow-hidden shadow-md">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block mb-1">#{payment.bookingId.substring(0, 8)}</span>
            <h3 className="font-bold text-slate-900">{payment.entityName}</h3>
          </div>
          <Badge variant="outline" className={`${statusCfg.color} px-2 py-1`}>
            <StatusIcon className="me-1.5 h-3 w-3" />
            <span className="text-[10px] font-bold">
              {payment.status === 'verified' ? (isRTL ? 'تم التحقق' : 'Verified') : 
               payment.status === 'rejected' ? (isRTL ? 'مرفوض' : 'Rejected') : 
               (isRTL ? 'قيد المراجعة' : 'Pending')}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-slate-50 rounded-xl">
           <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">{isRTL ? 'المبلغ' : 'Amount'}</p>
              <p className="text-lg font-black text-slate-900">{payment.amount.toLocaleString()} <span className="text-xs">{t('common.sar')}</span></p>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">{isRTL ? 'التاريخ' : 'Date'}</p>
              <p className="text-xs font-bold text-slate-600">{formatDate(payment.createdAt)}</p>
           </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
           {payment.receiptPath && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-[120px] gap-2 border-blue-100 text-blue-700 h-10 rounded-xl"
                onClick={() => onViewReceipt(payment)}
              >
                {isImageFile(payment.receiptPath) ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span className="text-xs font-bold">{isRTL ? 'الإيصال' : 'Receipt'}</span>
              </Button>
           )}
           <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px] gap-2 border-blue-100 text-blue-700 h-10 rounded-xl"
              onClick={() => onDownloadPDF(payment.rawBooking)}
              disabled={downloadingId === payment.bookingId}
            >
              {downloadingId === payment.bookingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              <span className="text-xs font-bold">{isRTL ? 'تحميل العقد' : 'Contract'}</span>
            </Button>
        </div>

        {payment.status === 'pending' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button className="flex-1 h-11 bg-green-600 hover:bg-green-700 rounded-xl gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-bold">{isRTL ? 'اعتماد' : 'Approve'}</span>
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                      <AlertDialogTitle>{isRTL ? 'تأكيد التحقق' : 'Confirm'}</AlertDialogTitle>
                      <AlertDialogDescription>{isRTL ? 'هل تريد اعتماد هذا الدفع؟' : 'Approve this payment?'}</AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onVerify(payment.bookingId)} className="bg-green-600">{t('common.confirm')}</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
             
             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="outline" className="flex-1 h-11 border-red-100 text-red-600 hover:bg-red-50 rounded-xl gap-2">
                      <XCircle className="h-4 w-4" />
                      <span className="font-bold">{isRTL ? 'رفض' : 'Reject'}</span>
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                      <AlertDialogTitle>{isRTL ? 'رفض الدفع' : 'Reject'}</AlertDialogTitle>
                      <AlertDialogDescription>{isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}</AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onReject(payment.bookingId)} className="bg-red-600">{t('common.confirm')}</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
