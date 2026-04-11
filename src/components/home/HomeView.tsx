import React from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  Crown,
  MapPin,
  Star,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
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
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20" dir="rtl">
            
            {/* Text Side (Right in RTL) */}
            <div className="flex-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 mb-8">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-100 font-medium">
                  15 - 18 مارس 2026 | الرياض، المملكة العربية السعودية
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                معرض مقاولين
                <br />
                <span className="text-blue-600">الرياض 2026</span>
              </h1>

              <p className="text-lg lg:text-xl text-blue-100/80 mb-10 max-w-2xl leading-relaxed">
                المنصة الرائدة لقطاع البناء والتشييد في المملكة العربية السعودية. احجز بوثك الآن وانضم إلى أكثر من 500 عارض.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  onClick={() => onNavigate("map")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-blue-950 font-bold rounded-xl px-8 py-6 text-lg hover:scale-105 transition-transform"
                >
                  <MapPin className="w-5 h-5 ml-2" />
                  احجز بوثك الآن
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl px-8 py-6 text-lg"
                >
                  تعرف على المزيد
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </div>

              {/* Simple Stats */}
              <div className="flex gap-8 mt-16 pt-10 border-t border-white/10 justify-center lg:justify-start">
                <StatItem value="500+" label="عارض" />
                <StatItem value="40+" label="دولة" />
                <StatItem value="50K+" label="زائر" />
              </div>
            </div>

            {/* Image Side (Left in RTL) */}
            <div className="flex-1 w-full relative">
               <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-[3rem] overflow-hidden border-8 border-white bg-white shadow-xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10 opacity-10" />
                  {/* Generated Booth Image */}
                  <img 
                    src="/images/modern_booth.png" 
                    alt="معرض البوثات والمقاولين" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/90 backdrop-blur-md border border-white p-6 rounded-3xl shadow-lg">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                           <Star className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-slate-900 font-bold text-lg">أجنحة مخصصة للشركات</p>
                           <p className="text-slate-600 text-sm">مساحات مصممة بأعلى معايير الجودة</p>
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

      {/* Categories */}
      <section className="py-20 bg-background" dir="rtl">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">فئات البوثات المتاحة</h2>
            <p className="text-muted-foreground">اختر الفئة التي تناسب احتياجات عرضك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <CategoryCard
              icon={<Crown className="w-7 h-7" />}
              title="منطقة VIP"
              price="75,000"
              color="amber"
              features={["موقع متميز", "إضاءة مخصصة", "خدمة استقبال", "شاشة عرض"]}
              onBook={() => onNavigate("map")}
            />
            <CategoryCard
              icon={<Star className="w-7 h-7" />}
              title="منطقة الرعاة"
              price="45,000"
              color="slate"
              features={["مساحة واسعة", "شعار على المواد", "تخطيط مخصص", "دعوات VIP"]}
              onBook={() => onNavigate("map")}
            />
            <CategoryCard
              icon={<Building2 className="w-7 h-7" />}
              title="منطقة قياسية"
              price="15,000"
              color="emerald"
              features={["بوث مجهز", "إنترنت فائق", "كهرباء", "لوحة اسم"]}
              onBook={() => onNavigate("map")}
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

function CategoryCard({ icon, title, price, color, features, onBook }: any) {
  const colorMap: any = {
    amber: "bg-blue-600",
    slate: "bg-blue-500",
    emerald: "bg-blue-400",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${colorMap[color]} text-white flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-2xl font-black text-slate-900 mb-6">{price} <span className="text-sm font-normal">SAR</span></p>
      <ul className="space-y-3 mb-8">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            {f}
          </li>
        ))}
      </ul>
      <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl" onClick={onBook}>حجز الآن</Button>
    </div>
  );
}
