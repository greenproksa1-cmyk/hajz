"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("تم إرسال تعليمات الاستعادة بنجاح");
      } else {
        const data = await res.json();
        toast.error(data.message || "حدث خطأ ما");
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 mix-blend-multiply blur-[100px] duration-10000" />
      <div className="absolute right-[-10%] top-[20%] h-[400px] w-[400px] animate-pulse rounded-full bg-amber-300/20 mix-blend-multiply blur-[100px] duration-10000" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] animate-pulse rounded-full bg-blue-600/10 mix-blend-multiply blur-[120px] duration-10000" style={{ animationDelay: '4s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-10 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 text-right"
        dir="rtl"
      >
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-600 transition-colors mb-6 group">
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          العودة لتسجيل الدخول
        </Link>

        {submitted ? (
          <div className="text-center py-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">تحقق من بريدك الإلكتروني</h1>
            <p className="text-gray-600 mb-8">
              لقد أرسلنا رابطاً لاستعادة كلمة المرور إلى <strong>{email}</strong>. يرجى التحقق من صندوق الوارد (أو الرسائل غير المرغوب فيها).
            </p>
            <Link href="/login">
              <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700">العودة لتسجيل الدخول</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-700" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">نسيت كلمة المرور؟</h1>
              <p className="mt-2 text-sm text-gray-500">لا تقلق، أدخل بريدك الإلكتروني وسنرسل لك رابطاً لتعيين واحدة جديدة.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-12 bg-white/50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 transition-all rounded-xl text-right"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-700 to-blue-600 hover:from-orange-700 hover:to-blue-700 shadow-xl shadow-blue-600/20 rounded-xl"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "إرسال رابط الاستعادة"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
