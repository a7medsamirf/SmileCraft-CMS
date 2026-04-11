"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MouthMap, generateEmptyMouthMap } from "./types/odontogram";
import {
  PlanItem,
  TreatmentStatus,
  CompletionRecord,
  InvoiceMode,
} from "./types/treatmentPlan";
import { PATIENT_TEETH_MAP } from "./mock/patientTeeth.mock";
import type { ClinicalCase, ClinicalCasePayload } from "./types/clinicalCase";

// ---------------------------------------------------------------------------
// Auth helper — returns the supabase client + current user (or null)
// ---------------------------------------------------------------------------
export async function getSupabaseUser() {
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
  teethWithCases: number[];
  treatmentHistory: CompletionRecord[];
} | null> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) {
      // Not logged in → return mock
      return {
        mouthMap: PATIENT_TEETH_MAP[patientId] ?? generateEmptyMouthMap(),
        treatments: [],
        teethWithCases: [],
        treatmentHistory: [],
      };
    }

    // Parallel fetch for optimal performance
    const [patientRes, treatmentsRes, casesRes] = await Promise.all([
      supabase.from("patients").select("mouthMap, treatmentHistory").eq("id", patientId).single(),
      supabase.from("treatments").select("*").eq("patientId", patientId).order("createdAt", { ascending: false }),
      supabase.from("clinical_cases").select("toothNumber").eq("patientId", patientId),
    ]);

    // Handle patient data (mouthMap and history)
    const rawMap = patientRes.data?.mouthMap;
    const mouthMap: MouthMap = Array.isArray(rawMap)
      ? (rawMap as unknown as MouthMap)
      : (PATIENT_TEETH_MAP[patientId] ?? generateEmptyMouthMap());

    const treatmentHistory: CompletionRecord[] = Array.isArray(patientRes.data?.treatmentHistory)
      ? (patientRes.data.treatmentHistory as unknown as CompletionRecord[])
      : [];

    // Handle treatment items
    const treatments: PlanItem[] = (treatmentsRes.data ?? []).map((t) => ({
      id: t.id as string,
      toothId: t.toothNumber ? parseInt(t.toothNumber as string, 10) : 0,
      procedure: (t.procedureName as string) ?? "",
      procedureKey: (t.procedureType as string) ?? "",
      estimatedCost: Number(t.cost ?? 0),
      status: (t.status as TreatmentStatus) ?? TreatmentStatus.PLANNED,
      completedAt: typeof t.completedAt === "string" ? t.completedAt : undefined,
    }));

    // Handle teethWithCases summary
    const teethWithCases = (casesRes.data ?? []).map((r) =>
      Number((r as Record<string, unknown>).toothNumber),
    );

    return { mouthMap, treatments, teethWithCases, treatmentHistory };
  } catch (err) {
    console.warn("[getPatientClinicalDataAction] Falling back to mock:", err);
    return {
      mouthMap: PATIENT_TEETH_MAP[patientId] ?? generateEmptyMouthMap(),
      treatments: [],
      teethWithCases: [],
      treatmentHistory: [],
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
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) {
      return { success: false, error: "notAuthenticated" };
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("treatments")
      .update({
        status,
        completedAt:
          status === TreatmentStatus.COMPLETED
            ? now
            : null,
        updatedAt: now,
      })
      .eq("id", treatmentId);

    if (error) {
      console.error("[updateTreatmentStatusAction] Update error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/clinical");
    return { success: true };
  } catch (err) {
    console.error("[updateTreatmentStatusAction] Failed:", err);
    return { success: false, error: String(err) };
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
  if (!patientId || plan.length === 0) {
    return plan;
  }

  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) {
      console.warn("[replaceTreatmentPlanAction] No authenticated user - plan not persisted");
      return plan;
    }

    // Delete all existing PLANNED treatments for this patient
    const { error: deleteError } = await supabase
      .from("treatments")
      .delete()
      .eq("patientId", patientId)
      .eq("status", TreatmentStatus.PLANNED);

    if (deleteError) {
      console.warn("[replaceTreatmentPlanAction] Delete error (continuing):", deleteError.message);
    }

    // Build insert rows — assign fresh UUIDs so the caller gets back real DB IDs
    const now = new Date().toISOString();
    const rows = plan.map((item) => ({
      id: crypto.randomUUID(),
      patientId,
      toothNumber: item.toothId.toString(),
      procedureName: item.procedure,
      procedureType: item.procedureKey,
      cost: item.estimatedCost,
      status: TreatmentStatus.PLANNED,
      createdAt: now,
      updatedAt: now,
    }));

    console.log("[replaceTreatmentPlanAction] Inserting treatments:", rows);

    const { data, error } = await supabase
      .from("treatments")
      .insert(rows)
      .select();

    if (error) {
      console.error("[replaceTreatmentPlanAction] Insert error:", error);
      throw new Error(`Failed to save treatment plan: ${error.message}`);
    }

    console.log("[replaceTreatmentPlanAction] Insert result:", data);

    if (!data || data.length === 0) {
      console.error("[replaceTreatmentPlanAction] No data returned from insert");
      throw new Error("No data returned from treatment plan insert");
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
    console.error("[replaceTreatmentPlanAction] Failed:", err);
    throw err; // Let caller handle the error
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

// ---------------------------------------------------------------------------
// createInvoiceAction
// Creates an invoice from the treatment plan with proper Prisma schema.
// Records in monthly revenue automatically via invoice creation.
// Returns the created invoice ID or null on failure.
// ---------------------------------------------------------------------------
export async function createInvoiceAction(
  patientId: string,
  plan: PlanItem[],
  mode: InvoiceMode,
  creatorId?: string,
): Promise<{ success: boolean; invoiceId?: string; invoiceNumber?: string; message: string }> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) {
      return { success: false, message: "notAuthenticated" };
    }

    const effectiveCreatorId = creatorId ?? user.id;

    // Fetch treatments from DB to ensure we have the latest data
    const { data: treatments, error: treatmentsError } = await supabase
      .from("treatments")
      .select("id, toothNumber, procedureName, procedureType, cost, status")
      .eq("patientId", patientId);

    if (treatmentsError || !treatments) {
      console.error("[createInvoiceAction] Treatments fetch error:", treatmentsError);
      return { success: false, message: "emptyPlanError" };
    }

    const dbPlan: PlanItem[] = treatments.map((t) => ({
      id: t.id as string,
      toothId: t.toothNumber ? parseInt(t.toothNumber as string, 10) : 0,
      procedure: (t.procedureName as string) ?? "",
      procedureKey: (t.procedureType as string) ?? "",
      estimatedCost: Number(t.cost ?? 0),
      status: (t.status as TreatmentStatus) ?? TreatmentStatus.PLANNED,
    }));

    const invoiceItems =
      mode === "COMPLETED_ONLY"
        ? dbPlan.filter((item) => item.status === TreatmentStatus.COMPLETED)
        : dbPlan;

    if (invoiceItems.length === 0) {
      return { success: false, message: "noCompletedItems" };
    }

    const total = invoiceItems.reduce((sum, item) => sum + item.estimatedCost, 0);

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${patientId.slice(0, 8).toUpperCase()}`;
    const invoiceId = crypto.randomUUID();

    // Insert invoice into Supabase (mapped to Prisma schema)
    const { error: invoiceError } = await supabase.from("invoices").insert({
      id: invoiceId,
      invoiceNumber,
      patientId,
      totalAmount: total,
      paidAmount: 0,
      status: "DRAFT",
      dueDate: null,
      notes: `Treatment plan invoice - ${mode === "COMPLETED_ONLY" ? "Completed treatments only" : "Full treatment plan"}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (invoiceError) {
      console.error("[createInvoiceAction] Invoice insert error:", invoiceError);
      return { success: false, message: "invoiceCreateError" };
    }

    // Create invoice items for each treatment
    const invoiceItemRows = invoiceItems.map((item) => ({
      id: crypto.randomUUID(),
      invoiceId,
      treatmentId: item.id,
      description: `Tooth #${item.toothId} - ${item.procedure}`,
      quantity: 1,
      unitPrice: item.estimatedCost,
      total: item.estimatedCost,
    }));

    if (invoiceItemRows.length > 0) {
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItemRows);

      if (itemsError) {
        console.error("[createInvoiceAction] Invoice items insert error:", itemsError);
        // Don't fail the entire operation, just log the error
      }
    }

    // Update treatment statuses if COMPLETED_ONLY mode
    if (mode === "COMPLETED_ONLY") {
      for (const item of invoiceItems) {
        await supabase
          .from("treatments")
          .update({ status: TreatmentStatus.COMPLETED })
          .eq("id", item.id);
      }
    }

    revalidatePath("/dashboard/clinical");
    revalidatePath("/dashboard/finance");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);

    return { success: true, invoiceId, invoiceNumber, message: "invoiceSuccess" };
  } catch (err) {
    console.error("[createInvoiceAction] Failed:", err);
    return { success: false, message: "invoiceError" };
  }
}

// ---------------------------------------------------------------------------
// getPatientAction
// Retrieves patient details by ID for invoice generation.
// ---------------------------------------------------------------------------
export async function getPatientAction(
  patientId: string,
): Promise<{ firstName: string; lastName: string; phone: string } | null> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return null;

    const { data, error } = await supabase
      .from("patients")
      .select("firstName, lastName, phone")
      .eq("id", patientId)
      .single();

    if (error || !data) return null;
    return {
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      phone: data.phone as string,
    };
  } catch {
    return null;
  }
}
