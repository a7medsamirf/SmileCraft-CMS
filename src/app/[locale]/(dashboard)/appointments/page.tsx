import React from "react";
import { DailyAgenda } from "@/features/appointments/components/DailyAgenda";
import { CalendarCheck } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";

export const metadata = {
  title: "المواعيد | SmileCraft CMS",
};

export default function AppointmentsPage() {
  return (
    <PageTransition>
      <div className="w-full" dir="rtl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                <CalendarCheck className="h-6 w-6 text-white" />
              </div>
              إدارة المواعيد (Appointments)
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              قائمة المواعيد اليومية، متابعة الحجوزات، وإدارة وقت العيادة.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <DailyAgenda />

          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              قريباً: عرض أسبوعي وشهري للمواعيد وفلترة متقدمة حسب الطبيب.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
