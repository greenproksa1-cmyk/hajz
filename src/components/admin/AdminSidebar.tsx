'use client'

import { useTranslation } from '@/i18n'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  LayoutDashboard,
  Map,
  Box,
  ClipboardList,
  CreditCard,
  LogOut,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

const tabs = [
  { key: 'dashboard', icon: LayoutDashboard, labelKey: 'admin.sidebar.dashboard' },
  { key: 'floor-plans', icon: Map, labelKey: 'admin.sidebar.floorPlans' },
  { key: 'booths', icon: Box, labelKey: 'admin.sidebar.booths' },
  { key: 'bookings', icon: ClipboardList, labelKey: 'admin.sidebar.bookings' },
  { key: 'payments', icon: CreditCard, labelKey: 'admin.sidebar.payments' },
]

function SidebarContent({
  activeTab,
  onTabChange,
  onLogout,
  t,
  isRTL,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  t: (key: string) => string
  isRTL: boolean
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-white">
          {t('admin.dashboard')}
        </h2>
        <p className="text-xs text-gray-400">
          {isRTL ? 'معرض مقاولي الرياض 2026' : 'Riyadh Contractors Exhibition 2026'}
        </p>
      </div>

      <Separator className="bg-gray-700" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-gray-700" />

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t('admin.logout')}</span>
        </Button>
      </div>
    </div>
  )
}

export default function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const { t, isRTL } = useTranslation()
  const isMobile = useIsMobile()

  // Desktop sidebar
  if (!isMobile) {
    return (
      <aside
        className={cn(
          'flex h-screen w-60 shrink-0 flex-col bg-gray-900 text-white',
          isRTL ? 'order-last border-l border-gray-700' : 'order-first border-r border-gray-700'
        )}
      >
        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
          t={t}
          isRTL={isRTL}
        />
      </aside>
    )
  }

  // Mobile drawer
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-20 z-40 rounded-full bg-gray-900 text-white shadow-lg md:hidden"
          style={isRTL ? { left: '1rem' } : { right: '1rem' }}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-60 bg-gray-900 p-0 text-white"
      >
        <SheetTitle className="sr-only">{t('admin.dashboard')}</SheetTitle>
        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
          t={t}
          isRTL={isRTL}
        />
      </SheetContent>
    </Sheet>
  )
}
