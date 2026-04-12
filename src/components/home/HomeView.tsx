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
  Globe,
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
        
        {/* Glow effects - More dynamic for mobile */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-indigo-600/10 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4" />

        <div className="relative container max-w-7xl mx-auto pt-24 pb-16 px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20" dir={isRTL ? "rtl" : "ltr"}>
            
            {/* Text Side */}
            <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'} z-20`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-500/20 mb-8"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm text-blue-100 font-bold uppercase tracking-wider">
                  {isRTL ? '15 - 18 مارس 2026 | الرياض' : '15 - 18 March 2026 | Riyadh'}
                </span>
              </motion.div>
 
               <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
              >
                {isRTL ? (
                  <>معرض مقاولي<br /><span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">الرياض 2026</span></>
                ) : (
                  <>Riyadh Construction<br /><span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Exhibition 2026</span></>
                )}
              </motion.h1>
 
               <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg lg:text-xl text-blue-100/70 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                {isRTL 
                  ? 'المنصة الرائدة لقطاع البناء والتشييد في المملكة. احجز جناحك الآن وانضم إلى رواد الصناعة.'
                  : 'The leading platform for the construction sector in the Kingdom. Book your booth now and join industry leaders.'}
              </motion.p>
 
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`flex flex-col sm:flex-row items-center justify-center ${isRTL ? 'lg:justify-start' : 'lg:justify-start'} gap-4`}
              >
                <Button
                  onClick={() => onNavigate("map")}
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl px-10 py-7 text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  <MapPin className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'احجز بوثك الآن' : 'Book Booth Now'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 rounded-2xl px-10 py-7 text-lg active:scale-95 transition-all"
                >
                  {isRTL ? 'تعرف على المزيد' : 'Learn More'}
                  <ArrowLeft className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'} ${isRTL ? '' : 'rotate-180'}`} />
                </Button>
              </motion.div>
 
               {/* Simple Stats - Perfectly arranged 3 columns */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`grid grid-cols-3 gap-4 sm:gap-8 mt-16 pt-10 border-t border-white/10`}
              >
                <StatItem value="500+" label={isRTL ? "عارض" : "Exhibitors"} icon={<Building2 className="w-4 h-4 text-blue-400 mb-1" />} />
                <StatItem value="40+" label={isRTL ? "دولة" : "Countries"} icon={<Globe className="w-4 h-4 text-blue-400 mb-1" />} />
                <StatItem value="50K+" label={isRTL ? "زائر" : "Visitors"} icon={<Star className="w-4 h-4 text-blue-400 mb-1" />} />
              </motion.div>
            </div>
 
             {/* Image Side - Integrated Background Style */}
            <div className="flex-1 w-full relative group">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[2rem] sm:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl"
              >
                  <img 
                    src="/images/modern_booth.png" 
                    alt="معرض البوثات والمقاولين" 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  
                  {/* Integrated Badge instead of overlay card */}
                  <div className={`absolute bottom-8 ${isRTL ? 'right-8' : 'left-8'} flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl`}>
                     <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Gem className="w-5 h-5 text-white" />
                     </div>
                     <div>
                        <p className="text-white font-bold text-sm leading-none mb-1">{isRTL ? 'أجنحة النخبة' : 'Elite Booths'}</p>
                        <p className="text-white/60 text-[10px] uppercase tracking-widest">{isRTL ? 'مساحات ملكية' : 'Royal Spaces'}</p>
                     </div>
                  </div>
               </motion.div>
               
               {/* Decorative glow behind image */}
               <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/20 rounded-full blur-[100px] opacity-50" />
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

function StatItem({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="text-center group">
       <div className="flex justify-center transition-transform group-hover:-translate-y-1">
          {icon}
       </div>
      <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{value}</div>
      <div className="text-[10px] sm:text-xs text-blue-100/50 font-bold uppercase tracking-widest">{label}</div>
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
      className={`relative group bg-white rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border-2 transition-all duration-500 shadow-xl shadow-slate-200/40 ${featured ? 'border-blue-500/20 md:scale-105 z-10 ring-4 ring-blue-50/50' : 'border-slate-100 hover:border-blue-200'}`}
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
