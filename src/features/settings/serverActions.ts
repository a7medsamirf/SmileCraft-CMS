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
// ---------------------------------------------------------------------------
async function getClinicId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("users")
      .select("clinicId")
      .eq("id", user.id)
      .single();

    return (data as any)?.clinicId ?? null;
  } catch {
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
      .select("name, address, phone, email, logoUrl, faviconUrl, slotDuration")
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
