"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MouthMap, generateEmptyMouthMap } from "./types/odontogram";
import {
  PlanItem,
  TreatmentStatus,
  CompletionRecord,
} from "./types/treatmentPlan";
import { PATIENT_TEETH_MAP } from "./mock/patientTeeth.mock";
import type { ClinicalCase, ClinicalCasePayload } from "./types/clinicalCase";

// ---------------------------------------------------------------------------
// Auth helper — returns the supabase client + current user (or null)
// ---------------------------------------------------------------------------
async function getSupabaseUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  } catch {
    return { supabase: null, user: null };
  }
}

// ---------------------------------------------------------------------------
// mapClinicalCaseRow — Supabase row → ClinicalCase
// ---------------------------------------------------------------------------
function mapClinicalCaseRow(row: Record<string, unknown>): ClinicalCase {
  return {
    id: String(row.id),
    clinicId: String(row.clinicId),
    patientId: String(row.patientId),
    toothNumber: Number(row.toothNumber),
    toothStatus: String(
      row.toothStatus,
    ) as import("./types/odontogram").ToothStatus,
    diagnosis: typeof row.diagnosis === "string" ? row.diagnosis : undefined,
    procedure: typeof row.procedure === "string" ? row.procedure : undefined,
    procedureKey:
      typeof row.procedureKey === "string" ? row.procedureKey : undefined,
    notes: typeof row.notes === "string" ? row.notes : undefined,
    estimatedCost: Number(row.estimatedCost ?? 0),
    status: (row.status as TreatmentStatus) ?? TreatmentStatus.PLANNED,
    sessionDate:
      typeof row.sessionDate === "string"
        ? row.sessionDate.slice(0, 10)
        : undefined,
    completedAt:
      typeof row.completedAt === "string" ? row.completedAt : undefined,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// getPatientClinicalDataAction
// Loads mouthMap (JSONB) and treatment rows from Supabase.
// Falls back to PATIENT_TEETH_MAP mock data if DB is unavailable.
// ---------------------------------------------------------------------------
export async function getPatientClinicalDataAction(patientId: string): Promise<{
  mouthMap: MouthMap;
  treatments: PlanItem[];
} | null> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) {
      // Not logged in → return mock
      return {
        mouthMap: PATIENT_TEETH_MAP[patientId] ?? generateEmptyMouthMap(),
        treatments: [],
      };
    }

    // Try to fetch the patient's mouthMap from Supabase
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("mouthMap")
      .eq("id", patientId)
      .single();

    const rawMap = !patientError && patient?.mouthMap ? patient.mouthMap : null;

    const mouthMap: MouthMap = Array.isArray(rawMap)
      ? (rawMap as unknown as MouthMap)
      : (PATIENT_TEETH_MAP[patientId] ?? generateEmptyMouthMap());

    // Try to fetch treatment rows
    const { data: treatmentRows } = await supabase
      .from("treatments")
      .select("*")
      .eq("patientId", patientId)
      .order("createdAt", { ascending: false });

    const treatments: PlanItem[] = (treatmentRows ?? []).map((t) => ({
      id: t.id as string,
      toothId: t.toothNumber ? parseInt(t.toothNumber as string, 10) : 0,
      procedure: (t.procedureName as string) ?? "",
      procedureKey: (t.procedureType as string) ?? "",
      estimatedCost: Number(t.cost ?? 0),
      status: (t.status as TreatmentStatus) ?? TreatmentStatus.PLANNED,
      completedAt:
        typeof t.completedAt === "string" ? t.completedAt : undefined,
    }));

    return { mouthMap, treatments };
  } catch (err) {
    console.warn("[getPatientClinicalDataAction] Falling back to mock:", err);
    return {
      mouthMap: PATIENT_TEETH_MAP[patientId] ?? generateEmptyMouthMap(),
      treatments: [],
    };
  }
}

// ---------------------------------------------------------------------------
// saveMouthMapAction
// Updates the patient's mouthMap JSONB column in Supabase.
// Silently fails (no throw) so the UI's localStorage fallback still works.
// ---------------------------------------------------------------------------
export async function saveMouthMapAction(
  patientId: string,
  mouthMap: MouthMap,
): Promise<void> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return; // not logged in — skip

    await supabase
      .from("patients")
      .update({ mouthMap: mouthMap as unknown as Record<string, unknown> })
      .eq("id", patientId);

    revalidatePath("/dashboard/clinical");
  } catch (err) {
    // Don't throw — the UI already calls localStorage as a backup
    console.warn("[saveMouthMapAction] Could not save to DB:", err);
  }
}

