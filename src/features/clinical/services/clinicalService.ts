// =============================================================================
// DENTAL CMS — Clinical Module: Clinical Service
// features/clinical/services/clinicalService.ts
// =============================================================================

import { MouthMap, generateEmptyMouthMap } from "../types/odontogram";

const STORAGE_KEY = "smilecraft_clinical_state";

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
