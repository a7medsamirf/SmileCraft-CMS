"use server";

// =============================================================================
// SmileCraft CMS — Settings Server Actions
// ✅ No Prisma — uses Supabase client directly.
// ✅ Graceful fallback on DB errors (tables may not exist pre-migration).
// ✅ Never re-throws from read actions — write actions throw on failure.
// =============================================================================

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DentalService,
  BusinessDay,
  ClinicInfo,
  NotificationSettings,
} from "./types";

// ---------------------------------------------------------------------------
// Auth helper — returns clinicId or null (never throws)
// Supports first-time bootstrap when the authenticated user has no public users row.
// ---------------------------------------------------------------------------
async function getClinicId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: publicUser } = await supabase
      .from("users")
      .select("clinicId")
      .eq("id", user.id)
      .maybeSingle();

    if (publicUser?.clinicId) return String(publicUser.clinicId);

    // Bootstrapping support: if the app DB already has a clinic but no public user row,
    // link the current auth user to the first clinic and persist the public user record.
    const { data: clinicRows, error: clinicError } = await supabase
      .from("Clinic")
      .select("id")
      .order("createdAt", { ascending: true })
      .limit(1);

    if (clinicError) {
      console.warn("[getClinicId] Clinic lookup failed:", clinicError.message);
      return null;
    }

    let clinicId: string;
    if (clinicRows && clinicRows.length > 0) {
      clinicId = String((clinicRows[0] as Record<string, unknown>).id);
    } else {
      clinicId = crypto.randomUUID();
      const { error: createClinicError } = await supabase.from("Clinic").insert({
        id: clinicId,
        name: "SmileCraft Dental Clinic",
        updatedAt: new Date().toISOString(),
      });
      if (createClinicError) {
        console.error("[getClinicId] Failed to create Clinic:", createClinicError.message);
        return null;
      }
    }

    const meta = (user.user_metadata ?? {}) as Record<string, string>;
    const fullName = (
      meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "Admin"
    ).trim();

    const { error: userInsertError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email ?? `${user.id}@smilecraft.local`,
        fullName,
        clinicId,
        role: "ADMIN",
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (userInsertError) {
      console.warn("[getClinicId] Failed to create public user row:", userInsertError.message);
    }

    return clinicId;
  } catch (err) {
    console.warn("[getClinicId] Unexpected error:", err);
    return null;
  }
}

// ===========================================================================
// SERVICES ACTIONS
// ===========================================================================

// ---------------------------------------------------------------------------
// getServicesAction
// ---------------------------------------------------------------------------
export async function getServicesAction(): Promise<DentalService[]> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, name, category, price, duration, procedureType")
      .eq("clinicId", clinicId)
      .eq("isActive", true)
      .order("name", { ascending: true });

    if (error) {
      console.warn("[getServicesAction] DB error:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      category: row.category as DentalService["category"],
      price: Number(row.price ?? 0),
      duration: Number(row.duration ?? 30),
      procedureType: (row.procedureType ?? "OTHER") as DentalService["procedureType"],
    }));
  } catch (err) {
    console.error("[getServicesAction] Unexpected error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// createServiceAction
// ---------------------------------------------------------------------------
export async function createServiceAction(
  payload: Omit<DentalService, "id">,
): Promise<DentalService> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized: no clinic found for this user.");

  const supabase = await createClient();
  const code = `SVC-${Date.now()}`;

  const { data, error } = await supabase
    .from("services")
    .insert({
      id: crypto.randomUUID(),
      clinicId,
      name: payload.name,
      code,
      category: payload.category,
      price: payload.price,
      duration: payload.duration,
      procedureType: payload.procedureType,
      isActive: true,
      updatedAt: new Date().toISOString(),
    })
    .select("id, name, category, price, duration, procedureType")
    .single();

  if (error) throw new Error(`Failed to create service: ${error.message}`);

  revalidatePath("/dashboard/settings");

  const row = data as Record<string, unknown>;
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    category: row.category as DentalService["category"],
    price: Number(row.price ?? 0),
    duration: Number(row.duration ?? 30),
    procedureType: (row.procedureType ?? "OTHER") as DentalService["procedureType"],
  };
}

// ---------------------------------------------------------------------------
// updateServiceAction
// ---------------------------------------------------------------------------
export async function updateServiceAction(
  id: string,
  payload: Partial<DentalService>,
): Promise<void> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized");

  const supabase = await createClient();
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.price !== undefined) updateData.price = payload.price;
  if (payload.category !== undefined) updateData.category = payload.category;
  if (payload.duration !== undefined) updateData.duration = payload.duration;
  if (payload.procedureType !== undefined) updateData.procedureType = payload.procedureType;

  const { error } = await supabase
    .from("services")
    .update(updateData)
    .eq("id", id)
    .eq("clinicId", clinicId);

  if (error) throw new Error(`Failed to update service: ${error.message}`);

  revalidatePath("/dashboard/settings");
}

