// =============================================================================
// DENTAL CMS — Clinical Module: Server Actions
// features/clinical/actions.ts
//
// React 19 Server Actions for treatment plan status management.
// Currently simulates server latency + persists to localStorage.
// =============================================================================

"use client";

import { PlanItem, TreatmentStatus, CompletionRecord, InvoiceMode } from "./types/treatmentPlan";
import {
  saveTreatmentPlan,
  saveCompletionRecord,
  fetchTreatmentPlan,
} from "./services/clinicalService";
import { generateId } from "@/lib/utils/id";

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
// Server Action: Update Treatment Item Status
// ---------------------------------------------------------------------------

export async function updateTreatmentItemStatus(
  plan: PlanItem[],
  itemId: string,
  newStatus: TreatmentStatus,
): Promise<StatusUpdateState> {
  try {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    const itemIndex = plan.findIndex((p) => p.id === itemId);
    if (itemIndex === -1) {
      return { success: false, message: "itemNotFound" };
    }

    const item = plan[itemIndex];
    const previousStatus = item.status;

    // Build the updated item
    const updatedItem: PlanItem = {
      ...item,
      status: newStatus,
      completedAt: newStatus === TreatmentStatus.COMPLETED
        ? new Date().toISOString()
        : undefined,
    };

    // Build the updated plan
    const updatedPlan = [...plan];
    updatedPlan[itemIndex] = updatedItem;

    // Persist the updated plan
    await saveTreatmentPlan(updatedPlan);

    // Create and persist the completion record (audit trail)
    const record: CompletionRecord = {
      id: generateId(),
      planItemId: itemId,
      toothId: item.toothId,
      procedure: item.procedure,
      previousStatus,
      newStatus,
      timestamp: new Date().toISOString(),
    };
    await saveCompletionRecord(record);

    return {
      success: true,
      message: "statusUpdated",
      updatedItem,
    };
  } catch (error) {
    console.error("Failed to update treatment item status:", error);
    return { success: false, message: "statusUpdateError" };
  }
}

// ---------------------------------------------------------------------------
// Server Action: Submit Invoice (with mode selection)
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
    const plan = await fetchTreatmentPlan();
    if (!plan || plan.length === 0) {
      return { success: false, message: "emptyPlanError" };
    }

    if (!patientId) {
      return { success: false, message: "emptyPlanError" };
    }

    // Filter items based on mode
    const invoiceItems = mode === "COMPLETED_ONLY"
      ? plan.filter((item) => item.status === TreatmentStatus.COMPLETED)
      : plan;

    if (invoiceItems.length === 0) {
      return { success: false, message: "noCompletedItems" };
    }

    const total = invoiceItems.reduce((sum, item) => sum + item.estimatedCost, 0);
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
