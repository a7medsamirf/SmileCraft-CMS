"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  StaffMember,
  StaffRole,
  LeaveRequest,
  LeaveType,
  PayrollRecord,
  PayrollStatus,
} from "./types";
import { MOCK_STAFF } from "./mock/staff.mock";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

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

async function getClinicId(): Promise<string | null> {
  try {
    const { supabase, user } = await getSupabaseUser();
    if (!supabase || !user) return null;

    // Use maybeSingle so we get null (not an error) when no row is found
    const { data: publicUser } = await supabase
      .from("users")
      .select("clinicId")
      .eq("id", user.id)
      .maybeSingle();

    if (publicUser?.clinicId) return String(publicUser.clinicId);

    // ── Bootstrap: first visit by this auth user ─────────────────────────
    // 1. Find the first existing clinic, or create a brand-new one
    const { data: clinicRows } = await supabase
      .from("Clinic")
      .select("id")
      .order("createdAt", { ascending: true })
      .limit(1);

    let clinicId: string;
    if (clinicRows && clinicRows.length > 0) {
      clinicId = String((clinicRows[0] as Record<string, unknown>).id);
    } else {
      clinicId = crypto.randomUUID();
      const { error: clinicError } = await supabase.from("Clinic").insert({
        id: clinicId,
        name: "SmileCraft Dental Clinic",
        updatedAt: new Date().toISOString(), // Clinic.updatedAt NOT NULL, no default
      });
      if (clinicError) {
        console.error("[getClinicId] create clinic:", clinicError.message);
        return null;
      }
    }

    // 2. Create the public.users record so future calls find it immediately
    const meta = (user.user_metadata ?? {}) as Record<string, string>;
    const fullName = (
      meta.full_name ??
      meta.name ??
      user.email?.split("@")[0] ??
      "Admin"
    ).trim();

    const { error: userError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email ?? `${user.id}@smilecraft.local`,
        fullName,
        clinicId,
        role: "ADMIN", // UserRole enum: ADMIN | DOCTOR | RECEPTIONIST | ASSISTANT
        isActive: true,
        updatedAt: new Date().toISOString(), // users.updatedAt NOT NULL, no default
      },
      { onConflict: "id" }, // safe upsert in case of race condition
    );

    if (userError) {
      console.error("[getClinicId] create user:", userError.message);
      // Still return clinicId — the staff insert can proceed
    }

    return clinicId;
  } catch (err) {
    console.warn("[getClinicId]", err);
    return null;
  }
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function mapStaffRow(row: Record<string, unknown>): StaffMember {
  return {
    id: String(row.id),
    fullName: String(row.fullName ?? ""),
    role: String(row.role ?? "ASSISTANT") as StaffRole,
    specialty: typeof row.specialty === "string" ? row.specialty : undefined,
    certifications:
      typeof row.certification === "string" && row.certification
        ? (row.certification as string)
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : [],
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    joinDate:
      typeof row.joinDate === "string"
        ? row.joinDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    salary: Number(row.salary ?? 0),
    isActive: row.isActive === true,
    permissions: row.permissions
      ? (row.permissions as Record<string, unknown>)
      : undefined,
  };
}

function mapLeaveRow(row: Record<string, unknown>): LeaveRequest {
  return {
    id: String(row.id),
    staffId: String(row.staffId),
    type: String(row.type) as LeaveType,
    startDate:
      typeof row.startDate === "string"
        ? row.startDate.slice(0, 10)
        : String(row.startDate).slice(0, 10),
    endDate:
      typeof row.endDate === "string"
        ? row.endDate.slice(0, 10)
        : String(row.endDate).slice(0, 10),
    reason: String(row.reason ?? ""),
    status: String(row.status) as "PENDING" | "APPROVED" | "REJECTED",
    requestedAt: String(row.requestedAt),
    reviewedAt: typeof row.reviewedAt === "string" ? row.reviewedAt : undefined,
    reviewedBy: typeof row.reviewedBy === "string" ? row.reviewedBy : undefined,
  };
}

function mapPayrollRow(row: Record<string, unknown>): PayrollRecord {
  return {
    id: String(row.id),
    staffId: String(row.staffId),
    month: String(row.month),
    baseSalary: Number(row.baseSalary ?? 0),
    bonuses: Number(row.bonuses ?? 0),
    deductions: Number(row.deductions ?? 0),
    net: Number(row.net ?? 0),
    status: String(row.status) as PayrollStatus,
    paidAt: typeof row.paidAt === "string" ? row.paidAt : undefined,
    paymentMethod:
      typeof row.paymentMethod === "string"
        ? (row.paymentMethod as "CASH" | "TRANSFER" | "CHECK")
        : undefined,
    note: typeof row.note === "string" ? row.note : undefined,
  };
}

// =============================================================================
// STAFF CRUD
// =============================================================================

