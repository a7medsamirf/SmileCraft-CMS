import { StatsGrid } from "@/features/dashboard/components/StatsGrid";
import { DailyAgenda } from "@/features/appointments/components/DailyAgenda";
import { getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/ui/PageTransition";

export const metadata = {
  title: "لوحة التحكم | SmileCraft CMS",
  description: "نظام إدارة عيادة الأسنان - لوحة التحكم الرئيسية",
};

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <PageTransition loadingText={t("greeting")}>
      <div className="w-full mx-auto space-y-8">
        {/* Dashboard Greeting Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("greeting")}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("summary")}
          </p>
        </div>

        {/* 1. Stats Grid */}
        <StatsGrid />

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <DailyAgenda />
          </div>
          <div className="space-y-5">
            <div className="h-64 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 dark:border-slate-800 dark:bg-slate-900/30 p-6 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                <svg
                  className="h-6 w-6 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="font-medium text-slate-500 dark:text-slate-400">
                {t("widgetsPlaceholder")}
              </p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                {t("widgetsSummary")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
