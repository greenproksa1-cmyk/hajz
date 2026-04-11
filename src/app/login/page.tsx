"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim(),
      password: password.trim(),
      redirect: false,
    });

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
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
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-10 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60"
      >
        <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-600 transition-colors mb-6 group" dir="rtl">
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          العودة للرئيسية
        </Link>

        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">مرحباً بعودتك</h1>
          <p className="mt-2 text-sm text-gray-500">أدخل بياناتك للوصول إلى منصة إدارة حجوزاتك</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 text-sm font-medium text-red-600 bg-red-50/80 border border-red-100 rounded-xl mb-6 text-right"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-5" dir="rtl">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-700 font-medium">اسم المستخدم أو البريد الإلكتروني</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="اسم المستخدم"
              required
              className="text-right h-12 bg-white/50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 transition-all rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
             <div className="flex justify-between items-center">
               <Label htmlFor="password" className="text-gray-700 font-medium">كلمة المرور</Label>
               <Link href="#" className="text-xs text-blue-700 hover:text-blue-600 font-medium">نسيت كلمة المرور؟</Link>
             </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="text-right h-12 bg-white/50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 transition-all rounded-xl pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 flex items-center ps-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-700 to-blue-600 hover:from-orange-700 hover:to-blue-700 shadow-xl shadow-blue-600/20 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-600 transition-colors">
            إنشاء حساب جديد
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