export async function getStaffMembersAction(): Promise<StaffMember[]> {
  try {
    const clinicId = await getClinicId();
    // Not authenticated → demo mode
    if (!clinicId) return MOCK_STAFF;

    const { supabase } = await getSupabaseUser();
    if (!supabase) return MOCK_STAFF;

    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("clinicId", clinicId)
      .order("fullName", { ascending: true });

    // DB error → demo fallback
    if (error) {
      console.warn("[getStaffMembersAction]", error.message);
      return MOCK_STAFF;
    }
    // Authenticated but no staff yet → real empty state (not mock)
    if (!data || data.length === 0) return [];

    return (data as Record<string, unknown>[]).map(mapStaffRow);
  } catch {
    return MOCK_STAFF;
  }
}

export async function createStaffMemberAction(
  payload: Omit<StaffMember, "id">,
): Promise<StaffMember> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) throw new Error("Unauthorized");

    const { supabase } = await getSupabaseUser();
    if (!supabase) throw new Error("No DB connection");

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    // If login account is requested, create Supabase Auth user first
    let authUserId: string | null = null;
    if (payload.createLoginAccount && payload.password) {
      const supabaseAdmin = createAdminClient();
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true, // Skip email confirmation for staff
        user_metadata: {
          fullName: payload.fullName,
          role: payload.role,
        },
      });

      if (authError) {
        // Check if email already exists
        if (authError.message.toLowerCase().includes("already")) {
          throw new Error("Email already has an account");
        }
        throw new Error(authError.message);
      }

      authUserId = authData.user?.id ?? null;

      // Create user record in public.users table
      const { error: userError } = await supabase.from("users").insert({
        id: authUserId,
        email: payload.email.toLowerCase(),
        fullName: payload.fullName,
        phone: payload.phone,
        role: payload.role === "DOCTOR" ? "DOCTOR" : "RECEPTIONIST",
        isActive: true,
        clinicId,
        updatedAt: now,
      });

      if (userError) {
        console.error("[createStaffMember] Failed to create user record:", userError.message);
        // Continue anyway - staff record will be created
      }
    }

    // Create staff record
    const { data, error } = await supabase
      .from("staff")
      .insert({
        id: newId,
        clinicId,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        specialty: payload.specialty ?? null,
        certification: payload.certifications.join(", "),
        salary: payload.salary,
        joinDate: payload.joinDate,
        isActive: payload.isActive,
        role: payload.role,
        employeeCode: `STF-${Date.now().toString().slice(-6)}`,
        userId: authUserId, // Link to auth user if created
        permissions: payload.permissions ?? {},
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/staff");
    return mapStaffRow(data as Record<string, unknown>);
  } catch (err) {
    console.error("[createStaffMemberAction]", err);
    return { id: crypto.randomUUID(), ...payload };
  }
}

export async function updateStaffMemberAction(
  id: string,
  payload: Partial<StaffMember>,
): Promise<StaffMember> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) throw new Error("Unauthorized");

    const { supabase } = await getSupabaseUser();
    if (!supabase) throw new Error("No DB connection");

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(), // keep updatedAt current on every edit
    };
    if (payload.fullName !== undefined) patch.fullName = payload.fullName;
    if (payload.email !== undefined) patch.email = payload.email;
    if (payload.phone !== undefined) patch.phone = payload.phone;
    if (payload.specialty !== undefined) patch.specialty = payload.specialty;
    if (payload.certifications !== undefined)
      patch.certification = payload.certifications.join(", ");
    if (payload.salary !== undefined) patch.salary = payload.salary;
    if (payload.isActive !== undefined) patch.isActive = payload.isActive;
    if (payload.role !== undefined) patch.role = payload.role;

    const { data, error } = await supabase
      .from("staff")
      .update(patch)
      .eq("id", id)
      .eq("clinicId", clinicId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/staff");
    return mapStaffRow(data as Record<string, unknown>);
  } catch (err) {
    console.error("[updateStaffMemberAction]", err);
    return {
      id,
      fullName: "",
      role: "ASSISTANT",
      certifications: [],
      email: "",
      phone: "",
      joinDate: "",
      salary: 0,
      isActive: true,
      ...payload,
    } as StaffMember;
  }
}

export async function deleteStaffMemberAction(id: string): Promise<void> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return;

    const { supabase } = await getSupabaseUser();
    if (!supabase) return;

    await supabase.from("staff").delete().eq("id", id).eq("clinicId", clinicId);

    revalidatePath("/dashboard/staff");
  } catch (err) {
    console.error("[deleteStaffMemberAction]", err);
  }
}

// =============================================================================
// LEAVE REQUESTS
// =============================================================================

