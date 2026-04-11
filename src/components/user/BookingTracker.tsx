'use client'

import { useTranslation } from '@/i18n'
import {
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  FileText,
  ShieldCheck,
  MousePointerClick,
  UserPlus,
} from 'lucide-react'

interface BookingTrackerProps {
  booking: {
    id: string
    status: string
    entityName?: string
    createdAt?: string
    updatedAt?: string
    contractPath?: string | null
    receiptPath?: string | null
    otpVerified?: boolean
    boothIds?: string
  }
  lang: string
}

interface TrackerStep {
  key: string
  labelAr: string
  labelEn: string
  icon: 'check' | 'clock' | 'cross' | 'upload' | 'pending'
  descriptionAr: string
  descriptionEn: string
}

function getSteps(booking: BookingTrackerProps['booking']): TrackerStep[] {
  const status = booking.status
  const hasContract = !!booking.contractPath
  const hasReceipt = !!booking.receiptPath
  const isVerified = booking.otpVerified

  // Determine how far along the booking is
  // Status: pending (after payment), approved, rejected
  // The tracker always shows steps 1-4 as completed (they happen before booking creation)
  // Steps 5-7 depend on status and file uploads

  return [
    {
      key: 'booth_selection',
      labelAr: 'اختيار الأجنحة',
      labelEn: 'Booth Selection',
      icon: 'check',
      descriptionAr: 'تم اختيار الأجنحة بنجاح',
      descriptionEn: 'Booths selected successfully',
    },
    {
      key: 'registration',
      labelAr: 'التسجيل',
      labelEn: 'Registration',
      icon: 'check',
      descriptionAr: 'تم تسجيل بيانات الجهة',
      descriptionEn: 'Entity information registered',
    },
    {
      key: 'email_verification',
      labelAr: 'التحقق من البريد الإلكتروني',
      labelEn: 'Email Verification',
      icon: isVerified ? 'check' : 'check',
      descriptionAr: 'تم التحقق من البريد الإلكتروني',
      descriptionEn: 'Email verified successfully',
    },
    {
      key: 'contract_generated',
      labelAr: 'إنشاء العقد',
      labelEn: 'Contract Generated',
      icon: hasContract ? 'check' : 'check',
      descriptionAr: 'تم إنشاء عقد الحجز',
      descriptionEn: 'Booking contract generated',
    },
    {
      key: 'payment_submitted',
      labelAr: 'إرسال إثبات الدفع',
      labelEn: 'Payment Submitted',
      icon: hasReceipt ? 'check' : 'upload',
      descriptionAr: hasReceipt
        ? 'تم رفع إيصال الدفع'
        : 'في انتظار رفع إيصال الدفع',
      descriptionEn: hasReceipt
        ? 'Payment receipt uploaded'
        : 'Waiting for payment receipt',
    },
    {
      key: 'admin_approval',
      labelAr: 'في انتظار موافقة الإدارة',
      labelEn: 'Pending Admin Approval',
      icon: status === 'approved'
        ? 'check'
        : status === 'rejected'
          ? 'cross'
          : 'pending',
      descriptionAr:
        status === 'approved'
          ? 'تمت الموافقة على الحجز'
          : status === 'rejected'
            ? 'تم رفض الحجز'
            : 'قيد مراجعة الإدارة',
      descriptionEn:
        status === 'approved'
          ? 'Booking approved by admin'
          : status === 'rejected'
            ? 'Booking rejected by admin'
            : 'Under admin review',
    },
    {
      key: 'final_status',
      labelAr:
        status === 'approved'
          ? 'تمت الموافقة'
          : status === 'rejected'
            ? 'مرفوض'
            : 'بانتظار النتيجة',
      labelEn:
        status === 'approved'
          ? 'Approved'
          : status === 'rejected'
            ? 'Rejected'
            : 'Awaiting Result',
      icon:
        status === 'approved'
          ? 'check'
          : status === 'rejected'
            ? 'cross'
            : 'pending',
      descriptionAr:
        status === 'approved'
          ? 'تهانينا! تمت الموافقة على حجزك'
          : status === 'rejected'
            ? 'تم رفض الحجز. يرجى التواصل مع الإدارة'
            : 'سيتم إبلاغك بنتيجة المراجعة',
      descriptionEn:
        status === 'approved'
          ? 'Congratulations! Your booking has been approved'
          : status === 'rejected'
            ? 'Booking rejected. Please contact administration'
            : 'You will be notified of the review result',
    },
  ]
}

function getStepColor(
  icon: TrackerStep['icon'],
  isCurrent: boolean
): {
  ring: string
  bg: string
  text: string
  line: string
} {
  if (icon === 'check') {
    return {
      ring: 'ring-green-200',
      bg: 'bg-green-500',
      text: 'text-green-600',
      line: 'bg-green-300',
    }
  }
  if (icon === 'cross') {
    return {
      ring: 'ring-red-200',
      bg: 'bg-red-500',
      text: 'text-red-600',
      line: 'bg-red-300',
    }
  }
  if (isCurrent) {
    return {
      ring: 'ring-orange-300 ring-4',
      bg: 'bg-blue-600',
      text: 'text-blue-700',
      line: 'bg-gray-200',
    }
  }
  return {
    ring: 'ring-gray-200',
    bg: 'bg-gray-300',
    text: 'text-gray-400',
    line: 'bg-gray-200',
  }
}

function StepIcon({
  type,
  size = 'md',
}: {
  type: TrackerStep['icon']
  size?: 'sm' | 'md'
}) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  switch (type) {
    case 'check':
      return <CheckCircle className={iconSize} />
    case 'cross':
      return <XCircle className={iconSize} />
    case 'upload':
      return <Upload className={iconSize} />
    case 'pending':
      return <Clock className={iconSize} />
    default:
      return <Clock className={iconSize} />
  }
}

function formatTrackerDate(dateStr: string | undefined, lang: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  } catch {
    return dateStr
  }
}

export default function BookingTracker({ booking, lang }: BookingTrackerProps) {
  const { t } = useTranslation()
  const isAr = lang === 'ar'
  const steps = getSteps(booking)

  // Find the current step (first non-check step, or the last one if all checks)
  const currentStepIndex = steps.findIndex(
    (s) => s.icon !== 'check'
  )

  return (
    <div className="w-full" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const isCurrentStep = index === currentStepIndex
          const colors = getStepColor(step.icon, isCurrentStep)
          const isCompleted = step.icon === 'check'

          return (
            <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Vertical line */}
              {!isLast && (
                <div className="absolute start-[19px] top-10 bottom-0 w-0.5">
                  <div
                    className={`h-full w-full ${
                      isCompleted && steps[index + 1].icon === 'check'
                        ? colors.line
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}

              {/* Icon circle */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors.bg} text-white ring-2 ${colors.ring}`}
              >
                <StepIcon type={step.icon} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                  <h4
                    className={`text-sm font-semibold ${
                      step.icon === 'cross'
                        ? 'text-red-700'
                        : isCurrentStep
                          ? 'text-orange-700'
                          : isCompleted
                            ? 'text-green-700'
                            : 'text-gray-500'
                    }`}
                  >
                    {isAr ? step.labelAr : step.labelEn}
                  </h4>
                  {(isCompleted || step.icon === 'cross') && (
                    <span className="text-xs text-gray-400">
                      {formatTrackerDate(booking.createdAt, lang)}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-0.5 text-xs ${
                    step.icon === 'cross'
                      ? 'text-red-500'
                      : isCurrentStep
                        ? 'text-blue-700'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                  }`}
                >
                  {isAr ? step.descriptionAr : step.descriptionEn}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
