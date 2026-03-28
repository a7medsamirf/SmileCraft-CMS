import React from "react";
import { DailyRevenue } from "@/features/dashboard/components/DailyRevenue";
import { Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FinanceDashboard } from "@/features/finance/components/FinanceDashboard";
import { PaymentMethod } from "@/features/finance/types";
import { PageTransition } from "@/components/ui/PageTransition";

export const metadata = {
  title: "الحسابات | SmileCraft CMS",
};

export default async function BillingPage() {
  const t = await getTranslations("Finance");

  // Mock data for the daily revenue component
  const mockPayments = [
    {
      id: "1",
      invoiceId: "INV-101",
      amount: 1500,
      date: new Date().toISOString(),
      method: PaymentMethod.CASH,
    },
    {
      id: "2",
      invoiceId: "INV-102",
      amount: 400,
      date: new Date().toISOString(),
      method: PaymentMethod.CARD,
    },
    {
      id: "3",
      invoiceId: "INV-103",
      amount: 250,
      date: new Date().toISOString(),
      method: PaymentMethod.WALLET,
    },
  ];

  return (
    <PageTransition loadingText={t("title")}>
      <div className="w-full space-y-5 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10">
                <Wallet className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
              </div>
              {t("title")}
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              {t("revenueSummary")}
            </p>
          </div>
        </div>

        {/* Premium Analytics Dashboard */}
        <section className="animate-in slide-in-from-bottom-4 duration-1000">
          <FinanceDashboard />
        </section>

        <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
          {/* Daily Cashflow View */}
          <div className="">
            <DailyRevenue payments={mockPayments} />
          </div>
          
          {/* Detailed Invoices History Placeholder */}
          <div className="glass-card  p-12 flex flex-col items-center justify-center text-center">
             <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                <Wallet className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t("invoiceHistory")}</h3>
             <p className="mt-3 text-slate-500 max-w-md">{t("invoiceHistorySummary")}</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
