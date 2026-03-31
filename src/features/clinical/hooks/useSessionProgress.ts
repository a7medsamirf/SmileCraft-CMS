// =============================================================================
// DENTAL CMS — Clinical Module: useSessionProgress Hook
// features/clinical/hooks/useSessionProgress.ts
//
// Custom hook managing treatment plan state with React 19 useOptimistic.
// Provides instant visual feedback on the Odontogram when status changes.
// =============================================================================

"use client";

import { useOptimistic, useCallback, useState, useEffect, startTransition } from "react";
import { MouthMap, ToothStatus } from "../types/odontogram";
import { PlanItem, TreatmentStatus, CompletionRecord } from "../types/treatmentPlan";
import { updateTreatmentItemStatus } from "../actions";
import {
  saveTreatmentPlan,
  fetchTreatmentPlan,
  fetchCompletionHistory,
} from "../services/clinicalService";
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
  /** Generate a fresh plan from the current mouthMap */
  regeneratePlan: (mouthMap: MouthMap, t: ReturnType<typeof useTranslations>) => void;
}

// ---------------------------------------------------------------------------
// Procedure Key → Target Color mapping
// When a procedure is COMPLETED, the tooth should visually reflect
// the treatment that was applied (e.g., caries → filling = blue).
// ---------------------------------------------------------------------------

const COMPLETED_COLOR_MAP: Record<string, OdontogramColorOverride> = {
  procedureCleaning:  { fill: "#3b82f6", stroke: "#1d4ed8" },   // Blue → Filling done
  procedureReview:    { fill: "#3b82f6", stroke: "#1d4ed8" },   // Blue → Filling reviewed
  procedureRootCanal: { fill: "#a855f7", stroke: "#7e22ce" },   // Purple → Root canal done
  procedureCrown:     { fill: "#fbbf24", stroke: "#d97706" },   // Amber → Crown placed
};

// ---------------------------------------------------------------------------
// Procedure Key → Target ToothStatus mapping
// Used to calculate the final odontogram color when procedure completes.
// ---------------------------------------------------------------------------

const PROCEDURE_TO_STATUS: Record<string, ToothStatus> = {
  procedureCleaning:  ToothStatus.FILLING,
  procedureReview:    ToothStatus.FILLING,
  procedureRootCanal: ToothStatus.ROOT_CANAL,
  procedureCrown:     ToothStatus.CROWN,
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

export function useSessionProgress(mouthMap: MouthMap): UseSessionProgressReturn {
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

  // Load initial data
  useEffect(() => {
    const load = async () => {
      const [savedPlan, savedHistory] = await Promise.all([
        fetchTreatmentPlan(),
        fetchCompletionHistory(),
      ]);

      if (savedPlan && savedPlan.length > 0) {
        setState({ plan: savedPlan, history: savedHistory });
      } else {
        // Generate fresh plan from mouthMap
        const freshPlan = generatePlanFromMouthMap(mouthMap, t);
        setState({ plan: freshPlan, history: savedHistory });
        if (freshPlan.length > 0) {
          await saveTreatmentPlan(freshPlan);
        }
      }
      setIsLoaded(true);
    };

    if (mouthMap.length > 0) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(mouthMap)]);

  // Regenerate plan (called when mouthMap changes from ClinicalClient)
  const regeneratePlan = useCallback(
    (newMouthMap: MouthMap, translator: ReturnType<typeof useTranslations>) => {
      const freshPlan = generatePlanFromMouthMap(newMouthMap, translator);
      setState((prev) => ({ ...prev, plan: freshPlan }));
      saveTreatmentPlan(freshPlan);
    },
    [],
  );

  // Update a treatment item status
  const updateItemStatus = useCallback(
    (itemId: string, newStatus: TreatmentStatus) => {
      startTransition(() => {
        // Optimistic update — UI changes instantly
        addOptimisticUpdate({ itemId, newStatus });

        // Fire-and-forget the actual server action
        updateTreatmentItemStatus(state.plan, itemId, newStatus).then((result) => {
          if (result.success && result.updatedItem) {
            // Sync the confirmed state
            setState((prev) => {
              const updatedPlan = prev.plan.map((item) =>
                item.id === itemId ? result.updatedItem! : item,
              );

              const newRecord: CompletionRecord = {
                id: generateId(),
                planItemId: itemId,
                toothId: result.updatedItem!.toothId,
                procedure: result.updatedItem!.procedure,
                previousStatus: prev.plan.find((p) => p.id === itemId)?.status ?? TreatmentStatus.PLANNED,
                newStatus,
                timestamp: new Date().toISOString(),
              };

              return {
                plan: updatedPlan,
                history: [newRecord, ...prev.history],
              };
            });
          }
        });
      });
    },
    [state.plan, addOptimisticUpdate],
  );

  // Calculate odontogram color overrides from completed items
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

export { generatePlanFromMouthMap, PROCEDURE_TO_STATUS };
