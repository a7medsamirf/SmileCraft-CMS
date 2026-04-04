"use client";

// =============================================================================
// DENTAL CMS — Authentication: Login Page
// Redesigned to match signin.html — split-screen dark theme
// =============================================================================

import React, { useTransition, useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from "lucide-react";
import { loginAction } from "./loginAction";
import { loginSchema, type LoginFormData } from "./schema";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

// ─── CSS Keyframes (injected once) ──────────────────────────────────────────
const AuthStyles = () => (
  <style>{`
    @keyframes authFadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes authGridPan {
      from { transform: translate(0, 0); }
      to   { transform: translate(60px, 60px); }
    }
    @keyframes authFloat {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes authErrIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .auth-fade-up   { animation: authFadeUp 0.5s ease both; }
    .auth-float     { animation: authFloat 3s ease-in-out infinite; }
    .auth-grid-pan  { animation: authGridPan 12s linear infinite; }
    .auth-err-in    { animation: authErrIn 0.3s ease both; }
  `}</style>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isMutating = isPending || isSubmitting || !!successMsg;

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (result.success) {
        setSuccessMsg(result.message || "تم تسجيل الدخول بنجاح");
        setTimeout(() => {
          // Force a hard navigation to bypass Next.js client-side cache
          window.location.href = window.location.pathname.replace(/\/login$/, '/dashboard');
        }, 1000);
      } else if (result.errors?.form) {
        setServerError(result.errors.form[0]);
      }
    });
  };

  return (
    <>
      <AuthStyles />

      {/* ══════════ LEFT PANEL — Branding (Desktop Only) ══════════ */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col justify-between p-10 relative overflow-hidden bg-[#0B1525]">
        {/* Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.035] auth-grid-pan"
          style={{
            backgroundImage:
              "linear-gradient(rgb(37, 99, 235) 1px, transparent 1px), linear-gradient(90deg, rgb(37, 99, 235) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Radial Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(rgba(37, 99, 235, 0.08) 0%, transparent 65%)" }}
        />

        {/* Top Accent Line */}
        <div
          className="absolute top-0 right-0 left-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #2563EB, transparent)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-xl font-black text-white tracking-tight">
            <span className="text-blue-500">Smile</span>Craft
          </span>
        </div>

        {/* Hero Text + Stats */}
        <div className="relative z-10 space-y-8">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400 text-[12px] font-bold">مرحباً بعودتك</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
              عيادتك بانتظارك
              <br />
              <span className="text-blue-400">سجّل دخولك الآن</span>
            </h2>
            <p className="text-slate-500 text-[14px] font-medium leading-relaxed max-w-xs">
              استمر من حيث توقفت. مرضاك، مواعيدك، وتقاريرك في مكان واحد.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "+٥٠٠", label: "عيادة نشطة" },
              { value: "+٢٠٠ألف", label: "ملف مريض" },
              { value: "٩٩.٩٪", label: "وقت التشغيل" },
              { value: "٢٤/٧", label: "دعم فني" },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0D1B2E] border border-blue-500/10 rounded-xl p-4">
                <div className="text-blue-400 text-[20px] font-black mb-0.5">{stat.value}</div>
                <div className="text-slate-600 text-[11.5px] font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="relative z-10">
      {/*     <div className="bg-[#0D1B2E] border border-blue-500/[0.12] rounded-2xl p-5">
            <p className="text-slate-500 text-[11.5px] font-bold mb-3 uppercase tracking-widest">
              آخر نشاط
            </p>
            <div className="space-y-2.5">
              {[
                { icon: "📅", text: "موعد جديد — أحمد سالم", time: "منذ ٥ دقائق" },
                { icon: "🦷", text: "تم تحديث ملف — نور خالد", time: "منذ ٢٠ دقيقة" },
                { icon: "💳", text: "دفعة مستلمة — ٣٥٠ جنيه", time: "منذ ساعة" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-[12px] shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-[12px] font-semibold truncate">{item.text}</p>
                  </div>
                  <span className="text-slate-700 text-[11px] font-medium shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — Login Form ══════════ */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 relative">
        {/* Top Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(rgba(37, 99, 235, 0.15) 0%, transparent 70%)" }}
        />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <span className="text-2xl font-black text-white tracking-tight">
              <span className="text-blue-500">Smile</span>Craft
            </span>
          </div>

          {/* ── Card ── */}
          <div className="auth-fade-up bg-[#0B1525] border border-white/[0.06] rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/40">
            {/* Header */}
            <div className="mb-7">
              <div
                className="auth-float w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5"
              >
                <User className="w-[22px] h-[22px] text-blue-500" strokeWidth={2} />
              </div>
              <h1 className="text-[22px] font-black text-white mb-1.5">تسجيل الدخول</h1>
              <p className="text-[13.5px] text-slate-500 font-medium">
                SmileCraft CMS - نظام إدارة عيادة الأسنان
              </p>
            </div>

            {/* Demo Badge */}
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-[12px] font-bold text-amber-400">
                <span>تجريبي:</span>
                admin@smilecraft.com / password123
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[12px] font-bold text-slate-400 mb-2 tracking-wide">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="example@email.com"
                      autoComplete="email"
                      disabled={isMutating}
                      dir="ltr"
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                        "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                        "placeholder:text-slate-700 pr-10",
                        errors.email
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                          : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/[0.08] hover:border-white/[0.12]",
                        isMutating && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </div>
                  {errors.email?.message && (
                    <p className="auth-err-in text-[11.5px] text-red-400 font-medium mt-1.5">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-[12px] font-bold text-slate-400 tracking-wide">
                      كلمة المرور
                    </label>
                    <a
                      href="#"
                      className="text-[11.5px] text-blue-400 font-bold hover:underline transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="أدخل كلمة المرور"
                      autoComplete="current-password"
                      disabled={isMutating}
                      dir="ltr"
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                        "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                        "placeholder:text-slate-700 pr-10 pl-12",
                        errors.password
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                          : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/[0.08] hover:border-white/[0.12]",
                        isMutating && "opacity-50 cursor-not-allowed"
                      )}
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password?.message && (
                    <p className="auth-err-in text-[11.5px] text-red-400 font-medium mt-1.5">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-700 bg-[#0D1B2E] text-blue-500 focus:ring-blue-500/30"
                    />
                    <span className="text-slate-500 text-[12px] font-medium">تذكرني</span>
                  </label>
                </div>

                {/* Form-level Error */}
                {serverError && (
                  <div className="auth-err-in p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-[12.5px] text-red-400 text-center font-medium">
                      {serverError}
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {successMsg && (
                  <div className="auth-err-in p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[12.5px] text-emerald-400 text-center font-medium flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {successMsg}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isMutating}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-bold text-[14.5px] mt-1",
                    "transition-all duration-200 flex items-center justify-center gap-2.5",
                    isMutating
                      ? "bg-blue-500/30 text-[#060D18]/40 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_8px_28px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_36px_rgba(37,99,235,0.4)] hover:-translate-y-0.5"
                  )}
                >
                  {isMutating ? (
                    <span className="flex items-center gap-2 text-blue-200">
                      <span className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
                       جاري تسجيل الدخول...
                    </span>
                  ) : (
                    <>
                      تسجيل الدخول
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
        {/*     <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-slate-700 text-[11.5px] font-semibold">أو</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>
 */}
            {/* Trust Badges */}
        {/*     <div className="flex items-center justify-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">🔒</span>
                <span className="text-[11.5px] text-slate-600 font-semibold">بيانات مشفرة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">✓</span>
                <span className="text-[11.5px] text-slate-600 font-semibold">آمن ١٠٠٪</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">⚡</span>
                <span className="text-[11.5px] text-slate-600 font-semibold">وصول فوري</span>
              </div>
            </div> */}
          </div>

          <div className="mt-6">
            <p className="text-center text-slate-600 text-[13px] font-medium">
              لا تمتلك حساب؟{" "}
              <Link
                href="/signup"
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                أنشئ حسابًا جديدًا
              </Link>
            </p>
          </div>

          {/* Support Link */}
          <p className="text-center text-slate-700 text-[12px] font-medium mt-5">
            تواجه مشكلة في الدخول؟{" "}
            <a
              href="mailto:support@smilecraft.com"
              className="text-blue-400/70 hover:text-blue-400 transition-colors font-bold"
            >
              تواصل مع الدعم
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
