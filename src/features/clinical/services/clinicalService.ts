// =============================================================================
// DENTAL CMS — Clinical Module: Clinical Service
// features/clinical/services/clinicalService.ts
//
// Manages persistence for:
// 1. MouthMap (odontogram state)
// 2. Treatment Plan (PlanItem[] with statuses)
// 3. Completion History (CompletionRecord[] audit trail)
// =============================================================================

import { MouthMap, generateEmptyMouthMap } from "../types/odontogram";
import { PlanItem, CompletionRecord } from "../types/treatmentPlan";

const STORAGE_KEY = "smilecraft_clinical_state";
const PLAN_STORAGE_KEY = "smilecraft_treatment_plan";
const HISTORY_STORAGE_KEY = "smilecraft_completion_history";

// ---------------------------------------------------------------------------
// Mouth Map Persistence
// ---------------------------------------------------------------------------

/**
 * Saves the mouth map to local storage.
 */
export async function saveMouthMap(mouthMap: MouthMap): Promise<void> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mouthMap));
  }
}

/**
 * Loads the mouth map from local storage.
 * If no data is found, returns an empty (healthy) mouth map.
 */
export async function fetchMouthMap(): Promise<MouthMap> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse clinical state:", e);
      }
    }
  }
  
  return generateEmptyMouthMap();
}

// ---------------------------------------------------------------------------
// Treatment Plan Persistence
// ---------------------------------------------------------------------------

/**
 * Saves the treatment plan items to local storage.
 */
export async function saveTreatmentPlan(plan: PlanItem[]): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (typeof window !== "undefined") {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
  }
}

/**
 * Loads the treatment plan from local storage.
 * Returns null if no persisted plan exists (signal to generate fresh from mouthMap).
 */
export async function fetchTreatmentPlan(): Promise<PlanItem[] | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(PLAN_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse treatment plan:", e);
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Completion History Persistence
// ---------------------------------------------------------------------------

/**
 * Appends a new completion record and saves the full history.
 */
export async function saveCompletionRecord(record: CompletionRecord): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (typeof window !== "undefined") {
    const existing = await fetchCompletionHistory();
    const updated = [record, ...existing]; // newest first
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  }
}

/**
 * Loads the completion history from local storage.
 */
export async function fetchCompletionHistory(): Promise<CompletionRecord[]> {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse completion history:", e);
      }
    }
  }

  return [];
}
