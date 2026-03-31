"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MouthMap, ToothStatus, generateEmptyMouthMap } from "@/features/clinical";
import { ToothVisual } from "@/features/clinical/components/ToothVisual";
import { PlanBuilder } from "@/features/clinical/components/PlanBuilder";
import { PatientSearch } from "@/features/clinical/components/PatientSearch";
import { PatientMiniProfile } from "@/features/clinical/components/PatientMiniProfile";
import {
  saveMouthMap,
} from "@/features/clinical/services/clinicalService";
import { PATIENT_TEETH_MAP } from "@/features/clinical/mock/patientTeeth.mock";
import { useSessionProgress } from "@/features/clinical/hooks/useSessionProgress";
import { Patient } from "@/features/patients/types";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Save, Loader2, CheckCircle, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function ClinicalClient() {
  const t = useTranslations("Clinical");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [mouthMap, setMouthMap] = useState<MouthMap>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Session Progress Tracking hook
  const {
    optimisticPlan,
    completionHistory,
    updateItemStatus,
    odontogramOverrides,
    regeneratePlan,
  } = useSessionProgress(mouthMap);

  // Load patient teeth data when a patient is selected
  const handleSelectPatient = useCallback((patient: Patient) => {
    setIsLoading(true);
    setSelectedPatient(patient);
    setLastSaved(null);

    // Simulate loading delay for realistic UX
    setTimeout(() => {
      const teethData = PATIENT_TEETH_MAP[patient.id] ?? generateEmptyMouthMap();
      setMouthMap(teethData);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleDeselectPatient = useCallback(() => {
    setSelectedPatient(null);
    setMouthMap([]);
    setLastSaved(null);
  }, []);

  const handleStatusChange = (id: number, newStatus: ToothStatus) => {
    setMouthMap((prev) => {
      const updated = prev.map((tooth) =>
        tooth.id === id ? { ...tooth, status: newStatus } : tooth,
      );
      regeneratePlan(updated, t);
      return updated;
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-purple-600 dark:text-purple-500" />
            {t("title")}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        {selectedPatient && (
          <div className="flex items-center gap-3">
            {lastSaved && !isSaving && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                <CheckCircle className="h-3 w-3" />
                {t("lastSaved", {
                  time: lastSaved.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })}
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              variant="outline"
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin rtl:ml-2 ltr:mr-2" />
              ) : (
                <Save className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
              )}
              {isSaving ? t("saving") : t("savePlan")}
            </Button>
          </div>
        )}
      </div>

      {/* Patient Search Bar */}
      <PatientSearch
        onSelect={handleSelectPatient}
        selectedPatientId={selectedPatient?.id}
      />

      {/* Content: Empty State OR Patient + Odontogram */}
      <AnimatePresence mode="wait">
        {!selectedPatient ? (
          /* ── Empty State ── */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-950/30 mb-6"
            >
              <Search className="h-12 w-12 text-blue-400 dark:text-blue-500" />
            </motion.div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
              {t("welcomeDoctor")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {t("welcomeMessage")}
            </p>
          </motion.div>
        ) : (
          /* ── Patient Selected: Mini Profile + Odontogram ── */
          <motion.div
            key={`patient-${selectedPatient.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Mini Profile Card */}
            <PatientMiniProfile
              patient={selectedPatient}
              onDeselect={handleDeselectPatient}
            />

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ms-3 text-sm font-medium text-slate-500">
                  {t("loadingRecords")}
                </span>
              </div>
            ) : (
              /* Odontogram + Plan Builder Grid */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left: Odontogram */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="glass-card p-8 transition-all duration-300">
                    <div className="mb-8 text-center">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {t("odontogram")}
                      </h2>
                      <div className="flex justify-center gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-slate-100 border border-slate-300"></div>
                          {t("statusReady")}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          {t("statusCaries")}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          {t("statusFilling")}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
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
                            colorOverride={odontogramOverrides.get(tooth.id)}
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
                            colorOverride={odontogramOverrides.get(tooth.id)}
                          />
                        ))}
                      </div>
                      <div className="mt-2 text-center text-xs font-bold text-blue-500 uppercase tracking-widest">
                        {t("lowerArch")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Plan Builder */}
                <div className="lg:col-span-1">
                  <PlanBuilder
                    plan={optimisticPlan}
                    onStatusChange={updateItemStatus}
                    completionHistory={completionHistory}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
