'use client'

import { useState, useRef } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Building2, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { BookingFormData } from './BookingWizard'
import type { BoothData } from '../booth/BoothMap'

interface Step4Props {
  formData: BookingFormData
  selectedBooths: BoothData[]
  totalPrice: number
  contractData: string | null
  onComplete: () => void
  onBack: () => void
}

export default function Step4Payment({
  formData,
  selectedBooths,
  totalPrice,
  contractData,
  onComplete,
  onBack,
}: Step4Props) {
  const { t, isRTL } = useTranslation()
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const contractInputRef = useRef<HTMLInputElement>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'contract' | 'receipt'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'contract') {
      setContractFile(file)
    } else {
      setReceiptFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (data.success) {
      return data.path
    }
    throw new Error(data.error || 'Upload failed')
  }

  const handleSubmit = async () => {
    if (!contractFile) {
      toast.error(isRTL ? 'يرجى رفع العقد الموقع' : 'Please upload the signed contract')
      return
    }
    if (!receiptFile) {
      toast.error(isRTL ? 'يرجى رفع إيصال الدفع' : 'Please upload the payment receipt')
      return
    }

    setIsSubmitting(true)
    try {
      // Upload files
      const [contractPath, receiptPath] = await Promise.all([
        uploadFile(contractFile),
        uploadFile(receiptFile),
      ])

      // Create booking
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          boothIds: selectedBooths.map((b) => b.id),
          totalPrice,
          contractPath,
          receiptPath,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsSuccess(true)
        toast.success(t('common.success'))
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const ArrowBack = isRTL ? ArrowRight : ArrowLeft

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <CheckCircle className="h-20 w-20 text-green-500" />
        <h3 className="text-xl font-bold text-gray-800">{t('payment.successTitle')}</h3>
        <p className="max-w-md text-center text-gray-600">{t('payment.successMessage')}</p>
        <Button
          onClick={onComplete}
          className="bg-orange-500 hover:bg-orange-600"
          size="lg"
        >
          {t('payment.backToMap')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="mx-auto mb-4 h-16 w-16 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">{t('payment.title')}</h3>
      </div>

      {/* Bank Transfer Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-orange-500" />
            {t('payment.bankInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">{t('payment.transferNote')}</p>
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('payment.bankName')}</span>
              <span className="text-sm font-medium">{t('payment.bankName')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('payment.iban')}</span>
              <span className="text-sm font-mono font-medium" dir="ltr">{t('payment.bankDetails')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('payment.accountName')}</span>
              <span className="text-sm font-medium">{t('payment.accountNameValue')}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-semibold text-gray-700">{t('boothMap.totalPrice')}</span>
              <span className="text-base font-bold text-orange-600">
                {totalPrice.toLocaleString()} {t('common.sar')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <div className="space-y-4">
        {/* Contract Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('payment.uploadContract')}
          </label>
          <div
            onClick={() => contractInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-orange-400 hover:bg-orange-50"
          >
            <input
              ref={contractInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'contract')}
            />
            {contractFile ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-sm font-medium text-green-600">{t('payment.fileUploaded')}</span>
                <span className="text-xs text-gray-500">{contractFile.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">{t('payment.dragDrop')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('payment.uploadReceipt')}
          </label>
          <div
            onClick={() => receiptInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-orange-400 hover:bg-orange-50"
          >
            <input
              ref={receiptInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'receipt')}
            />
            {receiptFile ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-sm font-medium text-green-600">{t('payment.fileUploaded')}</span>
                <span className="text-xs text-gray-500">{receiptFile.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">{t('payment.dragDrop')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowBack className="me-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !contractFile || !receiptFile}
          className="bg-orange-500 hover:bg-orange-600"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="me-2 h-4 w-4" />
          )}
          {isSubmitting ? t('payment.submitting') : t('payment.submit')}
        </Button>
      </div>
    </div>
  )
}
