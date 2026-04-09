'use client'

import { useState, useRef } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Building2, CheckCircle, ArrowLeft, ArrowRight, Loader2, Copy, Check } from 'lucide-react'
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
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const contractInputRef = useRef<HTMLInputElement>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(isRTL ? 'تم النسخ!' : 'Copied!')
    setTimeout(() => setCopiedField(null), 2000)
  }

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

      {/* Bank Transfer Info - Premium Styled Card */}
      <Card className="overflow-hidden border-none shadow-xl">
        <div className="bg-[#001f3f] p-6 text-white text-center space-y-4">
          <div className="mx-auto w-40 h-40 bg-white p-2 rounded-xl mb-2">
            <img 
              src="/images/payment-qr.png" 
              alt="Payment QR" 
              className="w-full h-full object-contain"
            />
          </div>
          <h4 className="text-xl font-bold tracking-wide">عبدالمجيد محمد ضاعني</h4>
          
          <div className="space-y-3 mt-6">
            {/* Account Number Row */}
            <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between group hover:bg-white/20 transition-colors">
              <div className="text-right">
                <p className="text-[10px] uppercase opacity-70 mb-1">{isRTL ? 'رقم الحساب' : 'Account Number'}</p>
                <p className="font-mono text-sm tracking-widest">68205997021002</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-white hover:bg-white/20 h-8 w-8"
                onClick={() => copyToClipboard('68205997021002', 'account')}
              >
                {copiedField === 'account' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* IBAN Row */}
            <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between group hover:bg-white/20 transition-colors">
              <div className="text-right w-full">
                <p className="text-[10px] uppercase opacity-70 mb-1">{isRTL ? 'الآيبان' : 'IBAN'}</p>
                <p className="font-mono text-xs tracking-tight break-all" dir="ltr">SA8805000068205997021002</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-white hover:bg-white/20 h-8 w-8 ml-2"
                onClick={() => copyToClipboard('SA8805000068205997021002', 'iban')}
              >
                {copiedField === 'iban' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm">
            <span className="opacity-80 font-medium">{t('boothMap.totalPrice')}</span>
            <span className="text-lg font-bold text-orange-400">
              {totalPrice.toLocaleString()} {t('common.sar')}
            </span>
          </div>
        </div>
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
