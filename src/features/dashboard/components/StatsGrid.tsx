import {
  CalendarCheck,
  UserPlus,
  Stethoscope,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAppointmentStatsAction } from "@/features/appointments/serverActions";

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  colorClass: string;
}

function StatCard({
  title,
  value,
  subtext,
  trend,
  trendValue,
  icon,
  colorClass,
}: StatCardProps) {
  return (
    <div className="glass-card relative overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-blue-500/5 group">
      {/* Decorative gradient blob */}
      <div
        className={`absolute -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all group-hover:scale-150 
            ltr:-right-6 
            rtl:-left-6 
            ${colorClass}`}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-opacity-10 dark:bg-opacity-20 ${colorClass.replace("bg-", "text-").replace("500", "600")} bg-current`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <span
            className={`flex items-center text-xs font-semibold ${
              trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-500"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="mr-1 h-3 w-3 rtl:ml-1 rtl:mr-0" />
            ) : trend === "down" ? (
              <TrendingDown className="mr-1 h-3 w-3 rtl:ml-1 rtl:mr-0" />
            ) : null}
            {trendValue}
          </span>
        )}
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {subtext}
        </span>
      </div>
    </div>
  );
}

export async function StatsGrid() {
  const t = await getTranslations("Dashboard");
  
  // Fetch real statistics for today's appointments
  const today = new Date();
  const appointmentStats = await getAppointmentStatsAction(today, today);

  const stats: StatCardProps[] = [
    {
      title: t("todayAppointments"),
      value: appointmentStats.todayTotal.toString(),
      subtext: t("vsYesterday"),
      trend: "up",
      trendValue: "+12%",
      icon: <CalendarCheck className="h-6 w-6" />,
      colorClass: "bg-blue-500",
    },
    {
      title: t("newPatients"),
      value: "8",
      subtext: t("thisWeek"),
      trend: "up",
      trendValue: "+3",
      icon: <UserPlus className="h-6 w-6" />,
      colorClass: "bg-emerald-500",
    },
    {
      title: t("pendingPlans"),
      value: "15",
      subtext: t("needFollowup"),
      trend: "down",
      trendValue: "-2",
      icon: <Stethoscope className="h-6 w-6" />,
      colorClass: "bg-amber-500",
    },
    {
      title: t("todayRevenue"),
      value: "4,250 ج.م",
      subtext: t("vsAverage"),
      trend: "up",
      trendValue: "+8%",
      icon: <Wallet className="h-6 w-6" />,
      colorClass: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  );
}
