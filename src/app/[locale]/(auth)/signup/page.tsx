"use client";

// =============================================================================
// DENTAL CMS — Authentication: Signup Page
// Redesigned to match signup.html — split-screen dark theme
// =============================================================================

import React, { useTransition, useState } from "react";
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Stethoscope,
  CalendarPlus,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { signupAction } from "./signupAction";
import { signupSchema, type SignupFormData } from "./schema";
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
export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      clinicName: "",
      doctorName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isMutating = isPending || isSubmitting || !!successMsg;

  const onSubmit = (data: SignupFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const result = await signupAction(data);
      if (result.success) {
        setSuccessMsg(result.message || "تم إنشاء حسابك بنجاح");
        
        // If there's a redirect provided (e.g. autoconfirmed login), go there
        if (result.redirectTo) {
          setTimeout(() => {
            // Use window.location.href or router.push (here we use window for a fresh state)
            window.location.href = result.redirectTo!;
          }, 1500);
        }
        // Otherwise, stay on page to show the "Check your email" message
      } else if (result.errors?.form) {
        setServerError(result.errors.form[0]);
      } else {
        // Handle other field errors if any
        const firstError = Object.values(result.errors || {})[0]?.[0];
        if (firstError) setServerError(firstError);
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

        {/* Hero Text + Features */}
        <div className="relative z-10 space-y-8">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400 text-[12px] font-bold">١٤ يوم تجربة مجانية</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
              أدِر عيادتك
              <br />
              <span className="text-blue-400">بكل احترافية</span>
            </h2>
            <p className="text-slate-500 text-[14px] font-medium leading-relaxed max-w-xs">
              انضم لأكثر من ٥٠٠ عيادة اسنان تثق بـ SmileCraft لإدارة مرضاها ومواعيدها وتقاريرها.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-4">
            {[
              { icon: <Stethoscope className="w-4 h-4 text-blue-400" />, text: "ملفات طبية شاملة لكل مريض" },
              { icon: <CalendarPlus className="w-4 h-4 text-blue-400" />, text: "جدولة مواعيد وتذكيرات تلقائية" },
              { icon: <BarChart3 className="w-4 h-4 text-blue-400" />, text: "تقارير وتحليلات الإيرادات" },
              { icon: <ShieldCheck className="w-4 h-4 text-blue-400" />, text: "بياناتك محمية بتشفير كامل" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <span className="text-slate-400 text-[13.5px] font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10">
     {/*      <div className="bg-[#0D1B2E] border border-blue-500/10 rounded-2xl p-5 shadow-xl">
             <div className="flex gap-1 mb-3 text-amber-400">
               {[...Array(5)].map((_, i) => <span key={i} className="text-xs">★</span>)}
             </div>
             <p className="text-slate-300 text-[13px] font-medium leading-relaxed mb-4 italic">
               &quot;SmileCraft غيّر طريقة عمل عيادتي تماماً. بدلاً من الورق التقليدي، أصبح كل شيء رقمياً ومنظماً في مكان واحد.&quot;
             </p>
             <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 font-extrabold text-[12px]">
                 دم
               </div>
               <div>
                 <div className="text-white text-[13px] font-bold">د. محمد رمزي</div>
                 <div className="text-slate-600 text-[11.5px]">طبيب أسنان — القاهرة</div>
               </div>
             </div>
          </div> */}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — Signup Form ══════════ */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 relative overflow-y-auto">
        {/* Top Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(rgba(37, 99, 235, 0.15) 0%, transparent 70%)" }}
        />

        <div className="w-full max-w-[460px] relative z-10 py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <span className="text-2xl font-black text-white tracking-tight">
              <span className="text-blue-500">Smile</span>Craft
            </span>
          </div>

          {/* ── Card ── */}
          <div className="auth-fade-up bg-[#0B1525] border border-white/6 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/40">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-[22px] font-black text-white mb-1.5">إنشاء حساب جديد</h1>
              <p className="text-[13.5px] text-slate-500 font-medium">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-blue-400 font-bold hover:underline transition-colors">
                   تسجيل الدخول
                </Link>
              </p>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Clinic Name */}
                <div>
                  <label htmlFor="clinicName" className="block text-[12px] font-bold text-slate-400 mb-2 tracking-wide">
                    اسم العيادة
                  </label>
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      id="clinicName"
                      type="text"
                      {...register("clinicName")}
                      placeholder="مثال: عيادة النور للأسنان"
                      disabled={isMutating}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                        "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                        "placeholder:text-slate-700 pr-10",
                        errors.clinicName
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                          : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/8 hover:border-white/12",
                        isMutating && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </div>
                  {errors.clinicName?.message && (
                    <p className="auth-err-in text-[11.5px] text-red-400 font-medium mt-1.5">
                      {errors.clinicName.message}
                    </p>
                  )}
                </div>

                {/* Doctor Name */}
                <div>
                  <label htmlFor="doctorName" className="block text-[12px] font-bold text-slate-400 mb-2 tracking-wide">
                    اسم الطبيب
                  </label>
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="doctorName"
                      type="text"
                      {...register("doctorName")}
                      placeholder="مثال: د. محمد رمزي"
                      disabled={isMutating}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                        "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                        "placeholder:text-slate-700 pr-10",
                        errors.doctorName
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                          : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/8 hover:border-white/12",
                        isMutating && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </div>
                  {errors.doctorName?.message && (
                    <p className="auth-err-in text-[11.5px] text-red-400 font-medium mt-1.5">
                      {errors.doctorName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {/* Phone */}
                   <div>
                    <label htmlFor="phone" className="block text-[12px] font-bold text-slate-400 mb-2 tracking-wide">
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="phone"
                        type="text"
                        dir="ltr"
                        {...register("phone")}
                        placeholder="010-XXXX-XXXX"
                        disabled={isMutating}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                          "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                          "placeholder:text-slate-700 pr-10",
                          errors.phone
                            ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/8 hover:border-white/12",
                          isMutating && "opacity-50 cursor-not-allowed"
                        )}
                      />
                    </div>
                    {errors.phone?.message && (
                      <p className="auth-err-in text-[11.5px] text-red-400 font-medium mt-1.5">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

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
                        dir="ltr"
                        {...register("email")}
                        placeholder="example@email.com"
                        autoComplete="email"
                        disabled={isMutating}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                          "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                          "placeholder:text-slate-700 pr-10",
                          errors.email
                            ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/8 hover:border-white/12",
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
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-[12px] font-bold text-slate-400 mb-2 tracking-wide">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      {...register("password")}
                      placeholder="٨ أحرف على الأقل"
                      disabled={isMutating}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                        "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                        "placeholder:text-slate-700 pr-10 pl-12",
                        errors.password
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                          : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/8 hover:border-white/12",
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
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {errors.password?.message && (
                    <p className="auth-err-in text-[11.5px] text-red-400 font-medium mt-1.5">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-[12px] font-bold text-slate-400 mb-2 tracking-wide">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      dir="ltr"
                      {...register("confirmPassword")}
                      placeholder="أعد كتابة كلمة المرور"
                      disabled={isMutating}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-[13.5px] font-medium text-white",
                        "bg-[#0D1B2E] border-[1.5px] outline-none transition-all duration-200",
                        "placeholder:text-slate-700 pr-10 pl-12",
                        errors.confirmPassword
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                          : "border-white/[0.07] focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/8 hover:border-white/12",
                        isMutating && "opacity-50 cursor-not-allowed"
                      )}
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword?.message && (
                    <p className="auth-err-in text-[11.5px] text-red-400 font-medium mt-1.5">
                      {errors.confirmPassword.message}
                    </p>
                  )}
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
                       جاري إنشاء الحساب...
                    </span>
                  ) : (
                    <>
                      إنشاء حساب
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 flex-wrap mt-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">🔒</span>
                <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">بيانات مشفرة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">✓</span>
                <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">بدون بطاقة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">⚡</span>
                <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">30 يوم مجاناً</span>
              </div>
            </div>
          </div>
          
          <p className="text-center text-slate-700 text-[11.5px] font-medium mt-6">
            بالتسجيل، أنت توافق على{" "}
            <a href="#" className="text-blue-500/60 hover:text-blue-400 font-bold underline transition-colors">
              شروط الخدمة
            </a>{" "}
            و{" "}
            <a href="#" className="text-blue-500/60 hover:text-blue-400 font-bold underline transition-colors">
              سياسة الخصوصية
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
