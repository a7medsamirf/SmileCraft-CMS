// =============================================================================
// DENTAL CMS — Clinical Module: useSessionProgress Hook
// features/clinical/hooks/useSessionProgress.ts
//
// Custom hook managing treatment plan state with React 19 useOptimistic.
// Provides instant visual feedback on the Odontogram when status changes.
//
// Persistence is fully DB-backed via serverActions.ts — zero localStorage.
// =============================================================================

"use client";

import {
  useOptimistic,
  useCallback,
  useState,
  useEffect,
  startTransition,
} from "react";
import { MouthMap, ToothStatus } from "../types/odontogram";
import {
  PlanItem,
  TreatmentStatus,
  CompletionRecord,
} from "../types/treatmentPlan";
import {
  replaceTreatmentPlanAction,
  saveTreatmentHistoryAction,
  getTreatmentHistoryAction,
  updateTreatmentStatusAction,
} from "../serverActions";
import { generateId } from "@/lib/utils/id";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OdontogramColorOverride {
  fill: string;
  stroke: string;
}

interface SessionProgressState {
  plan: PlanItem[];
  history: CompletionRecord[];
}

interface UseSessionProgressReturn {
  /** Optimistic plan items (immediately reflects user actions) */
  optimisticPlan: PlanItem[];
  /** Completion history records */
  completionHistory: CompletionRecord[];
  /** Update a plan item's status (triggers optimistic update + server action) */
  updateItemStatus: (itemId: string, newStatus: TreatmentStatus) => void;
  /** Map of toothId → color override for completed treatments */
  odontogramOverrides: Map<number, OdontogramColorOverride>;
  /** Whether the hook has loaded initial data */
  isLoaded: boolean;
  /** Generate a fresh plan from the current mouthMap and persist to DB */
  regeneratePlan: (
    mouthMap: MouthMap,
    t: ReturnType<typeof useTranslations>,
  ) => void;
}

// ---------------------------------------------------------------------------
// Procedure Key → Target Color mapping
// When a procedure is COMPLETED, the tooth should visually reflect
// the treatment that was applied (e.g., caries → filling = blue).
// ---------------------------------------------------------------------------

const COMPLETED_COLOR_MAP: Record<string, OdontogramColorOverride> = {
  procedureCleaning: { fill: "#3b82f6", stroke: "#1d4ed8" }, // Blue  → Filling done
  procedureReview: { fill: "#3b82f6", stroke: "#1d4ed8" }, // Blue  → Filling reviewed
  procedureRootCanal: { fill: "#a855f7", stroke: "#7e22ce" }, // Purple→ Root canal done
  procedureCrown: { fill: "#fbbf24", stroke: "#d97706" }, // Amber → Crown placed
};

// ---------------------------------------------------------------------------
// Procedure Key → Target ToothStatus mapping
// Used to calculate the final odontogram color when a procedure completes.
// ---------------------------------------------------------------------------

const PROCEDURE_TO_STATUS: Record<string, ToothStatus> = {
  procedureCleaning: ToothStatus.FILLING,
  procedureReview: ToothStatus.FILLING,
  procedureRootCanal: ToothStatus.ROOT_CANAL,
  procedureCrown: ToothStatus.CROWN,
};

// ---------------------------------------------------------------------------
// Helper: Generate plan from mouthMap
// ---------------------------------------------------------------------------

