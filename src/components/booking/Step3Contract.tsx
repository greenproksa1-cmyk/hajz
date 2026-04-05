'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Download, Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { BookingFormData } from './BookingWizard'
import type { BoothData } from '../booth/BoothMap'

interface Step3Props {
  formData: BookingFormData
  selectedBooths: BoothData[]
  totalPrice: number
  onComplete: (contractBase64: string) => void
  onBack: () => void
}

const PRICE_PER_SQM = 1700

export default function Step3Contract({
  formData,
  selectedBooths,
  totalPrice,
  onComplete,
  onBack,
}: Step3Props) {
  const { t, isRTL, lang } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [contractBase64, setContractBase64] = useState<string | null>(null)

  const generateContract = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/contract/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          boothLabels: selectedBooths.map((b) => b.label),
          totalPrice,
          lang,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setContractBase64(data.pdfBase64)
        toast.success(t('contract.generated'))

        // Trigger download
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${data.pdfBase64}`
        link.download = `contract-${selectedBooths.map((b) => b.label).join('-')}.pdf`
        link.click()

        onComplete(data.pdfBase64)
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const ArrowBack = isRTL ? ArrowRight : ArrowLeft

  const totalArea = selectedBooths.reduce((sum, b) => sum + b.area, 0)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="mx-auto mb-4 h-16 w-16 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">{t('contract.title')}</h3>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-3 font-semibold text-gray-700">{t('booking.yourInfo')}</h4>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-gray-500">{t('booking.entityName')}:</span>
              <span className="ms-1 font-medium">{formData.entityName}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('booking.unifiedNumber')}:</span>
              <span className="ms-1 font-medium" dir="ltr">{formData.unifiedNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('booking.contactName')}:</span>
              <span className="ms-1 font-medium">{formData.contactName}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('booking.mobile')}:</span>
              <span className="ms-1 font-medium" dir="ltr">{formData.mobile}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500">{t('booking.address')}:</span>
              <span className="ms-1 font-medium">{formData.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-3 font-semibold text-gray-700">{t('contract.priceBreakdown')}</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('contract.booth')}</TableHead>
                <TableHead>{t('contract.area')}</TableHead>
                <TableHead className="text-end">{t('contract.price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedBooths.map((booth) => (
                <TableRow key={booth.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      {booth.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{booth.area} {t('boothMap.sqm')}</TableCell>
                  <TableCell className="text-end">
                    {(booth.area * PRICE_PER_SQM).toLocaleString()} {t('common.sar')}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>{t('contract.total')}</TableCell>
                <TableCell>{totalArea} {t('boothMap.sqm')}</TableCell>
                <TableCell className="text-end text-orange-600">
                  {totalPrice.toLocaleString()} {t('common.sar')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate / Download */}
      {!contractBase64 ? (
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={generateContract}
            disabled={isGenerating}
            className="bg-orange-500 hover:bg-orange-600"
            size="lg"
          >
            {isGenerating ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="me-2 h-4 w-4" />
            )}
            {isGenerating ? t('contract.generating') : t('contract.generate')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{t('contract.generated')}</span>
          </div>
          <Button
            variant="outline"
            onClick={generateContract}
            className="text-orange-600 border-orange-300"
          >
            <Download className="me-2 h-4 w-4" />
            {t('contract.download')}
          </Button>
        </div>
      )}

      {/* Back button */}
      {!contractBase64 && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            <ArrowBack className="me-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      )}
    </div>
  )
}
