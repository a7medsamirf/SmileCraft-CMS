"use client";

// =============================================================================
// Appointments — Booking Form Modal
// =============================================================================

import React, { useActionState, useEffect, useRef, useState } from "react";
import {
  CalendarPlus,
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Stethoscope,
  Timer,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { bookAppointmentAction, BookingState } from "../actions/bookAppointmentAction";
import { cn } from "@/lib/utils";

// ── Procedures List ─────────────────────────────────────────────────────────
const PROCEDURES = [
  "حشو عصب",
  "حشو تجميلي",
  "خلع ضرس",
  "خلع ضرس عقل",
  "تنظيف وتلميع",
  "تركيب تقويم",
  "تبييض أسنان",
  "تركيب تاج",
  "زراعة أسنان",
  "فحص دوري",
  "علاج لثة",
  "أشعة بانوراما",
];

// ── Time Slots ──────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "09:00 ص", "09:30 ص", "10:00 ص", "10:30 ص", "11:00 ص", "11:30 ص",
  "12:00 م", "12:30 م", "01:00 م", "01:30 م", "02:00 م", "02:30 م",
  "03:00 م", "03:30 م", "04:00 م", "04:30 م", "05:00 م",
];

// ── Durations ───────────────────────────────────────────────────────────────
const DURATIONS = [
  { value: "15", label: "١٥ دقيقة" },
  { value: "30", label: "٣٠ دقيقة" },
  { value: "45", label: "٤٥ دقيقة" },
  { value: "60", label: "ساعة" },
  { value: "90", label: "ساعة ونصف" },
  { value: "120", label: "ساعتين" },
];

// ── Initial State ───────────────────────────────────────────────────────────
const initialState: BookingState = {
  success: false,
  errors: {},
};

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(bookAppointmentAction, initialState);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Auto-close on success
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, onClose]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setSelectedTime("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        style={{ animation: "fadeIn 0.2s ease" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50"
          style={{ animation: "slideUp 0.3s ease" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  حجز موعد جديد
                </h2>
                <p className="text-[12px] text-slate-500">أدخل بيانات المريض والموعد</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Form ── */}
          <form ref={formRef} action={formAction} className="p-6 space-y-5">

            {/* Row 1: Patient Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="اسم المريض"
                name="patientName"
                icon={<User className="w-4 h-4" />}
                placeholder="أدخل اسم المريض"
                error={state.errors?.patientName?.[0]}
                disabled={isPending}
              />
              <FormField
                label="رقم الهاتف"
                name="phone"
                icon={<Phone className="w-4 h-4" />}
                placeholder="01XXXXXXXXX"
                dir="ltr"
                error={state.errors?.phone?.[0]}
                disabled={isPending}
              />
            </div>

            {/* Row 2: Date + Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="التاريخ"
                name="date"
                icon={<Calendar className="w-4 h-4" />}
                type="date"
                error={state.errors?.date?.[0]}
                disabled={isPending}
              />
              <div>
                <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  المدة
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Timer className="w-4 h-4" />
                  </div>
                  <select
                    name="duration"
                    disabled={isPending}
                    className={cn(
                      "w-full rounded-xl px-4 py-3 text-[13px] font-medium appearance-none",
                      "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
                      "text-slate-700 dark:text-slate-300 outline-none pr-10",
                      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all",
                      state.errors?.duration && "border-red-500",
                    )}
                  >
                    <option value="">اختر المدة</option>
                    {DURATIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                {state.errors?.duration && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">{state.errors.duration[0]}</p>
                )}
              </div>
            </div>

            {/* Row 3: Procedure */}
            <div>
              <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                نوع الإجراء
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <select
                  name="procedure"
                  disabled={isPending}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-[13px] font-medium appearance-none",
                    "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
                    "text-slate-700 dark:text-slate-300 outline-none pr-10",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all",
                    state.errors?.procedure && "border-red-500",
                  )}
                >
                  <option value="">اختر الإجراء</option>
                  {PROCEDURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {state.errors?.procedure && (
                <p className="text-[11px] text-red-400 font-medium mt-1">{state.errors.procedure[0]}</p>
              )}
            </div>

            {/* Row 4: Time Slots Grid */}
            <div>
              <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                <Clock className="w-3.5 h-3.5 inline-block me-1" />
                اختر الوقت
              </label>
              <input type="hidden" name="time" value={selectedTime} />
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  // Mock: mark some slots as booked
                  const isBooked = ["10:00 ص", "11:00 ص", "02:00 م"].includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked || isPending}
                      onClick={() => setSelectedTime(slot)}
                      className={cn(
                        "py-2 px-1 rounded-lg text-[12px] font-bold transition-all border",
                        isBooked
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed line-through"
                          : isSelected
                            ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25"
                            : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-500 cursor-pointer",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              {state.errors?.time && (
                <p className="text-[11px] text-red-400 font-medium mt-1.5">{state.errors.time[0]}</p>
              )}
              {/* Legend */}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> المختار
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /> متاح
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700 line-through" /> محجوز
                </span>
              </div>
            </div>

            {/* Row 5: Notes */}
            <div>
              <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                <FileText className="w-3.5 h-3.5 inline-block me-1" />
                ملاحظات (اختياري)
              </label>
              <textarea
                name="notes"
                rows={3}
                disabled={isPending}
                placeholder="ملاحظات إضافية..."
                className="w-full rounded-xl px-4 py-3 text-[13px] font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Form-Level Error */}
            {state.errors?.form && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-[12.5px] text-red-400 text-center font-medium">
                  {state.errors.form[0]}
                </p>
              </div>
            )}

            {/* Success */}
            {state.success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-[13px] text-emerald-400 font-bold">{state.message}</p>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold text-[14px] transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  isPending
                    ? "bg-blue-500/30 text-blue-200 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
                )}
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الحجز...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    تأكيد الحجز
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-6 py-3 rounded-xl font-bold text-[14px] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FormField — Reusable Input Component
// ═════════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  label: string;
  name: string;
  icon: React.ReactNode;
  placeholder?: string;
  type?: string;
  dir?: string;
  error?: string;
  disabled?: boolean;
}

function FormField({ label, name, icon, placeholder, type = "text", dir, error, disabled }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          dir={dir}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl px-4 py-3 text-[13px] font-medium",
            "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
            "text-slate-700 dark:text-slate-300 outline-none pr-10",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all",
            "placeholder:text-slate-400",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-400 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
