"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("كلمات المرور غير متطابقة");
    }

    if (password.length < 8) {
      return toast.error("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("تم تغيير كلمة المرور بنجاح");
        setTimeout(() => router.push("/login"), 3000);
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

  if (!token) {
    return (
      <div className="text-center bg-white/80 p-8 rounded-3xl shadow-sm">
        <h1 className="text-xl font-bold text-red-600 mb-4">رابط غير صحيح</h1>
        <p className="text-gray-600 mb-6">يبدو أن رابط استعادة كلمة المرور غير صالح أو مفقود.</p>
        <Link href="/forgot-password">
          <Button variant="outline">طلب رابط جديد</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4 bg-white/80 p-10 rounded-3xl shadow-sm">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">تم التغيير بنجاح</h1>
        <p className="text-gray-600 mb-8">لقد تم تحديث كلمة المرور الخاصة بك. سيتم توجيهك لصفحة تسجيل الدخول...</p>
        <Link href="/login">
          <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700">دخول الآن</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-10 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 text-right"
      dir="rtl"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-blue-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">كلمة مرور جديدة</h1>
        <p className="mt-2 text-sm text-gray-500">أدخل كلمة المرور الجديدة الخاصة بحسابك أدناه.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور الجديدة</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 bg-white/50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 rounded-xl pe-10 text-right"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="h-12 bg-white/50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 rounded-xl text-right"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-700 to-blue-600 hover:from-orange-700 hover:to-blue-700 shadow-xl shadow-blue-600/20 rounded-xl"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "حفظ كلمة المرور"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 mix-blend-multiply blur-[100px] duration-10000" />
      <div className="absolute right-[-10%] top-[20%] h-[400px] w-[400px] animate-pulse rounded-full bg-amber-300/20 mix-blend-multiply blur-[100px] duration-10000" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] animate-pulse rounded-full bg-blue-600/10 mix-blend-multiply blur-[120px] duration-10000" style={{ animationDelay: '4s' }} />

      <Suspense fallback={<div className="bg-white p-8 rounded-3xl shadow-sm text-center">جاري التحميل...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
