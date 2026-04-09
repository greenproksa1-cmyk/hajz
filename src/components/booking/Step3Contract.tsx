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

// استيراد القالب الاحترافي الجديد ودالة التصدير
import { ContractTemplate, exportToPDF } from '../ContractTemplate'

interface Step3Props {
  formData: BookingFormData
  selectedBooths: BoothData[]
  totalPrice: number
  onComplete: (contractBase64: string) => void
  onBack: () => void
}

export default function Step3Contract({
  formData,
  selectedBooths,
  totalPrice,
  onComplete,
  onBack,
}: Step3Props) {
  const { t, isRTL } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [contractGenerated, setContractGenerated] = useState(false)

  // دالة التعامل مع التصدير والانتقال للخطوة التالية
  const handleDownloadAndProceed = async () => {
    setIsGenerating(true)
    try {
      // استدعاء دالة التصدير الاحترافية التي تعتمد على الطباعة (Window Print)
      // مررنا اسم الجهة ليكون اسم الملف
      await exportToPDF(formData.entityName);
      
      setContractGenerated(true)
      toast.success(t('contract.generated'))
      
      // ننتقل للخطوة التالية (الدفع)
      // نمرر قيمة وهمية لأننا نعتمد الآن على التصدير المباشر وليس الـ Base64 من السيرفر
      onComplete('locally-generated')
    } catch (error) {
      console.error("Contract export error:", error);
      toast.error(t('common.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const ArrowBack = isRTL ? ArrowRight : ArrowLeft
  const totalArea = selectedBooths.reduce((sum, b) => sum + b.area, 0)

  // تحويل بيانات الأجنحة لتناسب متطلبات القالب الاحترافي
  const mappedBooths = selectedBooths.map(b => ({
    label: b.label,
    category: 'Shell Stand', // يمكن جعلها ديناميكية لاحقاً
    area: b.area,
    price: b.area * 1700 // السعر للمتر المربع
  }))

  return (
    <div className="space-y-6">
      {/* 
          إدراج القالب الاحترافي هنا. 
          يتم إخفاؤه تلقائياً داخل المكون باستخدام z-index و absolute positioning 
          ليتم استدعاؤه فقط عند ضغط زر الطباعة/التصدير.
      */}
      <ContractTemplate 
        companyName={formData.entityName}
        crNumber={formData.unifiedNumber}
        address={formData.address}
        contactPerson={formData.contactName}
        jobTitle={formData.jobTitle}
        mobile={formData.mobile}
        phone={formData.phone}
        email={formData.email}
        booths={mappedBooths}
        exhibits="أنظمة ومعدات بناء" 
        sponsorshipLevel="Co-Sponsor" 
        bookingRef={`RCX-${Date.now().toString().slice(-6)}`}
      />

      <div className="text-center">
        <FileText className="mx-auto mb-4 h-16 w-16 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">{t('contract.title')}</h3>
        <p className="text-sm text-gray-500 mt-1">
          عقدك المزدوج (عربي/إنجليزي) جاهز الآن. قم بمراجعة البيانات ثم استخراج العقد للمتابعة.
        </p>
      </div>

      {/* ملخص الحجز السريع للعميل قبل التحميل */}
      <Card className="border-orange-100 bg-orange-50/30">
        <CardContent className="p-4">
          <h4 className="mb-3 font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            بيانات الجهة المتعاقدة
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">{t('booking.entityName')}</span>
              <span className="font-semibold text-gray-700">{formData.entityName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">{t('booking.unifiedNumber')}</span>
              <span className="font-semibold text-gray-700" dir="ltr">{formData.unifiedNumber}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">{t('booking.contactName')}</span>
              <span className="font-semibold text-gray-700">{formData.contactName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">{t('booking.mobile')}</span>
              <span className="font-semibold text-gray-700" dir="ltr">{formData.mobile}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل المساحات والأسعار */}
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
                  <TableCell className="text-end font-bold">
                    {(booth.area * 1700).toLocaleString()} {t('common.sar')}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50/50 font-bold text-lg">
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

      {/* أزرار الأكشن: استخراج العقد أو المتابعة */}
      <div className="flex flex-col items-center gap-4 pt-4">
        {!contractGenerated ? (
          <Button
            onClick={handleDownloadAndProceed}
            disabled={isGenerating}
            className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto px-10 py-6 text-lg shadow-lg shadow-orange-200"
            size="lg"
          >
            {isGenerating ? (
              <Loader2 className="me-2 h-5 w-5 animate-spin" />
            ) : (
              <FileText className="me-2 h-5 w-5" />
            )}
            {isGenerating ? t('contract.generating') : "استخراج العقد والمتابعة للدفع"}
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3 bg-green-50 p-6 rounded-xl border border-green-100 w-full animate-in fade-in zoom-in">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="h-6 w-6" />
              <span className="font-bold text-lg">تم استخراج العقد بنجاح</span>
            </div>
            <p className="text-sm text-green-600 text-center mb-4">
              تم تحميل نسخة العقد الرسمية على جهازك. يمكنك الآن المتابعة لعملية الدفع لتأكيد الحجز.
            </p>
            <div className="flex gap-3">
               <Button
                variant="outline"
                onClick={handleDownloadAndProceed}
                className="text-orange-600 border-orange-300"
              >
                <Download className="me-2 h-4 w-4" />
                تحميل مرة أخرى
              </Button>
              <Button
                onClick={() => onComplete('locally-generated')}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('common.continue')}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* زر الرجوع */}
      {!contractGenerated && (
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
