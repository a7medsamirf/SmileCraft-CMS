"use client";

import React, { useState, useCallback } from "react";
import {
  MouthMap,
  ToothStatus,
  generateEmptyMouthMap,
} from "@/features/clinical";
import type { Tooth } from "@/features/clinical/types/odontogram";
import { ToothVisual } from "@/features/clinical/components/ToothVisual";
import { ToothCasePanel } from "@/features/clinical/components/ToothCasePanel";
import { PlanBuilder } from "@/features/clinical/components/PlanBuilder";
import { PatientSearch } from "@/features/clinical/components/PatientSearch";
import { PatientMiniProfile } from "@/features/clinical/components/PatientMiniProfile";
import { saveMouthMap } from "@/features/clinical/services/clinicalService";
import { PATIENT_TEETH_MAP } from "@/features/clinical/mock/patientTeeth.mock";
import { useSessionProgress } from "@/features/clinical/hooks/useSessionProgress";
import type { ClinicalCase } from "@/features/clinical/types/clinicalCase";
import { Patient } from "@/features/patients/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Save,
  Loader2,
  CheckCircle,
  Search,
  CalendarCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import {
  getPatientClinicalDataAction,
  saveMouthMapAction,
  getPatientClinicalCaseSummaryAction,
} from "@/features/clinical/serverActions";
import {
  getPatientAppointmentsWithTeethAction,
  type AppointmentTooth,
} from "@/features/appointments/serverActions";

