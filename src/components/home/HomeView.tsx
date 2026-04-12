import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Crown,
  MapPin,
  Star,
  ArrowLeft,
  CheckCircle2,
  Gem,
} from "lucide-react";

interface HomeViewProps {
  onNavigate: (view: string) => void;
  isRTL?: boolean;
}

export default function HomeView({ onNavigate, isRTL = true }: HomeViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - 2 Column Layout with Booth Image */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative container max-w-7xl mx-auto pt-24 pb-16 px-6">
          <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`} dir={isRTL ? "rtl" : "ltr"}>
            
            {/* Text Side */}
            <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 mb-8">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-100 font-medium">
                  {isRTL ? '15 - 18 مارس 2026 | الرياض، المملكة العربية السعودية' : '15 - 18 March 2026 | Riyadh, Saudi Arabia'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {isRTL ? (
                  <>معرض مقاولين<br /><span className="text-blue-600">الرياض 2026</span></>
                ) : (
                  <>Riyadh Contractors<br /><span className="text-blue-600">Exhibition 2026</span></>
                )}
              </h1>

              <p className="text-lg lg:text-xl text-blue-100/80 mb-10 max-w-2xl leading-relaxed">
                {isRTL 
                  ? 'المنصة الرائدة لقطاع البناء والتشييد في المملكة العربية السعودية. احجز جناحك الآن وانضم إلى أكثر من 500 عارض.'
                  : 'The leading platform for the construction and building sector in Saudi Arabia. Book your booth now and join over 500 exhibitors.'}
              </p>

              <div className={`flex flex-col sm:flex-row items-center justify-center ${isRTL ? 'lg:justify-start' : 'lg:justify-start'} gap-4`}>
                <Button
                  onClick={() => onNavigate("map")}
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-blue-950 font-bold rounded-xl px-8 py-6 text-lg hover:scale-105 transition-transform"
                >
                  <MapPin className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'احجز بوثك الآن' : 'Book Booth Now'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl px-8 py-6 text-lg"
                >
                  {isRTL ? 'تعرف على المزيد' : 'Learn More'}
                  <ArrowLeft className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? '' : 'rotate-180'}`} />
                </Button>
              </div>

              {/* Simple Stats */}
              <div className={`grid grid-cols-2 sm:flex gap-6 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/10 justify-center ${isRTL ? 'lg:justify-start' : 'lg:justify-start'}`}>
                <StatItem value="500+" label={isRTL ? "عارض" : "Exhibitors"} />
                <StatItem value="40+" label={isRTL ? "دولة" : "Countries"} />
                <StatItem value="50K+" label={isRTL ? "زائر" : "Visitors"} />
              </div>
            </div>

            {/* Image Side (Left in RTL) */}
            <div className="flex-1 w-full relative">
               <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl lg:rounded-[3rem] overflow-hidden border-4 sm:border-8 border-white bg-white shadow-xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 opacity-10" />
                  {/* Generated Booth Image */}
                  <img 
                    src="/images/modern_booth.png" 
                    alt="معرض البوثات والمقاولين" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute bottom-4 left-4 right-4 sm:bottom-6 ${isRTL ? 'sm:left-6 sm:right-6 lg:left-auto' : 'sm:left-6 sm:right-6 lg:right-auto'} z-20 bg-white/90 backdrop-blur-md border border-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg`}>
                     <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                           <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-slate-900 font-bold text-base sm:text-lg leading-tight">{isRTL ? 'أجنحة مخصصة للشركات' : 'Custom Corporate Booths'}</p>
                           <p className="text-slate-600 text-[10px] sm:text-sm">{isRTL ? 'مساحات مصممة بأعلى معايير الجودة' : 'Designed with the highest quality standards'}</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Decorative dots behind the image */}
               <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]" />
            </div>

          </div>
        </div>
      </section>

      {/* Categories - Professional Redesign */}
      <section className="py-24 bg-slate-50 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] -ml-48 -mb-48" />

        <div className="relative container max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              {isRTL ? 'باقات الرعاية والمشاركة' : 'Sponsorship & Participation'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {isRTL 
                ? 'استثمر في حضورك واختر الباقة التي تمنح علامتك التجارية القوة والتأثير اللازم في قطاع الإنشاءات.' 
                : 'Invest in your presence and choose the package that gives your brand the power and impact needed in the construction sector.'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <CategoryCard
              icon={<Gem className="w-8 h-8" />}
              title={isRTL ? "الراعي الماسي" : "Diamond Sponsor"}
              price="295,000"
              color="diamond"
              featured={true}
              features={isRTL 
                ? ["مساحة (80) متر مربع", "واجهة المعرض الرئيسية", "8 دعوات VIP مجانية", "درع تكريم + تغطية إعلامية موسعة", "أولوية اختيار الموقع"] 
                : ["80 sqm Exhibition Area", "Main Entrance Facade", "8 VIP Invitations", "Honor Shield + PR Coverage", "Priority Location Selection"]}
              onBook={() => onNavigate("map")}
              isRTL={isRTL}
              index={0}
            />
            <CategoryCard
              icon={<Crown className="w-8 h-8" />}
              title={isRTL ? "الراعي الذهبي" : "Gold Sponsor"}
              price="245,000"
              color="gold"
              features={isRTL 
                ? ["مساحة (50) متر مربع", "موقع استراتيجي متميز", "6 دعوات VIP مجانية", "شهادة شكر وتكريم رسمية", "دعم فني مخصص"] 
                : ["50 sqm Exhibition Area", "Strategic Premium Location", "6 VIP Invitations", "Official Appreciation Certificate", "Dedicated Support"]}
              onBook={() => onNavigate("map")}
              isRTL={isRTL}
              index={1}
            />
            <CategoryCard
              icon={<Star className="w-8 h-8" />}
              title={isRTL ? "الراعي الفضي" : "Silver Sponsor"}
              price="195,000"
              color="silver"
              features={isRTL 
                ? ["مساحة (35) متر مربع", "جناح مشاركة مميز", "4 دعوات VIP مجانية", "شهادة شكر وتكريم", "تجهيزات أساسية متكاملة"] 
                : ["35 sqm Exhibition Area", "Featured Booth Spot", "4 VIP Invitations", "Appreciation Certificate", "Basic Setup Included"]}
              onBook={() => onNavigate("map")}
              isRTL={isRTL}
              index={2}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center text-white">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-60 font-medium">{label}</div>
    </div>
  );
}

function CategoryCard({ icon, title, price, color, features, onBook, isRTL, featured, index }: any) {
  const colorMap: any = {
    diamond: "from-cyan-400 to-blue-600 shadow-cyan-200/50 border-cyan-100",
    gold: "from-amber-300 to-orange-500 shadow-orange-200/50 border-orange-100",
    silver: "from-slate-300 to-slate-500 shadow-slate-200/50 border-slate-100",
  };

  const borderGlow: any = {
    diamond: "hover:border-cyan-400/50",
    gold: "hover:border-orange-400/50",
    silver: "hover:border-slate-400/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -10 }}
      className={`relative group bg-white rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-10 border-2 transition-all duration-500 shadow-2xl shadow-slate-200/50 ${featured ? 'border-cyan-500/20 md:scale-105 z-10' : 'border-transparent ' + borderGlow[color]}`}
    >
      {featured && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
          {isRTL ? 'الأكثر تميزاً' : 'The Most Exclusive'}
        </div>
      )}

      {/* Header Info */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${colorMap[color]} text-white mb-6 shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          {icon}
        </div>
        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{isRTL ? 'باقة مشاركة' : 'Participation Package'}</p>
      </div>

      {/* Price */}
      <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-center group-hover:bg-slate-100 transition-colors duration-300">
        <div className="text-slate-400 text-xs font-bold mb-1">{isRTL ? 'قيمة الاستثمار' : 'Investment Value'}</div>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{price}</span>
          <span className="text-slate-500 font-bold">{isRTL ? 'ريال' : 'SAR'}</span>
        </div>
      </div>

      {/* Features List */}
      <ul className="space-y-4 mb-10 text-right" dir={isRTL ? 'rtl' : 'ltr'}>
        {features.map((f: string) => (
          <li key={f} className="flex items-start gap-3 text-slate-600 font-medium">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm lg:text-base leading-tight">{f}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`w-full py-7 rounded-2xl text-lg font-black transition-all duration-300 shadow-xl active:scale-95 ${
          featured 
            ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white' 
            : 'bg-slate-950 hover:bg-slate-900 text-white'
        }`}
        onClick={onBook}
      >
        {isRTL ? 'احجز الباقة الآن' : 'Book Package Now'}
      </Button>
    </motion.div>
  );
}
