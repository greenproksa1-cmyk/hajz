'use client'

import { useTranslation } from '@/i18n'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  const { t, lang } = useTranslation()

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Exhibition Info */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-white">
              {lang === 'ar' ? 'معرض مقاولي الرياض 2026' : 'Riyadh Contractors Exhibition 2026'}
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              {lang === 'ar'
                ? 'أكبر معرض متخصص في قطاع المقاولات والبناء في المملكة العربية السعودية'
                : 'The largest specialized exhibition in the construction and contracting sector in Saudi Arabia'}
            </p>
          </div>

          {/* Location */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-white">
              {lang === 'ar' ? 'الموقع' : 'Location'}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                <span>{lang === 'ar' ? 'مركز الرياض للمؤتمرات والمعارض' : 'Riyadh International Convention & Exhibition Center'}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-white">
              {lang === 'ar' ? 'التواصل' : 'Contact'}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                <span dir="ltr">+966 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-orange-500" />
                <span>info@riyadh-contractors-exhibition.sa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {lang === 'ar' ? 'شركة معارض الرياض. جميع الحقوق محفوظة' : 'Riyadh Exhibition Company. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
