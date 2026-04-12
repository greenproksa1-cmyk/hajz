'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Globe, Shield, UserCircle, LogIn, LayoutDashboard, ListOrdered, MapPin, Menu, X } from 'lucide-react'
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

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: null },
    { id: 'map', label: lang === 'ar' ? 'احجز بوثك' : 'Book Booth', icon: MapPin },
    { id: 'booking-steps', label: lang === 'ar' ? 'خطوات الحجز' : 'How to Book', icon: ListOrdered },
  ]

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
              className="h-9 sm:h-12 w-auto object-contain"
            />
          </button>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden gap-3">
             <Button
                variant="ghost"
                size="icon"
                onClick={toggleLang}
                className="text-white hover:bg-white/20"
              >
                <Globe className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-white hover:bg-white/20"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-2">
            {navItems.map((item) => (
               <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className={`text-white hover:bg-white/20 hover:text-white ${
                    currentView === item.id ? 'bg-white/20' : ''
                  }`}
                >
                  {item.icon && <item.icon className="ms-2 h-4 w-4" />}
                  {item.label}
                </Button>
            ))}

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

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-blue-700 p-4 space-y-2 animate-in slide-in-from-top duration-300">
           {navItems.map((item) => (
             <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10 text-lg py-6"
                onClick={() => {
                  onNavigate(item.id)
                  setIsMenuOpen(false)
                }}
             >
                {item.icon && <item.icon className="ms-3 h-5 w-5" />}
                {item.label}
             </Button>
           ))}
           <div className="h-px bg-white/10 my-4" />
           {session ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10 text-lg py-6"
                onClick={() => {
                  router.push('/dashboard')
                  setIsMenuOpen(false)
                }}
              >
                <LayoutDashboard className="ms-3 h-5 w-5" />
                {t('admin.user.myBookings') || (lang === 'ar' ? 'حجوزاتي' : 'My Bookings')}
              </Button>
           ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10 text-lg py-6"
                onClick={() => {
                  router.push('/login')
                  setIsMenuOpen(false)
                }}
              >
                <LogIn className="ms-3 h-5 w-5" />
                {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Button>
           )}
           <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 text-lg py-6"
              onClick={() => {
                onNavigate(currentView === 'admin-dashboard' ? 'admin-dashboard' : 'admin')
                setIsMenuOpen(false)
              }}
            >
              <Shield className="ms-3 h-5 w-5" />
              {t('nav.admin')}
            </Button>
        </div>
      )}
    </header>
  )
}
