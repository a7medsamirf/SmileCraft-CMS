"use client";

import React from "react";
import { DailyRevenue } from "@/features/dashboard/components/DailyRevenue";
import { WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";
import { PaymentMethod } from "@/features/finance";
import { PageTransition } from "@/components/ui/PageTransition";

export default function FinancePage() {
  const t = useTranslations("Finance");

  // Mock data for initial display
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
      invoiceId: "INV-201",
      amount: 2500,
      date: new Date().toISOString(),
      method: PaymentMethod.CASH,
    },
    {
      id: "4",
      invoiceId: "INV-202",
      amount: 120,
      date: new Date().toISOString(),
      method: PaymentMethod.WALLET,
    },
  ];

  return (
    <PageTransition loadingText={t("title")}>
      <div className="w-full">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <WalletCards className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
              {t("title")}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <DailyRevenue payments={mockPayments} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t("monthlyPerformance")}</h3>
                  <div className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 text-sm italic">
                      {t("revenueChart")}
                  </div>
              </div>
              <div className="glass-card p-6 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t("pendingInvoices")}</h3>
                  <div className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 text-sm italic">
                      {t("pendingInvoicesDesc")}
                  </div>
              </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
