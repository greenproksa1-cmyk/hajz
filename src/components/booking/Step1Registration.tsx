'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, User } from 'lucide-react'
import type { BookingFormData } from './BookingWizard'

interface Step1Props {
  onComplete: (data: BookingFormData) => void
  initialData?: BookingFormData
}

export default function Step1Registration({ onComplete, initialData }: Step1Props) {
  const { t, isRTL } = useTranslation()

  const schema = z.object({
    entityName: z.string().min(1, t('validation.required')),
    unifiedNumber: z
      .string()
      .min(1, t('validation.required'))
      .regex(/^7\d{9}$/, t('validation.invalidUnifiedNumber')),
    address: z.string().min(1, t('validation.required')),
    contactName: z.string().min(1, t('validation.required')),
    jobTitle: z.string().min(1, t('validation.required')),
    mobile: z
      .string()
      .min(1, t('validation.required'))
      .regex(/^05\d{8}$/, t('validation.invalidMobile')),
    phone: z.string().optional(),
    email: z
      .string()
      .min(1, t('validation.required'))
      .email(t('validation.invalidEmail')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      entityName: '',
      unifiedNumber: '',
      address: '',
      contactName: '',
      jobTitle: '',
      mobile: '',
      phone: '',
      email: '',
    },
  })

  const onSubmit = (data: FormData) => {
    onComplete({
      ...data,
      phone: data.phone || '',
    })
  }

  const inputDir = isRTL ? 'rtl' : 'ltr'
  const ArrowForward = isRTL ? ArrowLeft : ArrowRight

  const fields = [
    {
      name: 'entityName' as const,
      label: t('booking.entityName'),
      type: 'text',
      placeholder: isRTL ? 'مثال: شركة الأفق للمقاولات' : 'e.g., Al Ofuq Contracting Co.',
      colSpan: 'md:col-span-2',
    },
    {
      name: 'unifiedNumber' as const,
      label: t('booking.unifiedNumber'),
      type: 'text',
      placeholder: '7XXXXXXXXX',
      colSpan: 'md:col-span-1',
      maxLength: 10,
    },
    {
      name: 'email' as const,
      label: t('booking.email'),
      type: 'email',
      placeholder: 'info@example.com',
      colSpan: 'md:col-span-1',
      dir: 'ltr',
    },
    {
      name: 'address' as const,
      label: t('booking.address'),
      type: 'text',
      placeholder: isRTL ? 'الرياض، حي العليا، شارع الأمير محمد' : 'Riyadh, Olaya, Prince Mohammed St.',
      colSpan: 'md:col-span-2',
    },
    {
      name: 'contactName' as const,
      label: t('booking.contactName'),
      type: 'text',
      placeholder: isRTL ? 'أحمد الشمري' : 'Ahmed Al-Shamri',
      colSpan: 'md:col-span-1',
    },
    {
      name: 'jobTitle' as const,
      label: t('booking.jobTitle'),
      type: 'text',
      placeholder: isRTL ? 'مدير التطوير' : 'Development Manager',
      colSpan: 'md:col-span-1',
    },
    {
      name: 'mobile' as const,
      label: t('booking.mobile'),
      type: 'tel',
      placeholder: '05XXXXXXXX',
      colSpan: 'md:col-span-1',
      dir: 'ltr',
      maxLength: 10,
    },
    {
      name: 'phone' as const,
      label: t('booking.phone'),
      type: 'tel',
      placeholder: '01XXXXXXXX',
      colSpan: 'md:col-span-1',
      dir: 'ltr',
    },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-orange-500" />
          {t('booking.yourInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.colSpan}>
              <Label htmlFor={field.name} className="mb-1.5 block text-sm font-medium">
                {field.label}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                dir={field.dir || inputDir}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                className={errors[field.name] ? 'border-red-500 focus-visible:ring-red-500' : ''}
                {...register(field.name)}
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            size="lg"
            disabled={isSubmitting}
          >
            {t('common.next')}
            <ArrowForward className="ms-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </form>
  )
}
