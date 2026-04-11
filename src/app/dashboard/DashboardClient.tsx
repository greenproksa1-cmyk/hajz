"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, CalendarCheck, ArrowRight, LayoutDashboard, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardClient({ user, userBookings }: { user: any, userBookings: any[] }) {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6" dir="rtl">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-300/10 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10">
        
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-l from-blue-700 via-blue-600 to-blue-600 p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-blue-600/20 mb-10 text-white flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Glass pattern overlay */}
          <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
               <LayoutDashboard size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">أهلاً بك، {user.name}</h1>
              <p className="text-blue-50 text-sm sm:text-base font-medium">لوحة التحكم الخاصة بمعارضك وحجوزاتك</p>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-3">
             <Link href="/">
               <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md">
                 <ArrowRight className="ml-2 h-4 w-4" /> العودة للرئيسية
               </Button>
             </Link>
             <Link href="/api/auth/signout">
               <Button variant="outline" className="bg-white text-blue-700 border-none hover:bg-orange-50 shadow-lg">
                 تسجيل الخروج
               </Button>
             </Link>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 shadow-sm border border-orange-200">
               <CalendarCheck size={20} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">حجوزاتك السابقة <span className="text-blue-600 font-sans text-xl">({userBookings.length})</span></h2>
          </motion.div>

          {userBookings.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60"
            >
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Ticket size={40} className="text-orange-300" />
              </div>
              <p className="text-slate-500 text-lg mb-6 font-medium">ليس لديك أي حجوزات حتى الآن.</p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-orange-700 hover:to-blue-700 rounded-xl px-8 h-12 shadow-lg shadow-blue-600/20">
                  احجز جناحك الآن واحصل على مساحتك
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {userBookings.map((booking) => (
                <motion.div 
                  key={booking.id} 
                  variants={item}
                  className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] hover:border-orange-200 transition-all duration-300 flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-5">
                    <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-mono font-medium">
                      #{booking.id.substring(0, 8)}
                    </span>
                    <span className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${
                      booking.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-blue-50 text-orange-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        booking.status === 'approved' ? 'bg-emerald-500' :
                        booking.status === 'rejected' ? 'bg-red-500' :
                        'bg-blue-600 animate-pulse'
                      }`} />
                      {booking.status === 'approved' ? 'موافق عليه' : 
                       booking.status === 'rejected' ? 'مرفوض' : 'معلق'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-xl text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{booking.entityName}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-6">{new Date(booking.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex-grow">
                     <div className="flex justify-between mb-3 text-sm">
                       <span className="text-slate-500">الجناح:</span>
                       <span className="font-bold text-slate-700" dir="ltr">{booking.booths.map((b: any) => b.label).join(", ")}</span>
                     </div>
                     <div className="w-full h-[1px] bg-slate-200/60 mb-3" />
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-500">الإجمالي:</span>
                       <span className="font-bold text-blue-700 bg-orange-50 px-2 py-0.5 rounded-md">{booking.totalPrice.toLocaleString()} ر.س</span>
                     </div>
                  </div>
                  
                  <div className="mt-auto flex gap-2 w-full pt-2">
                    <a href={`/api/contract/download/${booking.id}`} target="_blank" className="flex-1 w-full relative">
                      {/* Pseudo element to create continuous glow inside the button */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-amber-300 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-500 pb-1"></div>
                      <Button variant="outline" className="relative w-full flex items-center justify-center gap-2 h-12 rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 bg-white shadow-sm font-medium">
                        <FileText size={18} />
                        معاينة العقد وثيقة
                      </Button>
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
