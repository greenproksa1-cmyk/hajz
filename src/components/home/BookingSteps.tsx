'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

interface BookingStepsProps {
  onNavigate: (view: string) => void
  isRTL?: boolean
}

const steps = [
  {
    number: '01',
    icon: '/images/steps/step1.png',
    titleAr: 'استكشف المساحة',
    titleEn: 'Explore the Grid',
    descAr: 'اختر موقعك الاستراتيجي في المعرض عبر خريطة تفاعلية ذكية تُظهر مواقع الأجنحة المتاحة في الوقت الفعلي.',
    descEn: 'Choose your strategic position in the exhibition through a smart interactive map showing real-time booth availability.',
    color: 'from-blue-600 to-indigo-700',
    glow: 'shadow-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  },
  {
    number: '02',
    icon: '/images/steps/step2.png',
    titleAr: 'حجز فوري',
    titleEn: 'Instant Booking',
    descAr: 'أدخل بيانات منشأتك (الاسم، الرقم الضريبي، النشاط) بضغطة زر. العملية لا تستغرق أكثر من دقيقتين.',
    descEn: 'Enter your company details (name, tax ID, activity) with a single click. The process takes less than two minutes.',
    color: 'from-blue-600 to-blue-700',
    glow: 'shadow-blue-600/30',
    badge: 'bg-blue-600/20 text-orange-300 border-blue-500/30',
  },
  {
    number: '03',
    icon: '/images/steps/step3.png',
    titleAr: 'التوثيق الرقمي',
    titleEn: 'Digital Documentation',
    descAr: 'سيتم توليد عقدك آلياً باللغتين العربية والإنجليزية. قم بتحميله، توقيعه، وإعادة رفعه من مكانك.',
    descEn: 'Your contract will be automatically generated in both Arabic and English. Download, sign, and re-upload from anywhere.',
    color: 'from-purple-600 to-violet-700',
    glow: 'shadow-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  },
  {
    number: '04',
    icon: '/images/steps/step4.png',
    titleAr: 'تأمين الحجز',
    titleEn: 'Secure Payment',
    descAr: 'قم بتحويل الرسوم المقررة وارفع إيصال السداد لضمان حجز المنصة باسمك وتأكيد مشاركتك الرسمية.',
    descEn: 'Transfer the required fees and upload the receipt to secure your booth and confirm your official participation.',
    color: 'from-slate-500 to-blue-600',
    glow: 'shadow-slate-500/30',
    badge: 'bg-slate-500/20 text-emerald-300 border-slate-400/30',
  },
  {
    number: '05',
    icon: '/images/steps/step5.png',
    titleAr: 'الاعتماد النهائي',
    titleEn: 'Final Approval',
    descAr: 'مبروك! بمجرد مراجعة طلبك من قِبل فريقنا، ستصلك نسخة معتمدة من العقد وتأكيد الحجز النهائي.',
    descEn: 'Congratulations! Once our team reviews your request, you will receive an approved contract and final booking confirmation.',
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const heroVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

export default function BookingSteps({ onNavigate, isRTL = true }: BookingStepsProps) {
  const lang = isRTL ? 'ar' : 'en'
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(to bottom, #f8fafc 0%, #eff6ff 100%)',
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero Section */}
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-600/10 text-orange-300 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>{isRTL ? 'الخطوات الخمس الذهبية للحجز' : 'The 5 Golden Steps to Booking'}</span>
          </div>

          <h1
            className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight"
          >
            {isRTL ? (
              <>
                كيف تحجز{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  بوثك؟
                </span>
              </>
            ) : (
              <>
                How to{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Book Your Booth?
                </span>
              </>
            )}
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isRTL
              ? 'عملية احترافية من خمس خطوات مصممة لتمنحك تجربة حجز عالمية المستوى — سريعة، آمنة، ورقمية بالكامل.'
              : 'A professional 5-step process designed to give you a world-class booking experience — fast, secure, and fully digital.'}
          </p>

          {/* CTA */}
          <Button
            onClick={() => onNavigate('map')}
            className="mt-8 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold px-8 py-6 text-lg rounded-2xl shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300"
          >
            <MapPin className="w-5 h-5 mx-2" />
            {isRTL ? 'احجز بوثك الآن' : 'Book Your Booth Now'}
            <ArrowIcon className="w-5 h-5 mx-2" />
          </Button>
        </motion.div>

        {/* Steps Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-8"
        >
          {steps.map((step, index) => {
            const isEven = index % 2 === 0
            return (
              <motion.div
                key={step.number}
                variants={cardVariants}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16 p-8 rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-xl transition-all duration-500`}
              >
                {/* Step Number - Background */}
                <div
                  className="absolute top-4 opacity-[0.03] text-slate-900 font-black text-[120px] leading-none pointer-events-none select-none"
                  style={{ [isRTL ? 'right' : 'left']: isEven ? '1rem' : undefined, [isRTL ? 'left' : 'right']: !isEven ? '1rem' : undefined }}
                >
                  {step.number}
                </div>

                {/* 3D Icon */}
                <div className={`relative flex-shrink-0 w-48 h-48 lg:w-64 lg:h-64`}>
                  {/* Glow ring */}
                  <div
                    className={`absolute inset-4 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-2xl`}
                  />
                  {/* Floating animation container */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
                    className="relative w-full h-full"
                  >
                    <img
                      src={step.icon}
                      alt={step.titleEn}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-start">
                  {/* Step badge */}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${step.badge} mb-4 backdrop-blur-sm`}
                  >
                    {isRTL ? `الخطوة ${step.number}` : `Step ${step.number}`}
                  </span>

                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 leading-tight">
                    {isRTL ? step.titleAr : step.titleEn}
                  </h2>

                  {/* Title in other language */}
                  <p
                    className={`text-base font-semibold mb-4 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                  >
                    {isRTL ? step.titleEn : step.titleAr}
                  </p>

                  <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
                    {isRTL ? step.descAr : step.descEn}
                  </p>

                  {/* Progress dots */}
                  <div className="flex gap-2 mt-6 justify-center lg:justify-start">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === index
                            ? `w-8 bg-gradient-to-r ${step.color}`
                            : i < index
                            ? 'w-4 bg-blue-300'
                            : 'w-4 bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Final CTA Banner */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="mt-20 text-center p-12 rounded-3xl border border-blue-100 bg-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-3xl font-black text-slate-900 mb-4">
            {isRTL ? 'جاهز لتأمين مكانك؟' : 'Ready to Secure Your Spot?'}
          </h3>
          <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
            {isRTL
              ? 'انضم إلى أكثر من 500 شركة رائدة في القطاع. الأماكن محدودة، لا تفوّت الفرصة.'
              : 'Join over 500 leading companies in the sector. Spaces are limited — don\'t miss the opportunity.'}
          </p>
          <Button
            onClick={() => onNavigate('map')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-black px-12 py-6 text-xl rounded-2xl shadow-2xl shadow-blue-600/40 hover:scale-105 transition-all duration-300"
          >
            {isRTL ? 'ابدأ حجزك الآن ←' : '→ Start Booking Now'}
          </Button>
        </motion.div>

      </div>
    </div>
  )
}