export function ClinicalClient() {
  const t = useTranslations("Clinical");

  // ── Inline mapping: procedureKey → ToothStatus ────────────────────────────
  // Defined here (not imported from appointments/constants) to avoid circular
  // module references (appointments/constants already imports clinical/types).
  const PROCEDURE_KEY_TO_STATUS: Record<string, ToothStatus> = {
    procedureCleaning: ToothStatus.CARIOUS,
    procedureReview: ToothStatus.FILLING,
    procedureRootCanal: ToothStatus.ROOT_CANAL,
    procedureCrown: ToothStatus.CROWN,
    procedureExtraction: ToothStatus.MISSING,
    procedureWisdomExtraction: ToothStatus.MISSING,
  };

  // ── Core state ─────────────────────────────────────────────────────────────
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [mouthMap, setMouthMap] = useState<MouthMap>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ── Clinical case state ────────────────────────────────────────────────────
  const [selectedTooth, setSelectedTooth] = useState<Tooth | null>(null);
  const [teethWithCases, setTeethWithCases] = useState<Set<number>>(new Set());

  // ── Appointment overlay state ──────────────────────────────────────────────
  const [appointmentTeeth, setAppointmentTeeth] = useState<AppointmentTooth[]>(
    [],
  );

  // Session Progress Tracking hook
  const {
    optimisticPlan,
    completionHistory,
    updateItemStatus,
    odontogramOverrides,
    regeneratePlan,
  } = useSessionProgress(mouthMap);

  // ── Patient selection ──────────────────────────────────────────────────────
  const handleSelectPatient = useCallback(async (patient: Patient) => {
    setIsLoading(true);
    setSelectedPatient(patient);
    setLastSaved(null);
    setSelectedTooth(null);
    setTeethWithCases(new Set());
    setAppointmentTeeth([]);

    try {
      // 1. Load clinical mouthMap from Supabase (or fall back to mock/empty)
      const clinicalData = await getPatientClinicalDataAction(patient.id);
      let map: MouthMap =
        clinicalData?.mouthMap ??
        PATIENT_TEETH_MAP[patient.id] ??
        generateEmptyMouthMap();

      // 2. Load appointments that have a tooth number
      const aptTeeth = await getPatientAppointmentsWithTeethAction(patient.id);
      setAppointmentTeeth(aptTeeth);

      // 3. Overlay appointment data onto HEALTHY teeth only.
      //    Clinical examination data (already in the DB mouthMap) takes priority.
      if (aptTeeth.length > 0) {
        map = map.map((tooth) => {
          if (tooth.status !== ToothStatus.HEALTHY) return tooth; // keep clinical data
          const apt = aptTeeth.find((a) => a.toothNumber === tooth.id);
          if (!apt) return tooth;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedStatus = (PROCEDURE_KEY_TO_STATUS as any)[
            apt.procedureKey
          ] as ToothStatus | undefined;
          if (!mappedStatus) return tooth;
          return {
            ...tooth,
            status: mappedStatus,
            notes: `موعد: ${apt.procedure} — ${apt.date}${tooth.notes ? " | " + tooth.notes : ""}`,
          };
        });
      }

      setMouthMap(map);
    } catch {
      setMouthMap(PATIENT_TEETH_MAP[patient.id] ?? generateEmptyMouthMap());
      setAppointmentTeeth([]);
    } finally {
      setIsLoading(false);
    }

    // Load case badge indicators (non-blocking)
    getPatientClinicalCaseSummaryAction(patient.id)
      .then((nums) => setTeethWithCases(new Set(nums)))
      .catch(() => {
        /* cosmetic, ignore */
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeselectPatient = useCallback(() => {
    setSelectedPatient(null);
    setMouthMap([]);
    setLastSaved(null);
    setSelectedTooth(null);
    setTeethWithCases(new Set());
    setAppointmentTeeth([]);
  }, []);

  // ── Odontogram interactions ────────────────────────────────────────────────
  const handleStatusChange = (id: number, newStatus: ToothStatus) => {
    setMouthMap((prev) => {
      const updated = prev.map((tooth) =>
        tooth.id === id ? { ...tooth, status: newStatus } : tooth,
      );
      regeneratePlan(updated, t);
      return updated;
    });
  };

  // ── Case panel handlers ────────────────────────────────────────────────────
  const handleCaseOpen = useCallback((tooth: Tooth) => {
    setSelectedTooth(tooth);
  }, []);

  const handleCaseSaved = useCallback((saved: ClinicalCase) => {
    // Add/keep the tooth number in the badge set so its dot persists
    setTeethWithCases((prev) => new Set([...prev, saved.toothNumber]));
  }, []);

  // ── Persist mouthMap ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      await saveMouthMapAction(selectedPatient.id, mouthMap);
      await saveMouthMap(mouthMap);
      setLastSaved(new Date());
    } catch (err) {
      console.error("[ClinicalClient] Save failed:", err);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived tooth groups ───────────────────────────────────────────────────
  const safeMap = Array.isArray(mouthMap) ? mouthMap : [];
  const upperTeeth = safeMap.filter((t) => t.id <= 16);
  const lowerTeeth = safeMap.filter((t) => t.id > 16);

  // ── Derived: count of appointment teeth that map to a known status ─────────
  const mappedAptCount = appointmentTeeth.filter(
    (a) => PROCEDURE_KEY_TO_STATUS[a.procedureKey],
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
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

      {/* ── Patient Search ───────────────────────────────────────────────────── */}
      <PatientSearch
        onSelect={handleSelectPatient}
        selectedPatientId={selectedPatient?.id}
      />

      {/* ── Main Content: Empty State OR Patient View ────────────────────────── */}
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
          /* ── Patient Selected: Profile + Odontogram + Case Panel ── */
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
              <>
                {/* ── Odontogram + Plan Builder Grid ─────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Left: Odontogram */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="glass-card p-8 transition-all duration-300">
                      {/* ── Legend header ──────────────────────────────── */}
                      <div className="mb-8 text-center">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                          {t("odontogram")}
                        </h2>
                        <div className="flex justify-center gap-4 text-xs font-semibold text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-slate-100 border border-slate-300" />
                            {t("statusReady")}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            {t("statusCaries")}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            {t("statusFilling")}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                            {t("statusEndo")}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            {t("casePanel")}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                            {t("fromAppointment")}
                          </span>
                        </div>
                      </div>

                      {/* ── Appointment pre-population banner ──────────── */}
                      {mappedAptCount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 px-4 py-3"
                        >
                          <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                              {t("appointmentMapUpdated")}
                            </p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 opacity-80">
                              {t("appointmentMapUpdatedDetail", {
                                count: mappedAptCount,
                              })}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Upper Arch */}
                      <div className="mb-12">
                        <div className="flex flex-wrap justify-center gap-2 md:gap-4 overflow-x-auto pb-4">
                          {upperTeeth.map((tooth) => (
                            <ToothVisual
                              key={tooth.id}
                              tooth={tooth}
                              onStatusChange={handleStatusChange}
                              onCaseOpen={handleCaseOpen}
                              colorOverride={odontogramOverrides.get(tooth.id)}
                              hasClinicalCase={teethWithCases.has(tooth.id)}
                              fromAppointment={
                                !teethWithCases.has(tooth.id) &&
                                appointmentTeeth.some(
                                  (a) =>
                                    a.toothNumber === tooth.id &&
                                    !!PROCEDURE_KEY_TO_STATUS[a.procedureKey],
                                )
                              }
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
                              onCaseOpen={handleCaseOpen}
                              colorOverride={odontogramOverrides.get(tooth.id)}
                              hasClinicalCase={teethWithCases.has(tooth.id)}
                              fromAppointment={
                                !teethWithCases.has(tooth.id) &&
                                appointmentTeeth.some(
                                  (a) =>
                                    a.toothNumber === tooth.id &&
                                    !!PROCEDURE_KEY_TO_STATUS[a.procedureKey],
                                )
                              }
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

                {/* ── Tooth Clinical Case Panel ────────────────────────────── */}
                <AnimatePresence>
                  {selectedTooth && (
                    <ToothCasePanel
                      key={selectedTooth.id}
                      tooth={selectedTooth}
                      patientId={selectedPatient.id}
                      onClose={() => setSelectedTooth(null)}
                      onCaseSaved={handleCaseSaved}
                      appointmentContext={appointmentTeeth.find(
                        (a) => a.toothNumber === selectedTooth.id,
                      )}
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
