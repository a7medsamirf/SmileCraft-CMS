"use client";

import React, { useActionState, useMemo } from "react";
import { MouthMap, ToothStatus } from "../types/odontogram";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Receipt, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface PlanItem {
  id: string;
  toothId: number;
  procedure: string;
  estimatedCost: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface PlanBuilderProps {
  mouthMap: MouthMap;
  onPlanUpdate?: (plan: PlanItem[]) => void;
}

interface InvoiceState {
  success: boolean | null;
  message: string;
  invoiceId?: string;
}

// Simulated server action (React 19)
async function submitInvoiceAction(prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
  const patientId = formData.get("patientId");
  const totalItems = formData.get("totalItems");
  
  // Fake Network latency
  await new Promise((res) => setTimeout(res, 800));

  if (!patientId || Number(totalItems) === 0) {
    return { success: false, message: "emptyPlanError" };
  }

  // Generate mock invoice ID
  const invoiceId = `INV-${Math.floor(Math.random() * 10000)}`;

  return { success: true, message: "invoiceSuccess", invoiceId };
}

export function PlanBuilder({ mouthMap }: PlanBuilderProps) {
  const t = useTranslations("Clinical");
  // Use React 19's useActionState for form handling
  const [state, formAction, isPending] = useActionState(submitInvoiceAction, { success: null, message: "" });

  // Generate treatment plan implicitly from the visual mouth map
  const generatedPlan: PlanItem[] = useMemo(() => {
    return mouthMap
      .filter(
        (tooth) =>
          tooth.status !== ToothStatus.HEALTHY &&
          tooth.status !== ToothStatus.MISSING,
      )
      .map((tooth) => {
        let procedure = "";
        let cost = 0;
        switch (tooth.status) {
          case ToothStatus.CARIOUS:
            procedure = t("procedureCleaning");
            cost = 400;
            break;
          case ToothStatus.FILLING:
            procedure = t("procedureReview");
            cost = 150;
            break;
          case ToothStatus.ROOT_CANAL:
            procedure = t("procedureRootCanal");
            cost = 1200;
            break;
          case ToothStatus.CROWN:
            procedure = t("procedureCrown");
            cost = 2500;
            break;
        }
        return {
          id: `plan-${tooth.id}-${tooth.status}`,
          toothId: tooth.id,
          procedure: procedure,
          estimatedCost: cost,
          status: "PENDING",
        };
      });
  }, [mouthMap, t]);

  const totalCost = generatedPlan.reduce((sum, item) => sum + item.estimatedCost, 0);

  return (
    <div className="glass-card p-6 transition-all duration-300">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("proposedPlan")}</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {t("total")}: {totalCost} {t("currency")}
        </Badge>
      </div>

      <div className="space-y-3">
        {generatedPlan.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            {t("noAffectedTeeth")}
          </div>
        ) : (
          generatedPlan.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                  {item.toothId}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-1">{item.procedure}</h4>
                  <span className="text-xs font-semibold text-slate-500">{t("estimatedCost")}: {item.estimatedCost} {t("currency")}</span>
                </div>
              </div>
              <Badge variant="warning" className="text-[10px] px-2">{t("pending")}</Badge>
            </div>
          ))
        )}
      </div>

      <hr className="my-6 border-slate-100 dark:border-slate-800" />

      {/* React 19 action form */}
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="patientId" value="demo-patient-123" />
        <input type="hidden" name="totalItems" value={generatedPlan.length} />

        {state.message && (
          <div className={`flex items-center gap-2 rounded-xl p-3 text-sm font-semibold ${
            state.success ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50" 
            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
          }`}>
            {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {state.success ? t(state.message, { invoiceId: state.invoiceId ?? "" }) : t(state.message)}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isPending || generatedPlan.length === 0}
          className="w-full text-base font-bold shadow-blue-500/20 shadow-lg py-6 rounded-2xl"
        >
          {isPending ? t("converting") : (
            <>
              <Receipt className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
              {t("convertToInvoice")}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
