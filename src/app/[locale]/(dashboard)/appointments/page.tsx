"use client";

// =============================================================================
// Appointments Page — with Booking Form
// =============================================================================

import React, { useState } from "react";
import { DailyAgenda } from "@/features/appointments/components/DailyAgenda";
import { BookingForm } from "@/features/appointments/components/BookingForm";
import { CalendarCheck, Plus } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";

export default function AppointmentsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <PageTransition>
      <div className="w-full" dir="rtl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                <CalendarCheck className="h-6 w-6 text-white" />
              </div>
              إدارة المواعيد
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              قائمة المواعيد اليومية، متابعة الحجوزات، وإدارة وقت العيادة.
            </p>
          </div>

          {/* Book Appointment Button */}
          <button
            onClick={() => setIsBookingOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            حجز موعد جديد
          </button>
        </div>

        <div className="space-y-5">
          <DailyAgenda />

          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              قريباً: عرض أسبوعي وشهري للمواعيد وفلترة متقدمة حسب الطبيب.
            </p>
          </div>
        </div>

        {/* Booking Modal */}
        <BookingForm isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      </div>
    </PageTransition>
  );
}