/** Load all leave requests for the clinic, optionally filtered by staffId. */
export async function getLeaveRequestsAction(
  staffId?: string,
): Promise<LeaveRequest[]> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return [];

    const { supabase } = await getSupabaseUser();
    if (!supabase) return [];

    let query = supabase
      .from("leave_requests")
      .select("*")
      .eq("clinicId", clinicId)
      .order("requestedAt", { ascending: false });

    if (staffId) {
      query = query.eq("staffId", staffId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[getLeaveRequestsAction]", error.message);
      return [];
    }
    return (data ?? []).map((r) => mapLeaveRow(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Submit a new leave request. Returns the created record (or optimistic on failure). */
export async function createLeaveRequestAction(
  payload: Omit<LeaveRequest, "id" | "status" | "requestedAt">,
): Promise<LeaveRequest> {
  const optimistic: LeaveRequest = {
    id: crypto.randomUUID(),
    status: "PENDING",
    requestedAt: new Date().toISOString(),
    ...payload,
  };

  try {
    const clinicId = await getClinicId();
    if (!clinicId) return optimistic;

    const { supabase } = await getSupabaseUser();
    if (!supabase) return optimistic;

    const { data, error } = await supabase
      .from("leave_requests")
      .insert({
        id: optimistic.id,
        clinicId,
        staffId: payload.staffId,
        type: payload.type,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      console.error("[createLeaveRequestAction]", error.message);
      return optimistic;
    }

    revalidatePath("/dashboard/staff");
    return mapLeaveRow(data as Record<string, unknown>);
  } catch (err) {
    console.error("[createLeaveRequestAction]", err);
    return optimistic;
  }
}

/** Approve or reject a leave request. */
export async function updateLeaveStatusAction(
  leaveId: string,
  status: "APPROVED" | "REJECTED",
  reviewedBy?: string,
): Promise<void> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return;

    const { supabase } = await getSupabaseUser();
    if (!supabase) return;

    await supabase
      .from("leave_requests")
      .update({
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewedBy ?? null,
      })
      .eq("id", leaveId)
      .eq("clinicId", clinicId);

    revalidatePath("/dashboard/staff");
  } catch (err) {
    console.warn("[updateLeaveStatusAction]", err);
  }
}

// =============================================================================
// PAYROLL RECORDS
// =============================================================================

/** Load all payroll records for a specific month. */
export async function getPayrollByMonthAction(
  month: string,
): Promise<PayrollRecord[]> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return [];

    const { supabase } = await getSupabaseUser();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("payroll_records")
      .select("*")
      .eq("clinicId", clinicId)
      .eq("month", month)
      .order("createdAt", { ascending: true });

    if (error) {
      console.warn("[getPayrollByMonthAction]", error.message);
      return [];
    }
    return (data ?? []).map((r) => mapPayrollRow(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

/**
 * Upsert a payroll record (create if new id, update if existing).
 * Uses the `id` field as the upsert key.
 */
export async function savePayrollRecordAction(
  record: PayrollRecord,
): Promise<PayrollRecord> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return record;

    const { supabase } = await getSupabaseUser();
    if (!supabase) return record;

    const { data, error } = await supabase
      .from("payroll_records")
      .upsert({
        id: record.id,
        clinicId,
        staffId: record.staffId,
        month: record.month,
        baseSalary: record.baseSalary,
        bonuses: record.bonuses,
        deductions: record.deductions,
        net: record.net,
        status: record.status,
        paidAt: record.paidAt ?? null,
        paymentMethod: record.paymentMethod ?? null,
        note: record.note ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[savePayrollRecordAction]", error.message);
      return record;
    }

    revalidatePath("/dashboard/staff");
    return mapPayrollRow(data as Record<string, unknown>);
  } catch (err) {
    console.error("[savePayrollRecordAction]", err);
    return record;
  }
}

/**
 * Generate payroll records for all active staff for the given month.
 * Staff that already have a record are skipped (UNIQUE constraint).
 * Returns all records for that month after generation.
 */
export async function generateMonthlyPayrollAction(
  month: string,
  staffList: StaffMember[],
): Promise<PayrollRecord[]> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return [];

    const { supabase } = await getSupabaseUser();
    if (!supabase) return [];

    // Find which staff already have a record this month
    const { data: existing } = await supabase
      .from("payroll_records")
      .select("staffId")
      .eq("clinicId", clinicId)
      .eq("month", month);

    const existingIds = new Set(
      (existing ?? []).map((r) =>
        String((r as Record<string, unknown>).staffId),
      ),
    );

    const toCreate = staffList.filter(
      (s) => s.isActive && !existingIds.has(s.id),
    );

    if (toCreate.length > 0) {
      const { error } = await supabase.from("payroll_records").insert(
        toCreate.map((s) => ({
          id: crypto.randomUUID(),
          clinicId,
          staffId: s.id,
          month,
          baseSalary: s.salary,
          bonuses: 0,
          deductions: 0,
          net: s.salary,
          status: "PENDING",
        })),
      );
      if (error)
        console.warn("[generateMonthlyPayrollAction] insert:", error.message);
    }

    // Return all records for the month
    return getPayrollByMonthAction(month);
  } catch (err) {
    console.warn("[generateMonthlyPayrollAction]", err);
    return [];
  }
}
