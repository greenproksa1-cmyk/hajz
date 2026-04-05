'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { ShieldCheck, Send, CheckCircle, ArrowLeft, ArrowRight, AlertTriangle, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

interface Step2Props {
  email: string
  onComplete: () => void
  onBack: () => void
}

export default function Step2OTP({ email, onComplete, onBack }: Step2Props) {
  const { t, isRTL } = useTranslation()
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [demoOtp, setDemoOtp] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [verified, setVerified] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (countdown > 0 && otpSent) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [countdown, otpSent])

  const sendOtp = useCallback(async () => {
    setIsSending(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang: 'ar' }),
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        setCountdown(60)
        // Track demo mode
        if (data.demoMode) {
          setIsDemoMode(true)
        }
        if (data.otp) {
          setDemoOtp(data.otp)
        }
        if (data.demoMode) {
          toast.success(t('otp.codeSent'), { description: t('otp.demoModeNotice') })
        } else {
          toast.success(t('otp.emailSent'), { description: email })
        }
      } else {
        toast.error(data.error || t('common.error'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsSending(false)
    }
  }, [email, t])

  const verifyOtp = useCallback(async () => {
    if (otp.length !== 4) {
      toast.error(t('otp.enterCode'))
      return
    }
    setIsVerifying(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (data.success) {
        setVerified(true)
        toast.success(t('common.success'))
        setTimeout(() => {
          onComplete()
        }, 1000)
      } else {
        toast.error(data.error || t('otp.wrongCode'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsVerifying(false)
    }
  }, [otp, email, t, onComplete])

  const handleResend = () => {
    setCountdown(60)
    setOtp('')
    sendOtp()
  }

  const ArrowBack = isRTL ? ArrowRight : ArrowLeft

  return (
    <div className="space-y-6">
      <div className="text-center">
        <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">{t('booking.step2Title')}</h3>
        <p className="mt-2 text-sm text-gray-500">
          {t('otp.enterCode')}
        </p>
        {otpSent && (
          <p className="mt-1 text-sm text-gray-600">
            {t('otp.sentTo')}: <span className="font-medium" dir="ltr">{email}</span>
          </p>
        )}
      </div>

      {!otpSent ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600">
            {isRTL
              ? 'سيتم إرسال رمز التحقق إلى بريدك الإلكتروني'
              : 'A verification code will be sent to your email'}
          </p>
          <Button
            onClick={sendOtp}
            disabled={isSending}
            className="bg-orange-500 hover:bg-orange-600"
            size="lg"
          >
            <Send className="me-2 h-4 w-4" />
            {isSending ? t('common.loading') : t('otp.sendCode')}
          </Button>
        </div>
      ) : verified ? (
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <p className="text-lg font-semibold text-green-600">{t('common.success')}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {/* Demo mode notice */}
          {isDemoMode && (
            <div className="flex w-full items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">{t('otp.demoModeNotice')}</p>
                {demoOtp && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-amber-100 px-3 py-1.5">
                    <span className="text-sm text-amber-700">{t('otp.demoOtp')}</span>
                    <span className="text-lg font-bold tracking-widest text-amber-900" dir="ltr">{demoOtp}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Real email notice (non-demo) */}
          {!isDemoMode && (
            <div className="flex w-full items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">{t('otp.codeWillArrive')}</p>
              </div>
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Countdown */}
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              {t('otp.resendIn')} {countdown} {t('otp.seconds')}
            </p>
          ) : (
            <Button variant="outline" onClick={handleResend} className="text-orange-600 border-orange-300">
              {t('otp.resend')}
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex w-full justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowBack className="me-2 h-4 w-4" />
              {t('common.back')}
            </Button>
            <Button
              onClick={verifyOtp}
              disabled={otp.length !== 4 || isVerifying}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isVerifying ? t('common.loading') : t('otp.verify')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
