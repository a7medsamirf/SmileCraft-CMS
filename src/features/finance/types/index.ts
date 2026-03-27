// =============================================================================
// DENTAL CMS — Finance Module: Types & Schemas
// features/finance/types/index.ts
// =============================================================================

export enum InvoiceStatus {
  PAID = "PAID",       // خالص
  PARTIAL = "PARTIAL", // دفع جزئي
  UNPAID = "UNPAID",   // غير مسدد
}

export enum PaymentMethod {
  CASH = "CASH",     // كاش
  CARD = "CARD",     // فيزا / بطاقة إئتمان
  WALLET = "WALLET", // محفظة إلكترونية (فودافون كاش، إلخ)
}

export interface Invoice {
  id: string;
  patientId: string;
  treatmentPlanId?: string;
  totalAmount: number;
  paidAmount: number;
  /** Calculated field: totalAmount - paidAmount */
  balance: number;
  status: InvoiceStatus;
  createdAt: string; // ISO Date String
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string; // ISO Date String
  method: PaymentMethod;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Helpers and Formatters
// ---------------------------------------------------------------------------

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, { ar: string; color: string }> = {
  [InvoiceStatus.PAID]: { ar: "خالص", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200" },
  [InvoiceStatus.PARTIAL]: { ar: "دفع جزئي", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200" },
  [InvoiceStatus.UNPAID]: { ar: "غير مسدد", color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "كاش (نقدي)",
  [PaymentMethod.CARD]: "بطاقة بنكية",
  [PaymentMethod.WALLET]: "محفظة إلكترونية",
};

/**
 * Standard format for Egyptian Pound (EGP) based on Senior Guidance.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