// ---------------------------------------------------------------------------
// deleteServiceAction — soft delete (sets isActive = false)
// ---------------------------------------------------------------------------
export async function deleteServiceAction(id: string): Promise<void> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ isActive: false, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .eq("clinicId", clinicId);

  if (error) throw new Error(`Failed to delete service: ${error.message}`);

  revalidatePath("/dashboard/settings");
}

// ===========================================================================
// BUSINESS HOURS ACTIONS
// ===========================================================================

// ---------------------------------------------------------------------------
// getBusinessHoursAction
// ---------------------------------------------------------------------------
export async function getBusinessHoursAction(): Promise<BusinessDay[]> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clinic_business_hours")
      .select("hours")
      .eq("clinicId", clinicId)
      .single();

    if (error || !data) {
      // PGRST116 = no rows found — not a real error, clinic just hasn't saved hours yet
      if (error?.code !== "PGRST116") {
        console.warn("[getBusinessHoursAction] DB error:", error?.message);
      }
      return [];
    }

    const hours = (data as Record<string, unknown>).hours;
    return Array.isArray(hours) ? (hours as BusinessDay[]) : [];
  } catch (err) {
    console.error("[getBusinessHoursAction] Unexpected error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// getBusinessHoursForBookingAction — returns hours optimized for booking UI
// ---------------------------------------------------------------------------
export async function getBusinessHoursForBookingAction(): Promise<{
  hours: BusinessDay[];
  slotDuration: number;
}> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) {
      return { hours: [], slotDuration: 30 };
    }

    const supabase = await createClient();
    
    // Fetch both business hours and clinic slot duration
    const [{ data: hoursData, error: hoursError }, { data: clinicData, error: clinicError }] =
      await Promise.all([
        supabase
          .from("clinic_business_hours")
          .select("hours")
          .eq("clinicId", clinicId)
          .single(),
        supabase
          .from("Clinic")
          .select("slotDuration")
          .eq("id", clinicId)
          .single(),
      ]);

    if (hoursError && hoursError.code !== "PGRST116") {
      console.warn("[getBusinessHoursForBookingAction] Hours DB error:", hoursError.message);
    }

    if (clinicError) {
      console.warn("[getBusinessHoursForBookingAction] Clinic DB error:", clinicError.message);
    }

    const hours = hoursData
      ? Array.isArray((hoursData as Record<string, unknown>).hours)
        ? ((hoursData as Record<string, unknown>).hours as BusinessDay[])
        : []
      : [];

    const slotDuration = clinicData
      ? Number((clinicData as Record<string, unknown>).slotDuration ?? 30)
      : 30;

    return { hours, slotDuration };
  } catch (err) {
    console.error("[getBusinessHoursForBookingAction] Unexpected error:", err);
    return { hours: [], slotDuration: 30 };
  }
}

// ---------------------------------------------------------------------------
// saveBusinessHoursAction — upsert on unique(clinicId)
// ---------------------------------------------------------------------------
export async function saveBusinessHoursAction(
  hours: BusinessDay[],
): Promise<void> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("clinic_business_hours")
    .upsert(
      { clinicId, hours, updatedAt: new Date().toISOString() },
      { onConflict: "clinicId" },
    );

  if (error) throw new Error(`Failed to save business hours: ${error.message}`);

  revalidatePath("/dashboard/settings");
}

// ===========================================================================
// CLINIC INFO ACTIONS
// ===========================================================================

// ---------------------------------------------------------------------------
// getClinicInfoAction
// ---------------------------------------------------------------------------
export async function getClinicInfoAction(): Promise<ClinicInfo | null> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("Clinic")
      .select("name, address, phone, email, logoUrl, logoUrlDark, faviconUrl, slotDuration")
      .eq("id", clinicId)
      .single();

    if (error || !data) {
      if (error?.code !== "PGRST116") {
        console.warn("[getClinicInfoAction] DB error:", error?.message);
      }
      return null;
    }

    const row = data as Record<string, unknown>;
    return {
      name: String(row.name ?? ""),
      address: String(row.address ?? ""),
      phone: String(row.phone ?? ""),
      email: String(row.email ?? ""),
      logoUrl: row.logoUrl ? String(row.logoUrl) : undefined,
      logoUrlDark: row.logoUrlDark ? String(row.logoUrlDark) : undefined,
      faviconUrl: row.faviconUrl ? String(row.faviconUrl) : undefined,
      slotDuration: Number(row.slotDuration ?? 30),
    };
  } catch (err) {
    console.error("[getClinicInfoAction] Unexpected error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// updateClinicInfoAction
// ---------------------------------------------------------------------------
export async function updateClinicInfoAction(
  payload: Partial<ClinicInfo>,
): Promise<void> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized");

  const supabase = await createClient();
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.email !== undefined) updateData.email = payload.email;
  if (payload.logoUrl !== undefined) updateData.logoUrl = payload.logoUrl;
  if (payload.logoUrlDark !== undefined) updateData.logoUrlDark = payload.logoUrlDark;
  if (payload.faviconUrl !== undefined) updateData.faviconUrl = payload.faviconUrl;
  if (payload.slotDuration !== undefined) updateData.slotDuration = payload.slotDuration;

  const { error } = await supabase
    .from("Clinic")
    .update(updateData)
    .eq("id", clinicId);

  if (error) throw new Error(`Failed to update clinic info: ${error.message}`);

  revalidatePath("/dashboard/settings");
  revalidatePath("/", "layout");
}