function generatePlanFromMouthMap(
  mouthMap: MouthMap,
  t: ReturnType<typeof useTranslations>,
): PlanItem[] {
  return mouthMap
    .filter(
      (tooth) =>
        tooth.status !== ToothStatus.HEALTHY &&
        tooth.status !== ToothStatus.MISSING,
    )
    .map((tooth) => {
      let procedure = "";
      let procedureKey = "";
      let cost = 0;

      switch (tooth.status) {
        case ToothStatus.CARIOUS:
          procedureKey = "procedureCleaning";
          procedure = t("procedureCleaning");
          cost = 400;
          break;
        case ToothStatus.FILLING:
          procedureKey = "procedureReview";
          procedure = t("procedureReview");
          cost = 150;
          break;
        case ToothStatus.ROOT_CANAL:
          procedureKey = "procedureRootCanal";
          procedure = t("procedureRootCanal");
          cost = 1200;
          break;
        case ToothStatus.CROWN:
          procedureKey = "procedureCrown";
          procedure = t("procedureCrown");
          cost = 2500;
          break;
      }

      return {
        id: `plan-${tooth.id}-${tooth.status}`,
        toothId: tooth.id,
        procedure,
        procedureKey,
        estimatedCost: cost,
        status: TreatmentStatus.PLANNED,
      };
    });
}

// ---------------------------------------------------------------------------
// Hook: useSessionProgress
// ---------------------------------------------------------------------------

