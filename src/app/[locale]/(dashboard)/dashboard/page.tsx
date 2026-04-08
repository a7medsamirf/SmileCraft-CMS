import { StatsGrid } from "@/features/dashboard/components/StatsGrid";
import { WeeklyRevenueChart } from "@/features/dashboard/components/WeeklyRevenueChart";
import { ProceduresBreakdown } from "@/features/dashboard/components/ProceduresBreakdown";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { InventoryAlerts } from "@/features/dashboard/components/InventoryAlerts";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { BirthdayReminders } from "@/features/dashboard/components/BirthdayReminders";
import { LabTracker } from "@/features/dashboard/components/LabTracker";
import { OutstandingBalances } from "@/features/dashboard/components/OutstandingBalances";
import { DailyAgenda } from "@/features/appointments/components/DailyAgenda";
import { getTranslations } from "next-intl/server";
import { PageTransition } from "@/components/ui/PageTransition";
import { resolveUserFullName } from "@/lib/supabase-utils";

export const metadata = {
  title: "لوحة التحكم | SmileCraft CMS",
  description: "نظام إدارة عيادة الأسنان - لوحة التحكم الرئيسية",
};

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const userName = await resolveUserFullName();

  return (
    <PageTransition loadingText={t("greeting", { name: userName || "Doctor" })}>
      <div className="w-full mx-auto space-y-5">
        {/* ── Greeting Header ── */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("greeting", { name: userName || "Doctor" })}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("summary")}
          </p>
        </div>

        {/* ── 1. Stats Grid ── */}
        <StatsGrid />

        {/* ── 2. Quick Actions ── */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
          <QuickActions />
          </div>
          <div>
          <WeeklyRevenueChart />
          </div>
           <div className="lg:col-span-1 ">
                  <ProceduresBreakdown />
          </div>
        </div>
      

        {/* ── 3. Main Content: Agenda + Revenue Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <DailyAgenda />
          </div>
          <div>
             <RecentActivity />
          </div>
        </div>

        {/* ── 4. Secondary Row: Procedures + Recent Activity + Lab ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         <InventoryAlerts />
         <OutstandingBalances />
          <LabTracker />
        </div>

        {/* ── 5. Bottom Row: Inventory + Birthdays + Balances ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
         {/*  <BirthdayReminders /> */}
         
        </div>
      </div>
    </PageTransition>
  );
}
