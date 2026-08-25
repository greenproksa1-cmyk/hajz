'use client'

import { useState, createContext, useContext, useCallback } from 'react'
import ar from './ar.json'
import en from './en.json'

type Lang = 'ar' | 'en'
const translations = { ar, en } as const

interface TranslationContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
  dir: 'rtl' | 'ltr'
  isRTL: boolean
}

const TranslationContext = createContext<TranslationContextType | null>(null)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar')

  const t = useCallback((key: string): string => {
    const keys = key.split('.')
    let value: unknown = translations[lang]
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    return (value as string) || key
  }, [lang])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const isRTL = lang === 'ar'

  return (
    <TranslationContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) throw new Error('useTranslation must be used within TranslationProvider')
  return context
}
