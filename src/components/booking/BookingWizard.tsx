'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, User, ShieldCheck, FileText, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react'
import Step1Registration from './Step1Registration'
import Step2OTP from './Step2OTP'
import Step3Contract from './Step3Contract'
import Step4Payment from './Step4Payment'
import type { BoothData } from '../booth/BoothMap'

export interface BookingFormData {
  entityName: string
  unifiedNumber: string
  address: string
  contactName: string
  jobTitle: string
  mobile: string
  phone: string
  email: string
}

interface BookingWizardProps {
  selectedBooths: BoothData[]
  onComplete: () => void
  onCancel: () => void
}

const PRICE_PER_SQM = 1700

export default function BookingWizard({ selectedBooths, onComplete, onCancel }: BookingWizardProps) {
  const { t, isRTL } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormData>({
    entityName: '',
    unifiedNumber: '',
    address: '',
    contactName: '',
    jobTitle: '',
    mobile: '',
    phone: '',
    email: '',
  })
  const [otpVerified, setOtpVerified] = useState(false)
  const [contractGenerated, setContractGenerated] = useState(false)
  const [contractData, setContractData] = useState<string | null>(null)

  const steps = [
    { num: 1, title: t('booking.step1Title'), icon: User },
    { num: 2, title: t('booking.step2Title'), icon: ShieldCheck },
    { num: 3, title: t('booking.step3Title'), icon: FileText },
    { num: 4, title: t('booking.step4Title'), icon: CreditCard },
  ]

  const totalArea = selectedBooths.reduce((sum, b) => sum + b.area, 0)
  const totalPrice = totalArea * PRICE_PER_SQM

  const handleStep1Complete = (data: BookingFormData) => {
    setFormData(data)
    setCurrentStep(2)
  }

  const handleStep2Complete = () => {
    setOtpVerified(true)
    setCurrentStep(3)
  }

  const handleStep3Complete = (data: string) => {
    setContractData(data)
    setContractGenerated(true)
    setCurrentStep(4)
  }

  const handleStep4Complete = () => {
    onComplete()
  }

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const ArrowForward = isRTL ? ArrowLeft : ArrowRight
  const ArrowBack = isRTL ? ArrowRight : ArrowLeft

  return (
    <div className="mx-auto max-w-4xl">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.num === currentStep
            const isCompleted = step.num < currentStep

            return (
              <React.Fragment key={step.num}>
                {index > 0 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      isCompleted ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isActive
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : isCompleted
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 hidden text-xs sm:block ${
                      isActive ? 'font-semibold text-orange-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {/* Header with booth info */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
          <span className="text-sm text-gray-500">{t('booking.boothInfo')}:</span>
          {selectedBooths.map((booth) => (
            <Badge key={booth.id} variant="outline" className="bg-orange-50 text-orange-700">
              {booth.label} ({booth.area} {t('boothMap.sqm')})
            </Badge>
          ))}
          <span className="text-sm font-semibold text-gray-700">
            {totalPrice.toLocaleString()} {t('common.sar')}
          </span>
        </div>

        {currentStep === 1 && (
          <Step1Registration onComplete={handleStep1Complete} initialData={formData} />
        )}
        {currentStep === 2 && (
          <Step2OTP
            email={formData.email}
            onComplete={handleStep2Complete}
            onBack={goBack}
          />
        )}
        {currentStep === 3 && (
          <Step3Contract
            formData={formData}
            selectedBooths={selectedBooths}
            totalPrice={totalPrice}
            onComplete={handleStep3Complete}
            onBack={goBack}
          />
        )}
        {currentStep === 4 && (
          <Step4Payment
            formData={formData}
            selectedBooths={selectedBooths}
            totalPrice={totalPrice}
            contractData={contractData}
            onComplete={handleStep4Complete}
            onBack={goBack}
          />
        )}
      </div>

      {/* Back to map button */}
      <div className="mt-4 text-center">
        <Button variant="ghost" onClick={onCancel} className="text-gray-500">
          <ArrowBack className="me-2 h-4 w-4" />
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}
