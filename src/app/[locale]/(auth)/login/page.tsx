"use client";

// =============================================================================
// DENTAL CMS — Authentication: Login Page
// app/[locale]/auth/login/page.tsx
//
// React 19 useActionState for form state management
// =============================================================================

import React, { useActionState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { Mail, Lock, Stethoscope, Eye, EyeOff, ArrowRight, Dna } from "lucide-react";
import { loginAction, LoginState } from "./loginAction";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: LoginState = {
  success: false,
  errors: {},
};

// -----------------------------------------------------------------------------
// Login Page Component
// -----------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  // Redirect on successful login
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glass Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-blue-500/10 dark:shadow-none backdrop-blur-3xl bg-white/80 dark:bg-slate-900/60 border border-white/30 dark:border-slate-700/50">

          {/* Logo & Header */}
          <div className="text-center mb-8">
            {/* Medical Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 mb-4">
              <Dna className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              SmileCraft CMS - نظام إدارة عيادة الأسنان
            </p>
          </div>

          {/* Demo Credentials Badge */}
          <div className="mb-6 flex justify-center">
            <Badge variant="outline" className="text-sm bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
              <span className="ms-2">تجريبي:</span>
              admin@smilecraft.com / password123
            </Badge>
          </div>

          {/* Login Form */}
          <form ref={formRef} action={formAction} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@smilecraft.com"
                  defaultValue={state.data?.email}
                  icon={<Mail className="w-5 h-5" />}
                  className={cn(
                    "rounded-xl h-12 ps-12",
                    state.errors?.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "focus-visible:ring-blue-500"
                  )}
                  disabled={isPending}
                  dir="ltr"
                />
              </div>
              {state.errors?.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                كلمة المرور
              </label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                disabled={isPending}
                error={!!state.errors?.password}
              />
              {state.errors?.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600 dark:text-slate-400">تذكرني</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                نسيت كلمة المرور؟
              </a>
            </div>

            {/* Form Level Error */}
            {state.errors?.form && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {state.errors.form[0]}
                </p>
              </div>
            )}

            {/* Success Message */}
            {state.success && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center flex items-center justify-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {state.message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  تسجيل الدخول
                  <ArrowRight className="w-5 h-5 rotate-180 rtl:rotate-0" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">أو</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            ليس لديك حساب؟{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
              تواصل مع الإدارة
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500">
          © 2026 SmileCraft CMS - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Password Input Component with Toggle Visibility
// -----------------------------------------------------------------------------

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function PasswordInput({ error, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        icon={<Lock className="w-5 h-5" />}
        className={cn(
          "rounded-xl h-12 ps-12 pr-12",
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "focus-visible:ring-blue-500"
        )}
        dir="ltr"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
