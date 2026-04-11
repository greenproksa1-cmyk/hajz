'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, LogIn, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AdminLoginProps {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const { t, isRTL } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const schema = z.object({
    username: z.string().min(1, t('validation.required')),
    password: z.string().min(1, t('validation.required')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) {
        toast.success(t('common.success'))
        onLogin()
      } else {
        toast.error(t('admin.wrongCredentials'))
      }
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="border-blue-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Shield className="h-8 w-8 text-blue-700" />
          </div>
          <CardTitle className="text-xl">{t('admin.login')}</CardTitle>
          <p className="text-sm text-gray-500">
            {isRTL ? 'أدخل بيانات الدخول للوصول إلى لوحة التحكم' : 'Enter credentials to access the admin dashboard'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                {t('admin.username')}
              </Label>
              <Input
                id="username"
                type="text"
                dir="ltr"
                placeholder="admin"
                className={errors.username ? 'border-red-500' : ''}
                {...register('username')}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                {t('admin.password')}
              </Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                placeholder="••••••••"
                className={errors.password ? 'border-red-500' : ''}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="me-2 h-4 w-4" />
              )}
              {t('admin.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