// ---------------------------------------------------------------------------
// updateTreatmentStatusAction
// ---------------------------------------------------------------------------
export async function updateTreatmentStatusAction(
  treatmentId: string,
  status: TreatmentStatus,
): Promise<void> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return;

    await supabase
      .from("treatments")
      .update({
        status,
        completedAt:
          status === TreatmentStatus.COMPLETED
            ? new Date().toISOString()
            : null,
      })
      .eq("id", treatmentId);

    revalidatePath("/dashboard/clinical");
  } catch (err) {
    console.warn("[updateTreatmentStatusAction] Failed:", err);
  }
}

// ---------------------------------------------------------------------------
// createTreatmentAction
// ---------------------------------------------------------------------------
export async function createTreatmentAction(
  patientId: string,
  item: Omit<PlanItem, "id">,
): Promise<string | null> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return null;

    const newId = crypto.randomUUID();
    await supabase.from("treatments").insert({
      id: newId,
      patientId,
      toothNumber: item.toothId.toString(),
      procedureName: item.procedure,
      procedureType: item.procedureKey,
      cost: item.estimatedCost,
      status: item.status,
    });

    revalidatePath("/dashboard/clinical");
    return newId;
  } catch (err) {
    console.warn("[createTreatmentAction] Failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// getClinicalCasesByToothAction
// Load all clinical cases for a specific tooth of a specific patient.
// Returns newest first. Falls back to [] on any error.
// ---------------------------------------------------------------------------
export async function getClinicalCasesByToothAction(
  patientId: string,
  toothNumber: number,
): Promise<ClinicalCase[]> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return [];

    const { data, error } = await supabase
      .from("clinical_cases")
      .select("*")
      .eq("patientId", patientId)
      .eq("toothNumber", toothNumber)
      .order("createdAt", { ascending: false });

    if (error) {
      console.warn("[getClinicalCasesByToothAction]", error.message);
      return [];
    }
    return (data ?? []).map(mapClinicalCaseRow);
  } catch (err) {
    console.warn("[getClinicalCasesByToothAction] fallback:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// upsertClinicalCaseAction
// Creates a new case if no id is provided; updates an existing one if id
// is present. Returns the saved ClinicalCase, or null on failure.
// ---------------------------------------------------------------------------
export async function upsertClinicalCaseAction(
  payload: ClinicalCasePayload,
): Promise<ClinicalCase | null> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return null;

    // Resolve clinicId from the authenticated user
    const { data: userData } = await supabase
      .from("users")
      .select("clinicId")
      .eq("id", user.id)
      .single();
    const clinicId = (userData as { clinicId?: string } | null)?.clinicId;
    if (!clinicId) return null;

    const row = {
      clinicId,
      patientId: payload.patientId,
      toothNumber: payload.toothNumber,
      toothStatus: payload.toothStatus,
      diagnosis: payload.diagnosis ?? null,
      procedure: payload.procedure ?? null,
      procedureKey: payload.procedureKey ?? null,
      notes: payload.notes ?? null,
      estimatedCost: payload.estimatedCost,
      status: payload.status,
      sessionDate: payload.sessionDate ?? null,
      completedAt: payload.completedAt ?? null,
      updatedAt: new Date().toISOString(),
    };

    let result;
    if (payload.id) {
      // Update existing record
      const { data, error } = await supabase
        .from("clinical_cases")
        .update(row)
        .eq("id", payload.id)
        .eq("clinicId", clinicId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("clinical_cases")
        .insert({
          id: crypto.randomUUID(),
          ...row,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = data;
    }

    revalidatePath("/dashboard/clinical");
    return mapClinicalCaseRow(result as Record<string, unknown>);
  } catch (err) {
    console.error("[upsertClinicalCaseAction]", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// deleteClinicalCaseAction
// ---------------------------------------------------------------------------
export async function deleteClinicalCaseAction(caseId: string): Promise<void> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return;
    await supabase.from("clinical_cases").delete().eq("id", caseId);
    revalidatePath("/dashboard/clinical");
  } catch (err) {
    console.warn("[deleteClinicalCaseAction]", err);
  }
}

// ---------------------------------------------------------------------------
// getPatientClinicalCaseSummaryAction
// Returns an array of tooth numbers that have at least one clinical case
// recorded for the given patient. Used to show badge indicators on the
// odontogram without loading full case data for every tooth.
// ---------------------------------------------------------------------------
export async function getPatientClinicalCaseSummaryAction(
  patientId: string,
): Promise<number[]> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return [];
    const { data } = await supabase
      .from("clinical_cases")
      .select("toothNumber")
      .eq("patientId", patientId);
    return (data ?? []).map((r) =>
      Number((r as Record<string, unknown>).toothNumber),
    );
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// replaceTreatmentPlanAction
// Deletes all PLANNED treatments for the patient and inserts fresh ones.
// Returns the inserted PlanItems with their DB-assigned IDs.
// ---------------------------------------------------------------------------
export async function replaceTreatmentPlanAction(
  patientId: string,
  plan: PlanItem[],
): Promise<PlanItem[]> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return plan;

    // Delete all existing PLANNED treatments for this patient
    await supabase
      .from("treatments")
      .delete()
      .eq("patientId", patientId)
      .eq("status", TreatmentStatus.PLANNED);

    if (plan.length === 0) return [];

    // Build insert rows — assign fresh UUIDs so the caller gets back real DB IDs
    const rows = plan.map((item) => ({
      id: crypto.randomUUID(),
      patientId,
      toothNumber: item.toothId.toString(),
      procedureName: item.procedure,
      procedureType: item.procedureKey,
      cost: item.estimatedCost,
      status: TreatmentStatus.PLANNED,
    }));

    const { data, error } = await supabase
      .from("treatments")
      .insert(rows)
      .select();

    if (error) {
      console.warn("[replaceTreatmentPlanAction] Insert error:", error.message);
      // Return original plan with original IDs as fallback
      return plan;
    }

    // Map returned rows back to PlanItem shape
    const inserted: PlanItem[] = (data ?? rows).map((t) => ({
      id: t.id as string,
      toothId: t.toothNumber ? parseInt(t.toothNumber as string, 10) : 0,
      procedure: (t.procedureName as string) ?? "",
      procedureKey: (t.procedureType as string) ?? "",
      estimatedCost: Number(t.cost ?? 0),
      status: TreatmentStatus.PLANNED,
    }));

    revalidatePath("/dashboard/clinical");
    return inserted;
  } catch (err) {
    console.warn("[replaceTreatmentPlanAction] Failed:", err);
    return plan; // fallback: return original plan so UI stays functional
  }
}

// ---------------------------------------------------------------------------
// saveTreatmentHistoryAction
// Persists the completion audit trail (max 50 records) to the patient's
// treatmentHistory JSONB column.
// ---------------------------------------------------------------------------
export async function saveTreatmentHistoryAction(
  patientId: string,
  history: CompletionRecord[],
): Promise<void> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return;

    // Cap at 50 most-recent entries (caller provides newest-first order)
    const capped = history.slice(0, 50);

    await supabase
      .from("patients")
      .update({
        treatmentHistory: capped as unknown as Record<string, unknown>[],
      })
      .eq("id", patientId);
  } catch (err) {
    console.warn("[saveTreatmentHistoryAction] Failed:", err);
  }
}

// ---------------------------------------------------------------------------
// getTreatmentHistoryAction
// Reads the patient's treatmentHistory JSONB column and returns it as a
// typed CompletionRecord[].  Falls back to [] on any error or missing data.
// ---------------------------------------------------------------------------
export async function getTreatmentHistoryAction(
  patientId: string,
): Promise<CompletionRecord[]> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return [];

    const { data, error } = await supabase
      .from("patients")
      .select("treatmentHistory")
      .eq("id", patientId)
      .single();

    if (error || !data?.treatmentHistory) return [];

    const raw = data.treatmentHistory;
    return Array.isArray(raw) ? (raw as CompletionRecord[]) : [];
  } catch (err) {
    console.warn("[getTreatmentHistoryAction] Failed:", err);
    return [];
  }
}
