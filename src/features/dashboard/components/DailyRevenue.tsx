"use client";

import React from "react";
import { Payment, PaymentMethod, formatCurrency } from "@/features/finance";
import { Printer, TrendingUp, CreditCard, Banknote, SmartphoneNfc } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations, useLocale } from "next-intl";

interface DailyRevenueProps {
  payments: Payment[];
}

export function DailyRevenue({ payments }: DailyRevenueProps) {
  const t = useTranslations("Finance");
  const locale = useLocale();
  // Define "Today" boundaries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Filter only Today's payments
  const todaysPayments = payments.filter((p) => {
    const pDate = new Date(p.date);
    return pDate >= todayStart && pDate <= todayEnd;
  });

  // Calculate Aggregates
  const stats = {
    total: 0,
    cash: 0,
    card: 0,
    wallet: 0,
  };

  todaysPayments.forEach((p) => {
    stats.total += p.amount;
    if (p.method === PaymentMethod.CASH) stats.cash += p.amount;
    if (p.method === PaymentMethod.CARD) stats.card += p.amount;
    if (p.method === PaymentMethod.WALLET) stats.wallet += p.amount;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="glass-card relative overflow-hidden p-6 print:hidden block transition-all duration-300">
        {/* Background glow for premium feel */}
        <div className="absolute -inset-inline-end-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/20" />

        <div className="relative flex items-center justify-between mb-8 text-slate-800 dark:text-slate-100">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {t("dailyRevenue")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {t("revenueSummary")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700">
            <Printer className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0 text-slate-500" />
            {t("printReport")}
          </Button>
        </div>

        <div className="relative mb-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-8 border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-500 mb-2">{t("totalCollected")}</p>
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats.total)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 transition hover:border-blue-200 dark:hover:border-blue-900 overflow-hidden">
             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 shadow-sm">
               <Banknote className="h-6 w-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-500">{t("cash")}</p>
               <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(stats.cash)}</p>
             </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 transition hover:border-blue-200 dark:hover:border-blue-900 overflow-hidden">
             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shadow-sm">
               <CreditCard className="h-6 w-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-500">{t("card")}</p>
               <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(stats.card)}</p>
             </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 transition hover:border-blue-200 dark:hover:border-blue-900 overflow-hidden">
             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 shadow-sm">
               <SmartphoneNfc className="h-6 w-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-500">{t("wallet")}</p>
               <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(stats.wallet)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* =========================================
          PRINT ONLY VERSION (Hidden in normal UI)
          Activated via CSS `print:block`
          ========================================= */}
      <div className="hidden print:block font-sans text-black">
        <div className="border-b-2 border-black pb-4 mb-4 text-center">
          <h1 className="text-2xl font-bold">{t("printHeaderTitle")}</h1>
          <h2 className="text-lg">{t("printHeaderSubtitle")}</h2>
          <p className="text-sm mt-1">{t("printDate")} {new Date().toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}</p>
        </div>

        <table className="w-full text-left border-collapse border border-black text-sm rtl:text-right" dir="rtl">
          <thead>
            <tr>
              <th className="border border-black p-2 bg-gray-100">{t("paymentMethod")}</th>
              <th className="border border-black p-2 bg-gray-100">{t("totalCollected")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">{t("cash")}</td>
              <td className="border border-black p-2 font-bold">{formatCurrency(stats.cash)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">{t("card")}</td>
              <td className="border border-black p-2 font-bold">{formatCurrency(stats.card)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2">{t("wallet")}</td>
              <td className="border border-black p-2 font-bold">{formatCurrency(stats.wallet)}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-black p-2 font-bold text-lg">{t("total")}</td>
              <td className="border border-black p-2 font-bold text-lg">{formatCurrency(stats.total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-10 flex justify-between text-sm">
          <div className="text-center w-40 border-t border-dashed border-black pt-2">
            {t("doctorSignature")}
          </div>
          <div className="text-center w-40 border-t border-dashed border-black pt-2">
            {t("cashierSignature")}
          </div>
        </div>
      </div>
    </>
  );
}
