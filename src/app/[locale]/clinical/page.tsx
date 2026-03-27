"use client";

import React, { useState, useEffect } from "react";
import { MouthMap, ToothStatus } from "@/features/clinical";
import { ToothVisual } from "@/features/clinical/components/ToothVisual";
import { PlanBuilder } from "@/features/clinical/components/PlanBuilder";
import {
  fetchMouthMap,
  saveMouthMap,
} from "@/features/clinical/services/clinicalService";
import { Stethoscope, Save, Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function ClinicalPage() {
  const t = useTranslations("Clinical");
  const [mouthMap, setMouthMap] = useState<MouthMap>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchMouthMap();
      setMouthMap(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleStatusChange = (id: number, newStatus: ToothStatus) => {
    setMouthMap((prev) =>
      prev.map((tooth) =>
        tooth.id === id ? { ...tooth, status: newStatus } : tooth,
      ),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveMouthMap(mouthMap);
    setLastSaved(new Date());
    setIsSaving(false);
  };

  // Group teeth for the visual layout
  const upperTeeth = mouthMap.filter((t) => t.id <= 16);
  const lowerTeeth = mouthMap.filter((t) => t.id > 16);

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-purple-600 dark:text-purple-500" />
            {t("title")}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && !isSaving && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
              <CheckCircle className="h-3 w-3" />
              {t("lastSaved", {
                time: lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }) || `Saved at ${lastSaved.toLocaleTimeString()}`}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            variant="outline"
            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
            ) : (
              <Save className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            )}
            {isSaving
              ? t("saving") || "Saving..."
              : t("savePlan") || "Save Plan"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="text-lg font-medium text-slate-500">
            {t("loadingRecords") || "Loading clinical records..."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Odontogram Visualizer */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card p-8 transition-all duration-300">
              <div className="mb-8 text-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {t("odontogram")}
                </h2>
                <div className="flex justify-center gap-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-slate-100 border border-slate-300"></div>{" "}
                    {t("statusReady")}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>{" "}
                    {t("statusCaries")}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>{" "}
                    {t("statusFilling")}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>{" "}
                    {t("statusEndo")}
                  </span>
                </div>
              </div>

              {/* Upper Arch */}
              <div className="mb-12">
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 overflow-x-auto pb-4">
                  {upperTeeth.map((tooth) => (
                    <ToothVisual
                      key={tooth.id}
                      tooth={tooth}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
                <div className="mt-2 text-center text-xs font-bold text-blue-500 uppercase tracking-widest">
                  {t("upperArch")}
                </div>
              </div>

              {/* Lower Arch */}
              <div>
                <div className="flex flex-wrap flex-row-reverse justify-center gap-2 md:gap-4 overflow-x-auto pb-4">
                  {lowerTeeth.map((tooth) => (
                    <ToothVisual
                      key={tooth.id}
                      tooth={tooth}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
                <div className="mt-2 text-center text-xs font-bold text-blue-500 uppercase tracking-widest">
                  {t("lowerArch")}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Treatment Plan Builder */}
          <div className="lg:col-span-1">
            <PlanBuilder mouthMap={mouthMap} />
          </div>
        </div>
      )}
    </div>
  );
}