export function useSessionProgress(
  mouthMap: MouthMap,
  patientId: string,
  initialPlan?: PlanItem[],
): UseSessionProgressReturn {
  const t = useTranslations("Clinical");
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, setState] = useState<SessionProgressState>({
    plan: [],
    history: [],
  });

  // React 19 useOptimistic for instant UI feedback
  const [optimisticState, addOptimisticUpdate] = useOptimistic(
    state,
    (currentState, update: { itemId: string; newStatus: TreatmentStatus }) => {
      const updatedPlan = currentState.plan.map((item) => {
        if (item.id === update.itemId) {
          return {
            ...item,
            status: update.newStatus,
            completedAt:
              update.newStatus === TreatmentStatus.COMPLETED
                ? new Date().toISOString()
                : undefined,
          };
        }
        return item;
      });

      const changedItem = currentState.plan.find((p) => p.id === update.itemId);
      const newRecord: CompletionRecord = {
        id: `opt-${Date.now()}`,
        planItemId: update.itemId,
        toothId: changedItem?.toothId ?? 0,
        procedure: changedItem?.procedure ?? "",
        previousStatus: changedItem?.status ?? TreatmentStatus.PLANNED,
        newStatus: update.newStatus,
        timestamp: new Date().toISOString(),
      };

      return {
        plan: updatedPlan,
        history: [newRecord, ...currentState.history],
      };
    },
  );

  // ---------------------------------------------------------------------------
  // Load initial data from DB
  // Priority: initialPlan prop (from getPatientClinicalDataAction) → generate
  //           from mouthMap if no plan exists for this patient.
  // History is always loaded from DB regardless of plan source.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Don't attempt to load if there is no patient selected yet
    if (!patientId) {
      setState({ plan: [], history: [] });
      setIsLoaded(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      // 1. Determine the starting plan
      let plan: PlanItem[];

      if (initialPlan && initialPlan.length > 0) {
        // DB-persisted plan was passed in from the parent component — use it
        plan = initialPlan;
      } else {
        // No persisted plan → generate a fresh one from the odontogram state
        const nonHealthyTeeth = mouthMap.filter(
          (tooth) =>
            tooth.status !== ToothStatus.HEALTHY &&
            tooth.status !== ToothStatus.MISSING,
        );

        if (nonHealthyTeeth.length > 0) {
          const freshPlan = generatePlanFromMouthMap(mouthMap, t);
          // Persist the generated plan so it gets real DB IDs
          plan = await replaceTreatmentPlanAction(patientId, freshPlan);
        } else {
          plan = [];
        }
      }

      // 2. Load audit history from DB
      const history = await getTreatmentHistoryAction(patientId);

      if (!cancelled) {
        setState({ plan, history });
        setIsLoaded(true);
      }
    };

    setIsLoaded(false);
    load().catch((err) => {
      console.warn("[useSessionProgress] load error:", err);
      if (!cancelled) setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
    // Re-run whenever the patient changes or the parent passes a new initialPlan.
    // JSON.stringify(mouthMap) guards against reference instability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, JSON.stringify(initialPlan)]);

  // ---------------------------------------------------------------------------
  // regeneratePlan
  // Called when the clinician manually edits the odontogram (handleStatusChange).
  // Discards the old PLANNED treatments and writes fresh ones to the DB.
  // ---------------------------------------------------------------------------
  const regeneratePlan = useCallback(
    async (
      newMouthMap: MouthMap,
      translator: ReturnType<typeof useTranslations>,
    ) => {
      if (!patientId) return;

      const freshPlan = generatePlanFromMouthMap(newMouthMap, translator);

      // Optimistically set the generated plan so the UI updates instantly
      setState((prev) => ({ ...prev, plan: freshPlan }));

      try {
        // Persist to DB — returns items with real UUIDs from the database
        const persistedPlan = await replaceTreatmentPlanAction(
          patientId,
          freshPlan,
        );
        setState((prev) => ({ ...prev, plan: persistedPlan }));
      } catch (err) {
        console.warn(
          "[useSessionProgress] regeneratePlan persist failed:",
          err,
        );
        // Keep the optimistic state so the UI stays functional
      }
    },
    [patientId],
  );

  // ---------------------------------------------------------------------------
  // updateItemStatus
  // Applies an optimistic update immediately, then persists the status change
  // to the DB and appends a CompletionRecord to the patient's history.
  // ---------------------------------------------------------------------------
  const updateItemStatus = useCallback(
    (itemId: string, newStatus: TreatmentStatus) => {
      startTransition(() => {
        // ── 1. Optimistic UI update ──────────────────────────────────────────
        addOptimisticUpdate({ itemId, newStatus });

        // ── 2. Persist to DB (fire-and-forget inside the transition) ─────────
        const persist = async () => {
          // Write the status change to the treatments table
          await updateTreatmentStatusAction(itemId, newStatus);

          // Build a CompletionRecord for the audit trail
          const targetItem = state.plan.find((p) => p.id === itemId);
          if (!targetItem) return;

          const newRecord: CompletionRecord = {
            id: generateId(),
            planItemId: itemId,
            toothId: targetItem.toothId,
            procedure: targetItem.procedure,
            previousStatus: targetItem.status,
            newStatus,
            timestamp: new Date().toISOString(),
          };

          // Commit the confirmed state and build the new history list
          setState((prev) => {
            const updatedPlan = prev.plan.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status: newStatus,
                    completedAt:
                      newStatus === TreatmentStatus.COMPLETED
                        ? new Date().toISOString()
                        : undefined,
                  }
                : item,
            );

            const updatedHistory: CompletionRecord[] = [
              newRecord,
              ...prev.history,
            ];

            // Persist the updated history to DB (non-blocking)
            if (patientId) {
              saveTreatmentHistoryAction(patientId, updatedHistory).catch(
                (err) =>
                  console.warn(
                    "[useSessionProgress] saveTreatmentHistoryAction failed:",
                    err,
                  ),
              );
            }

            return { plan: updatedPlan, history: updatedHistory };
          });
        };

        persist().catch((err) => {
          console.warn(
            "[useSessionProgress] updateItemStatus persist failed:",
            err,
          );
        });
      });
    },
    [state.plan, patientId, addOptimisticUpdate],
  );

  // ---------------------------------------------------------------------------
  // Derive odontogram color overrides from all COMPLETED items
  // ---------------------------------------------------------------------------
  const odontogramOverrides = new Map<number, OdontogramColorOverride>();
  for (const item of optimisticState.plan) {
    if (item.status === TreatmentStatus.COMPLETED && item.procedureKey) {
      const override = COMPLETED_COLOR_MAP[item.procedureKey];
      if (override) {
        odontogramOverrides.set(item.toothId, override);
      }
    }
  }

  return {
    optimisticPlan: optimisticState.plan,
    completionHistory: optimisticState.history,
    updateItemStatus,
    odontogramOverrides,
    isLoaded,
    regeneratePlan,
  };
}

// ---------------------------------------------------------------------------
// Named re-exports consumed by other modules
// ---------------------------------------------------------------------------
export { generatePlanFromMouthMap, PROCEDURE_TO_STATUS };
