'use client'

import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Globe, Shield, UserCircle, LogIn, LayoutDashboard, ListOrdered, MapPin } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <header className="sticky top-0 z-50 bg-gradient-to-l from-blue-700 to-blue-600 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-4 transition-opacity hover:opacity-90 py-1"
          >
            <img 
              src="/images/logo.png" 
              alt={lang === 'ar' ? 'معرض مقاولي الرياض 2026' : 'Riyadh Contractors Exhibition 2026'} 
              className="h-12 w-auto object-contain"
            />
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className={`text-white hover:bg-white/20 hover:text-white ${
                currentView === 'home' ? 'bg-white/20' : ''
              }`}
            >
              {t('nav.home')}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('map')}
              className={`text-white hover:bg-white/20 hover:text-white`}
            >
              <MapPin className="ms-2 h-4 w-4" />
              {lang === 'ar' ? 'احجز بوثك' : 'Book Booth'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('booking-steps')}
              className={`text-white hover:bg-white/20 hover:text-white ${
                currentView === 'booking-steps' ? 'bg-white/20' : ''
              }`}
            >
              <ListOrdered className="ms-2 h-4 w-4" />
              {lang === 'ar' ? 'خطوات الحجز' : 'How to Book'}
            </Button>

            {session ? (
              <Link href="/dashboard" prefetch={true}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <LayoutDashboard className="ms-2 h-4 w-4" />
                  {t('admin.user.myBookings') || (lang === 'ar' ? 'حجوزاتي' : 'My Bookings')}
                </Button>
              </Link>
            ) : (
              <Link href="/login" prefetch={true}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <LogIn className="ms-2 h-4 w-4" />
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Button>
              </Link>
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
