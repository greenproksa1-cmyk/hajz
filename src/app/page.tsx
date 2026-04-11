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
import BookingSteps from '@/components/home/BookingSteps'
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
  | 'booking-steps'
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

  // URL Hash Sync for Persistence
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      const validViews: View[] = [
        'home', 'map', 'booking', 'admin', 'admin-dashboard', 
        'admin-new', 'user-dashboard', 'floor-plan-editor', 
        'floor-plan-manager', 'booth-management', 'payment-management',
        'booking-steps'
      ]
      
      if (hash && validViews.includes(hash as View)) {
        setCurrentView(hash as View)
      } else if (!hash) {
        setCurrentView('home')
      }
    }

    // Set initial view from hash if it exists
    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
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
      // If user navigates to 'map', just go to 'home' and the code will scroll to map
      const targetView = view === 'map' ? 'home' : view
      window.location.hash = targetView
      if (targetView === 'admin' && isAdminLoggedIn) {
        setCurrentView('admin-new')
      } else {
        setCurrentView(targetView as View)
      }

      // If they intended to go to the map, scroll down after rendering
      if (view === 'map') {
        setTimeout(() => {
          const mapSection = document.getElementById('booth-map-section');
          if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
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
    setCurrentView('home')
    fetchBooths()
  }, [fetchBooths])

  const handleAdminLogin = useCallback(() => {
    setIsAdminLoggedIn(true)
    setCurrentView('admin-new')
  }, [])

  const handleAdminLogout = useCallback(() => {
    setIsAdminLoggedIn(false)
    setCurrentView('home')
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
        {currentView === 'booking-steps' && (
          <BookingSteps onNavigate={handleNavigate} isRTL={isRTL} />
        )}

        {currentView === 'home' && (
          <>
            <HomeView onNavigate={handleNavigate} isRTL={isRTL} />
            <div id="booth-map-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2">{isRTL ? 'المخطط التفاعلي للمعرض' : 'Interactive Exhibition Map'}</h2>
                <p className="text-slate-500">{isRTL ? 'اختر جناحك المفضل لمعرض الرياض للمقاولين' : 'Choose your preferred booth for the Riyadh Contractors Exhibition'}</p>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
              ) : booths.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                   <div className="bg-blue-50 p-6 rounded-full mb-6">
                      <Globe className="h-12 w-12 text-blue-700" />
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
                      className="mt-6 bg-blue-600 hover:bg-blue-700"
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
          </>
        )}

        {currentView === 'booking' && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <BookingWizard
              selectedBooths={booths.filter((b) => selectedBoothIds.includes(b.id))}
              onComplete={handleBookingComplete}
              onCancel={() => {
                setCurrentView('home')
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
                setCurrentView('home')
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
  );
}