// ===========================================================================
// NOTIFICATION SETTINGS ACTIONS
// ===========================================================================

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  smsEnabled: true,
  whatsappEnabled: true,
  emailEnabled: false,
  reminderTiming: 24,
};

// ---------------------------------------------------------------------------
// getNotificationSettingsAction
// ---------------------------------------------------------------------------
export async function getNotificationSettingsAction(): Promise<NotificationSettings> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return DEFAULT_NOTIFICATIONS;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clinic_notification_settings")
      .select("smsEnabled, whatsappEnabled, emailEnabled, reminderTiming")
      .eq("clinicId", clinicId)
      .single();

    if (error || !data) {
      if (error?.code !== "PGRST116") {
        console.warn("[getNotificationSettingsAction] DB error:", error?.message);
      }
      return DEFAULT_NOTIFICATIONS;
    }

    const row = data as Record<string, unknown>;
    return {
      smsEnabled: row.smsEnabled !== false, // default true
      whatsappEnabled: row.whatsappEnabled !== false, // default true
      emailEnabled: Boolean(row.emailEnabled ?? false),
      reminderTiming: Number(row.reminderTiming ?? 24),
    };
  } catch (err) {
    console.error("[getNotificationSettingsAction] Unexpected error:", err);
    return DEFAULT_NOTIFICATIONS;
  }
}

// ---------------------------------------------------------------------------
// saveNotificationSettingsAction — upsert on unique(clinicId)
// ---------------------------------------------------------------------------
export async function saveNotificationSettingsAction(
  settings: NotificationSettings,
): Promise<void> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("clinic_notification_settings")
    .upsert(
      {
        clinicId,
        smsEnabled: settings.smsEnabled,
        whatsappEnabled: settings.whatsappEnabled,
        emailEnabled: settings.emailEnabled,
        reminderTiming: settings.reminderTiming,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: "clinicId" },
    );

  if (error)
    throw new Error(`Failed to save notification settings: ${error.message}`);

  revalidatePath("/dashboard/settings");
}

// ---------------------------------------------------------------------------
// getStaffPermissionsAction — get permissions for all staff
// ---------------------------------------------------------------------------
export async function getStaffPermissionsAction(): Promise<
  Array<{ id: string; fullName: string; role: string; permissions: Record<string, unknown> }>
> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("id, fullName, role, permissions")
      .eq("clinicId", clinicId)
      .eq("isActive", true)
      .order("fullName", { ascending: true });

    if (error) {
      console.warn("[getStaffPermissionsAction]", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: String(row.id),
      fullName: String(row.fullName ?? ""),
      role: String(row.role ?? "ASSISTANT"),
      permissions: (row.permissions as Record<string, unknown>) ?? {},
    }));
  } catch (err) {
    console.warn("[getStaffPermissionsAction]", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// updateStaffPermissionsAction — update permissions for a staff member
// ---------------------------------------------------------------------------
export async function updateStaffPermissionsAction(
  staffId: string,
  permissions: Record<string, boolean>,
): Promise<void> {
  try {
    const clinicId = await getClinicId();
    if (!clinicId) throw new Error("Unauthorized");

    const supabase = await createClient();

    // Verify staff belongs to this clinic
    const { data: staffData } = await supabase
      .from("staff")
      .select("id")
      .eq("id", staffId)
      .eq("clinicId", clinicId)
      .maybeSingle();

    if (!staffData) {
      throw new Error("Staff member not found or unauthorized");
    }

    const { error } = await supabase
      .from("staff")
      .update({
        permissions,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", staffId)
      .eq("clinicId", clinicId);

    if (error) {
      throw new Error(`Failed to update permissions: ${error.message}`);
    }

    revalidatePath("/dashboard/settings");
  } catch (err) {
    console.error("[updateStaffPermissionsAction]", err);
    throw err;
  }
}

