// =============================================================================
// DENTAL CMS — Clinical Module: Client Action Coordinators
// features/clinical/actions.ts
//
// "use client" async functions that coordinate UI state updates.
// Actual DB writes are delegated to serverActions.ts (Supabase/Prisma).
// Zero localStorage usage — all persistence goes through server actions.
// =============================================================================

"use client";

import {
  PlanItem,
  TreatmentStatus,
  CompletionRecord,
  InvoiceMode,
} from "./types/treatmentPlan";
import { generateId } from "@/lib/utils/id";
import { updateTreatmentStatusAction } from "./serverActions";
import { fetchTreatmentPlan } from "./services/clinicalService";

// ---------------------------------------------------------------------------
// Action State Types
// ---------------------------------------------------------------------------

export interface StatusUpdateState {
  success: boolean | null;
  message: string;
  updatedItem?: PlanItem;
}

export interface InvoiceActionState {
  success: boolean | null;
  message: string;
  invoiceId?: string;
  mode?: InvoiceMode;
  total?: number;
}

// ---------------------------------------------------------------------------
// updateTreatmentItemStatus
//
// Finds the item in the local plan snapshot, builds the updated PlanItem,
// then delegates the actual DB write to updateTreatmentStatusAction.
// The caller (useSessionProgress) is responsible for building and persisting
// the CompletionRecord via saveTreatmentHistoryAction.
// ---------------------------------------------------------------------------

export async function updateTreatmentItemStatus(
  plan: PlanItem[],
  itemId: string,
  newStatus: TreatmentStatus,
): Promise<StatusUpdateState> {
  const itemIndex = plan.findIndex((p) => p.id === itemId);
  if (itemIndex === -1) {
    return { success: false, message: "itemNotFound" };
  }

  const item = plan[itemIndex];

  const updatedItem: PlanItem = {
    ...item,
    status: newStatus,
    completedAt:
      newStatus === TreatmentStatus.COMPLETED
        ? new Date().toISOString()
        : undefined,
  };

  // Persist to DB via server action (handles Supabase write + revalidatePath)
  await updateTreatmentStatusAction(itemId, newStatus);

  return {
    success: true,
    message: "statusUpdated",
    updatedItem,
  };
}

// ---------------------------------------------------------------------------
// submitInvoiceAction
//
// Converts the current treatment plan into an invoice.
// Supports two modes: "ALL" (full plan) or "COMPLETED_ONLY".
// ---------------------------------------------------------------------------

export async function submitInvoiceAction(
  prevState: InvoiceActionState,
  formData: FormData,
): Promise<InvoiceActionState> {
  try {
    const patientId = formData.get("patientId");
    const mode = (formData.get("invoiceMode") as InvoiceMode) || "ALL";

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Load the current plan
    // Note: fetchTreatmentPlan() is a stub returning null post-migration.
    // This action will be re-wired to a DB-backed plan source in Phase 3.
    const plan = await fetchTreatmentPlan();
    if (!plan || plan.length === 0) {
      return { success: false, message: "emptyPlanError" };
    }

    if (!patientId) {
      return { success: false, message: "emptyPlanError" };
    }

    // Filter items based on mode
    const invoiceItems =
      mode === "COMPLETED_ONLY"
        ? plan.filter((item) => item.status === TreatmentStatus.COMPLETED)
        : plan;

    if (invoiceItems.length === 0) {
      return { success: false, message: "noCompletedItems" };
    }

    const total = invoiceItems.reduce(
      (sum, item) => sum + item.estimatedCost,
      0,
    );
    const invoiceId = `INV-${Math.floor(Math.random() * 10000)}`;

    return {
      success: true,
      message: "invoiceSuccess",
      invoiceId,
      mode,
      total,
    };
  } catch (error) {
    console.error("Failed to submit invoice:", error);
    return { success: false, message: "invoiceError" };
  }
}

// ---------------------------------------------------------------------------
// Re-export generateId so callers that previously imported it from here
// don't need to update their import paths.
// ---------------------------------------------------------------------------
export { generateId };
