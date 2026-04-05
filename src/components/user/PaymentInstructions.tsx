'use client'

import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, CheckCircle, Building2, QrCode, FileText, Upload, Printer } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface PaymentInstructionsProps {
  amount: number
  currency: string
}

const IBAN_NUMBER = 'SA00 0000 0000 0000 0000 0000'

export default function PaymentInstructions({ amount, currency }: PaymentInstructionsProps) {
  const { t, isRTL } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopyIBAN = async () => {
    try {
      const ibanClean = IBAN_NUMBER.replace(/\s/g, '')
      await navigator.clipboard.writeText(ibanClean)
      setCopied(true)
      toast.success(isRTL ? 'تم نسخ رقم الآيبان' : 'IBAN copied to clipboard')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error(isRTL ? 'فشل النسخ' : 'Copy failed')
    }
  }

  const stepsAr = [
    'قم بتحويل المبلغ الإجمالي إلى الحساب البنكي الموضح أعلاه',
    'قم بتحميل وطباعة عقد الحجز',
    'قم بتوقيع وختم العقد',
    'ارفع العقد الموقع مع إيصال التحويل البنكي',
  ]

  const stepsEn = [
    'Transfer the total amount to the bank account shown above',
    'Download and print the booking contract',
    'Sign and stamp the contract',
    'Upload the signed contract along with the bank transfer receipt',
  ]

  const steps = isRTL ? stepsAr : stepsEn

  return (
    <div className="space-y-4">
      {/* Bank Transfer Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-orange-500" />
            {t('payment.bankInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Details */}
          <div className="rounded-xl bg-gradient-to-br from-orange-50 to-white p-4 border border-orange-100">
            {/* Bank Name */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'اسم البنك' : 'Bank Name'}
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {t('payment.bankName')}
                  </p>
                </div>
              </div>
            </div>

            {/* IBAN */}
            <div className="mb-4 rounded-lg bg-white p-3 border border-gray-100">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {t('payment.iban')}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyIBAN}
                  className="h-7 gap-1.5 px-2 text-xs text-orange-600 hover:bg-orange-50"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      {isRTL ? 'تم النسخ' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {isRTL ? 'نسخ' : 'Copy'}
                    </>
                  )}
                </Button>
              </div>
              <p
                className="font-mono text-base font-bold tracking-wider text-gray-800"
                dir="ltr"
              >
                {IBAN_NUMBER}
              </p>
            </div>

            {/* Account Name */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">
                  {t('payment.accountName')}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {t('payment.accountNameValue')}
                </p>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                <QrCode className="h-8 w-8 text-gray-300" />
                <span className="text-[8px] text-gray-400">QR</span>
              </div>
            </div>
          </div>

          {/* Payment Amount Highlight */}
          <div className="rounded-lg bg-orange-500 p-4 text-center text-white">
            <p className="text-xs font-medium opacity-90">
              {isRTL ? 'المبلغ المطلوب' : 'Amount Due'}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-wide">
              {amount.toLocaleString()} {currency}
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              {isRTL ? 'شامل ضريبة القيمة المضافة' : 'Including VAT'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-orange-500" />
            {isRTL ? 'خطوات الدفع' : 'Payment Steps'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                  {index + 1}
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
          onClick={() => {
            toast.info(isRTL ? 'سيتم تحميل العقد قريباً' : 'Contract will be downloaded soon')
          }}
        >
          <Printer className="me-2 h-4 w-4" />
          {isRTL ? 'طباعة التعليمات' : 'Print Instructions'}
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
          onClick={() => {
            toast.info(isRTL ? 'سيتم تحميل العقد قريباً' : 'Contract will be downloaded soon')
          }}
        >
          <Upload className="me-2 h-4 w-4" />
          {isRTL ? 'رفع الملفات' : 'Upload Files'}
        </Button>
      </div>
    </div>
  )
}
