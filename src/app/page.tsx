'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TranslationProvider, useTranslation } from '@/i18n'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BoothMap, { type BoothData } from '@/components/booth/BoothMap'
import BookingWizard from '@/components/booking/BookingWizard'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminDashboardNew from '@/components/admin/AdminDashboardNew'
import UserDashboard from '@/components/user/UserDashboard'
import HomeView from '@/components/home/HomeView'
import { Button } from '@/components/ui/button'
import { Globe, ArrowLeft, ArrowRight } from 'lucide-react'
import { Loader2 } from 'lucide-react'

type View =
  | 'home'
  | 'map'
  | 'booking'
  | 'admin'
  | 'admin-dashboard'
  | 'admin-new'
  | 'user-dashboard'
  | 'floor-plan-editor'
  | 'floor-plan-manager'
  | 'booth-management'
  | 'payment-management'

// Slim admin bar shown instead of full header when in admin-new view
function AdminBar({
  dir,
  onNavigate,
}: {
  dir: string
  onNavigate: (view: string) => void
}) {
  const { lang, setLang } = useTranslation()

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }

  const ArrowBack = dir === 'rtl' ? ArrowRight : ArrowLeft

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center border-b border-gray-700 bg-gray-900 px-4 shadow-sm">
      <button
        onClick={() => onNavigate('map')}
        className="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
      >
        <ArrowBack className="h-4 w-4" />
        <span>{dir === 'rtl' ? 'العودة للموقع' : 'Back to Site'}</span>
      </button>
      <div className="ms-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className="h-8 gap-1.5 text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <Globe className="h-4 w-4" />
          {lang === 'ar' ? 'English' : 'العربية'}
        </Button>
      </div>
    </header>
  )
}

function AppContent() {
  const { t, dir, isRTL } = useTranslation()
  const [currentView, setCurrentView] = useState<View>('home')
  const [booths, setBooths] = useState<BoothData[]>([])
  const [selectedBoothIds, setSelectedBoothIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [floorPlanId, setFloorPlanId] = useState<string | null>(null)
  const [userTrackingEmail, setUserTrackingEmail] = useState<string | null>(null)
  const [floorPlanMetadata, setFloorPlanMetadata] = useState<{ width: number; height: number; name: string } | null>(null)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchBooths = useCallback(async () => {
    try {
      const res = await fetch('/api/booths')
      const data = await res.json()
      if (data.success) {
        setBooths(data.data)
        if (data.floorPlan) {
          setFloorPlanMetadata(data.floorPlan)
        }
      }
    } catch {
      // Silently fail on refresh
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooths()
    // Refresh booths every 30 seconds
    refreshIntervalRef.current = setInterval(fetchBooths, 30000)
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
  }, [fetchBooths])

  const handleNavigate = useCallback(
    (view: string) => {
      if (view === 'admin' && isAdminLoggedIn) {
        setCurrentView('admin-new')
      } else {
        setCurrentView(view as View)
      }
    },
    [isAdminLoggedIn]
  )

  const handleBookNow = useCallback(() => {
    if (selectedBoothIds.length > 0) {
      setCurrentView('booking')
    }
  }, [selectedBoothIds])

  const handleBookingComplete = useCallback(() => {
    setSelectedBoothIds([])
    setCurrentView('map')
    fetchBooths()
  }, [fetchBooths])

  const handleAdminLogin = useCallback(() => {
    setIsAdminLoggedIn(true)
    setCurrentView('admin-new')
  }, [])

  const handleAdminLogout = useCallback(() => {
    setIsAdminLoggedIn(false)
    setCurrentView('map')
  }, [])

  const showAdminBar = currentView === 'admin-new' && isAdminLoggedIn

  return (
    <div dir={dir} className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {showAdminBar ? (
        <AdminBar dir={dir} onNavigate={handleNavigate} />
      ) : (
        <Header currentView={currentView} onNavigate={handleNavigate} />
      )}

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView onNavigate={handleNavigate} />
        )}

        {currentView === 'map' && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              </div>
            ) : booths.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                 <div className="bg-orange-100 p-6 rounded-full mb-6">
                    <Globe className="h-12 w-12 text-orange-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isRTL ? 'لا يوجد معرض نشط حالياً' : 'No Active Exhibition'}
                 </h2>
                 <p className="text-gray-500 max-w-md">
                    {isRTL 
                      ? 'يرجى مراجعة الموقع لاحقاً، المخطط الحالي قيد التحديث أو غير متاح.' 
                      : 'Please check back later. The floor plan is currently being updated or is not available.'}
                 </p>
                 {isAdminLoggedIn && (
                   <Button 
                    onClick={() => setCurrentView('admin-new')}
                    className="mt-6 bg-orange-500 hover:bg-orange-600"
                   >
                     {isRTL ? 'إنشاء أول مخطط' : 'Create First Plan'}
                   </Button>
                 )}
              </div>
            ) : (
              <BoothMap
                booths={booths}
                selectedBoothIds={selectedBoothIds}
                onSelectBooths={setSelectedBoothIds}
                onBookNow={handleBookNow}
                dimensions={floorPlanMetadata}
              />
            )}
          </div>
        )}

        {currentView === 'booking' && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <BookingWizard
              selectedBooths={booths.filter((b) => selectedBoothIds.includes(b.id))}
              onComplete={handleBookingComplete}
              onCancel={() => {
                setCurrentView('map')
              }}
            />
          </div>
        )}

        {currentView === 'admin' && !isAdminLoggedIn && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <AdminLogin onLogin={handleAdminLogin} />
          </div>
        )}

        {currentView === 'admin-dashboard' && !isAdminLoggedIn && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <AdminLogin onLogin={handleAdminLogin} />
          </div>
        )}

        {currentView === 'admin-dashboard' && isAdminLoggedIn && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <AdminDashboard onLogout={handleAdminLogout} />
          </div>
        )}

        {currentView === 'admin-new' && !isAdminLoggedIn && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <AdminLogin onLogin={handleAdminLogin} />
          </div>
        )}

        {currentView === 'admin-new' && isAdminLoggedIn && (
          <AdminDashboardNew onLogout={handleAdminLogout} />
        )}

        {currentView === 'user-dashboard' && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <UserDashboard
              email={userTrackingEmail}
              onBack={() => {
                setCurrentView('map')
              }}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <TranslationProvider>
      <AppContent />
    </TranslationProvider>
  )
}
