'use client'

import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Globe, Shield, UserCircle, LogIn, LayoutDashboard } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  currentView: string
  onNavigate: (view: string) => void
}

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const { lang, setLang, t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-l from-orange-600 to-orange-500 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Exhibition Name */}
          <button
            onClick={() => onNavigate('map')}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-white"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-white">
                {t('nav.exhibitionName')}
              </span>
              <span className="text-xs leading-tight text-white/80">
                {lang === 'ar' ? 'Riyadh Contractors Exhibition 2026' : 'معرض مقاولي الرياض 2026'}
              </span>
            </div>
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('map')}
              className={`text-white hover:bg-white/20 hover:text-white ${
                currentView === 'map' ? 'bg-white/20' : ''
              }`}
            >
              {t('nav.home')}
            </Button>

            {session ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-white hover:bg-white/20 hover:text-white"
              >
                <LayoutDashboard className="ms-2 h-4 w-4" />
                {t('admin.user.myBookings') || (lang === 'ar' ? 'حجوزاتي' : 'My Bookings')}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                className="text-white hover:bg-white/20 hover:text-white"
              >
                <LogIn className="ms-2 h-4 w-4" />
                {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(currentView === 'admin-dashboard' ? 'admin-dashboard' : 'admin')}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <Shield className="ms-2 h-4 w-4" />
              {t('nav.admin')}
            </Button>

            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="border border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Globe className="ms-2 h-4 w-4" />
              {t('nav.switchLang')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
