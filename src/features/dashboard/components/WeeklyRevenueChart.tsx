"use client";

// =============================================================================
// Dashboard Widget — Weekly Revenue Chart (CSS-based Bar Chart)
// =============================================================================

import { TrendingUp, ArrowUpRight } from "lucide-react";

const DAYS_DATA = [
  { day: "السبت", revenue: 3200, color: "bg-blue-500" },
  { day: "الأحد", revenue: 4800, color: "bg-blue-500" },
  { day: "الاثنين", revenue: 2900, color: "bg-blue-500" },
  { day: "الثلاثاء", revenue: 5100, color: "bg-blue-500" },
  { day: "الأربعاء", revenue: 4250, color: "bg-blue-500" },
  { day: "الخميس", revenue: 3700, color: "bg-blue-500" },
  { day: "الجمعة", revenue: 1200, color: "bg-slate-600" },
];

const MAX_REVENUE = Math.max(...DAYS_DATA.map((d) => d.revenue));
const TOTAL_WEEKLY = DAYS_DATA.reduce((sum, d) => sum + d.revenue, 0);

export function WeeklyRevenueChart() {
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-10 -inset-inline-end-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            الدخل الأسبوعي
          </h3>
          <p className="text-xs text-slate-500 mt-1">آخر ٧ أيام</p>
        </div>
        <div className="text-end">
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {TOTAL_WEEKLY.toLocaleString("ar-EG")} ج.م
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <ArrowUpRight className="w-3 h-3" />
            +١٢٪ عن الأسبوع الماضي
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-3 h-40">
        {DAYS_DATA.map((day, i) => {
          const heightPercent = (day.revenue / MAX_REVENUE) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Revenue Label (on hover) */}
              <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {day.revenue.toLocaleString("ar-EG")}
              </span>
              {/* Bar */}
              <div className="w-full relative">
                <div
                  className={`w-full rounded-t-lg ${day.color} transition-all duration-500 group-hover:opacity-80`}
                  style={{
                    height: `${heightPercent * 1.2}px`,
                    minHeight: "8px",
                  }}
                />
              </div>
              {/* Day Label */}
              <span className="text-[10px] font-semibold text-slate-500">{day.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
