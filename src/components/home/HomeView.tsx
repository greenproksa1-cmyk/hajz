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
      {/* Hero Section - Simple Prototype Style */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative container max-w-7xl mx-auto pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center" dir="rtl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/90 font-medium">
                15 - 18 مارس 2026 | الرياض، المملكة العربية السعودية
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              معرض الإنشاءات
              <br />
              <span className="text-amber-400">العالمي 2026</span>
            </h1>

            <p className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
              المنصة الرائدة لقطاع البناء والتشييد في الشرق الأوسط. احجز بوثك
              الآن وانضم إلى أكثر من 500 عارض من 40 دولة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => onNavigate("map")}
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl px-8 py-6 text-lg"
              >
                <MapPin className="w-5 h-5 ml-2" />
                استكشف خريطة البوثات
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl px-8 py-6 text-lg"
              >
                تعرف على المزيد
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto border-t border-white/10 pt-10">
              <StatItem value="500+" label="عارض" />
              <StatItem value="40+" label="دولة" />
              <StatItem value="50K+" label="زائر" />
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
      <div className="text-sm opacity-60">{label}</div>
    </div>
  );
}

function CategoryCard({ icon, title, price, color, features, onBook }: any) {
  const colorMap: any = {
    amber: "bg-amber-500",
    slate: "bg-slate-500",
    emerald: "bg-emerald-500",
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
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {f}
          </li>
        ))}
      </ul>
      <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl" onClick={onBook}>حجز الآن</Button>
    </div>
  );
}
