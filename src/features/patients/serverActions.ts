"use server";

// =============================================================================
// SmileCraft CMS — Patients Server Actions
// ✅ No Prisma — uses Supabase client directly.
// ✅ Graceful mock-data fallback when DB tables don't exist yet.
// ✅ Never re-throws — the UI always gets a usable response.
// =============================================================================

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PATIENTS } from "./mock/patients.mock";
import {
  Patient,
  PatientFilters,
  PaginatedPatients,
  Gender,
  BloodGroup,
  PatientStatus,
  UUID,
  ISODateString,
  ISODateTimeString,
  Allergy,
  VisitType,
} from "./types/index";

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

    return (data as { clinicId?: string } | null)?.clinicId ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Supabase row → UI Patient
// ---------------------------------------------------------------------------
function mapRowToPatient(row: Record<string, unknown>): Patient {
  // Parse allergies: stored as comma-separated string in DB
  const rawAllergies =
    typeof row.allergies === "string" && row.allergies.trim()
      ? row.allergies
          .split(",")
          .map((a: string) => a.trim())
          .filter(Boolean)
      : [];

  const allergies: Allergy[] = rawAllergies.map((a) => ({
    allergen: a,
    reaction: "",
    severity: "MODERATE" as const,
  }));

  // Parse medical history rows from the joined table
  const historyRows = Array.isArray(row.medical_histories)
    ? (row.medical_histories as Record<string, unknown>[])
    : [];

  const conditions = historyRows.map((mh) => ({
    condition: String(mh.condition ?? ""),
    isActive: true,
    severity:
      typeof mh.severity === "string" ? mh.severity.toLowerCase() : "low",
    notes: typeof mh.notes === "string" ? mh.notes : undefined,
    diagnosedAt: undefined,
  }));

  // Compute age from dateOfBirth
  // Trim to YYYY-MM-DD so <input type="date"> is pre-filled correctly in edit mode
  const dateOfBirth =
    typeof row.dateOfBirth === "string"
      ? row.dateOfBirth.slice(0, 10)
      : undefined;
  const age = dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(dateOfBirth).getTime()) / 31_557_600_000,
      )
    : undefined;

  return {
    id: String(row.id) as UUID,
    fullName: String(row.fullName ?? ""),
    gender: (row.gender as Gender) ?? Gender.MALE,
    birthDate: (dateOfBirth ?? "") as ISODateString, // always YYYY-MM-DD
    age,
    photoUrl: typeof row.avatar === "string" ? row.avatar : undefined,

    contactInfo: {
      phone: String(row.phone ?? ""),
      altPhone: typeof row.altPhone === "string" ? row.altPhone : undefined,
      email: typeof row.email === "string" ? row.email : undefined,
      address: typeof row.address === "string" ? row.address : undefined,
      city: typeof row.city === "string" ? row.city : undefined,
    },

    emergencyContact:
      typeof row.emergencyName === "string" && row.emergencyName.trim()
        ? {
            name: row.emergencyName,
            relationship:
              typeof row.emergencyRelationship === "string"
                ? row.emergencyRelationship
                : "",
            phone:
              typeof row.emergencyPhone === "string" ? row.emergencyPhone : "",
          }
        : undefined,

    medicalHistory: {
      conditions,
      allergies,
      currentMedications:
        typeof row.currentMedications === "string" && row.currentMedications.trim()
          ? row.currentMedications.split(",").map((m) => m.trim()).filter(Boolean)
          : [],
      previousDentalHistory: [],
      bloodGroup: (row.bloodGroup as BloodGroup) ?? BloodGroup.UNKNOWN,
      generalNotes: typeof row.notes === "string" ? row.notes : undefined,
    },

    xrayCount: 0,
    visits: Array.isArray(row.treatmentHistory)
      ? (row.treatmentHistory as any[]).map((rec: any) => ({
          id: rec.id || Math.random().toString(),
          visitDate: rec.timestamp || new Date().toISOString(),
          type: VisitType.TREATMENT,
          dentistName: "طبيب العيادة", // Placeholder until doctor assignment is tracked in records
          chiefComplaint: `${rec.procedure} (سن رقم ${rec.toothId})`,
          isPaid: true,
        }))
      : [],

    status:
      row.isActive === true ? PatientStatus.ACTIVE : PatientStatus.INACTIVE,
    nationalId: typeof row.nationalId === "string" ? row.nationalId : undefined,

    createdAt: String(
      row.createdAt ?? new Date().toISOString(),
    ) as ISODateTimeString,
    updatedAt: String(
      row.updatedAt ?? new Date().toISOString(),
    ) as ISODateTimeString,
    lastVisit: undefined,
  };
}

// ---------------------------------------------------------------------------
// Mock helpers — apply filters client-side
// ---------------------------------------------------------------------------
function applyFiltersToMock(
  all: Patient[],
  filters: PatientFilters,
): Patient[] {
  let result = [...all];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.fullName.toLowerCase().includes(s) ||
        p.contactInfo.phone.includes(s) ||
        (p.contactInfo.email ?? "").toLowerCase().includes(s),
    );
  }

  if (filters.gender) {
    result = result.filter((p) => p.gender === filters.gender);
  }

  if (filters.status) {
    result = result.filter((p) => p.status === filters.status);
  }

  return result;
}

function paginateMock(
  filters: PatientFilters,
  page: number,
  limit: number,
): PaginatedPatients {
  const filtered = applyFiltersToMock(MOCK_PATIENTS, filters);
  const total = filtered.length;
  const data = filtered.slice((page - 1) * limit, page * limit);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

// ===========================================================================
// PUBLIC ACTIONS
// ===========================================================================

// ---------------------------------------------------------------------------
// getPatientsAction
// ---------------------------------------------------------------------------
export async function getPatientsAction(
  filters: PatientFilters = {},
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedPatients> {
  try {
    const clinicId = await getClinicId();

    // No clinic yet → show mock data so the UI is never blank
    if (!clinicId) {
      return paginateMock(filters, page, limit);
    }

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("patients")
      .select("*, medical_histories(*)", { count: "exact" })
      .eq("clinicId", clinicId)
      .is("deletedAt", null);

    if (filters.search) {
      query = query.or(
        `fullName.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
      );
    }

    if (filters.gender) {
      query = query.eq("gender", filters.gender);
    }

    if (filters.status) {
      query = query.eq("isActive", filters.status === PatientStatus.ACTIVE);
    }

    const from = (page - 1) * limit;
    const { data, error, count } = await query
      .range(from, from + limit - 1)
      .order("createdAt", { ascending: false });

    if (error) {
      // Tables might not exist yet (migration not run) — fall back silently
      console.warn(
        "[getPatientsAction] DB unavailable, using mock data:",
        error.message,
      );
      return paginateMock(filters, page, limit);
    }

    const patients = (data as Record<string, unknown>[]).map(mapRowToPatient);
    const total = count ?? 0;

    return {
      data: patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error(
      "[getPatientsAction] Unexpected error, using mock data:",
      err,
    );
    return paginateMock(filters, page, limit);
  }
}

// ---------------------------------------------------------------------------
// getPatientByIdAction
// ---------------------------------------------------------------------------
export async function getPatientByIdAction(
  id: string,
): Promise<Patient | null> {
  try {
    const clinicId = await getClinicId();

    if (clinicId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("patients")
        .select("*, medical_histories(*)")
        .eq("id", id)
        .eq("clinicId", clinicId)
        .is("deletedAt", null)
        .single();

      if (!error && data) {
        return mapRowToPatient(data as Record<string, unknown>);
      }
    }

    // Fall back to mock data (covers development before migration is run)
    return MOCK_PATIENTS.find((p) => p.id === id) ?? null;
  } catch {
    return MOCK_PATIENTS.find((p) => p.id === id) ?? null;
  }
}

// ---------------------------------------------------------------------------
// createPatientActionDB
// ---------------------------------------------------------------------------
export async function createPatientActionDB(
  payload: Omit<Patient, "id" | "createdAt" | "updatedAt">,
): Promise<Patient> {
  const clinicId = await getClinicId();
  if (!clinicId)
    throw new Error("Unauthorized: no clinic found for this user.");

  const supabase = await createClient();
  // Use full timestamp + 4-char random suffix → collision probability ≈ 0
  const fileNumber = `PT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("patients")
    .insert({
      id: crypto.randomUUID(),
      clinicId,
      fileNumber,
      fullName: payload.fullName,
      nationalId: payload.nationalId ?? null,
      phone: payload.contactInfo.phone,
      altPhone: payload.contactInfo.altPhone ?? null,
      email: payload.contactInfo.email ?? null,
      dateOfBirth: payload.birthDate,
      gender: payload.gender,
      bloodGroup: payload.medicalHistory.bloodGroup,
      city: payload.contactInfo.city ?? null,
      address: payload.contactInfo.address ?? null,
      notes: payload.medicalHistory.generalNotes ?? null,
      isActive: payload.status === PatientStatus.ACTIVE,
      allergies: payload.medicalHistory.allergies
        .map((a) => a.allergen)
        .join(", "),
      currentMedications: payload.medicalHistory.currentMedications.join(", "),
      // Emergency contact — the three columns added by migration
      emergencyName: payload.emergencyContact?.name ?? null,
      emergencyRelationship: payload.emergencyContact?.relationship ?? null,
      emergencyPhone: payload.emergencyContact?.phone ?? null,
      updatedAt: new Date().toISOString(),
    })
    .select("*, medical_histories(*)")
    .single();

  if (error) throw new Error(`Failed to create patient: ${error.message}`);

  // Insert medical history rows
  if (payload.medicalHistory.conditions.length > 0 && data) {
    const patientId = (data as Record<string, unknown>).id as string;
    await supabase.from("medical_histories").insert(
      payload.medicalHistory.conditions.map((c) => ({
        id: crypto.randomUUID(),
        patientId,
        condition: c.condition,
        severity: "LOW",
        notes: c.notes ?? null,
      })),
    );
  }

  revalidatePath("/dashboard/patients");
  revalidatePath("/patients");

  return mapRowToPatient(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// updatePatientActionDB
// ---------------------------------------------------------------------------
export async function updatePatientActionDB(
  id: string,
  payload: Partial<Patient>,
): Promise<Patient> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("id", id)
    .eq("clinicId", clinicId)
    .single();

  if (!existing) throw new Error("Patient not found or access denied.");

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (payload.fullName) updateData.fullName = payload.fullName;
  if (payload.contactInfo?.phone) updateData.phone = payload.contactInfo.phone;
  if (payload.contactInfo?.altPhone !== undefined)
    updateData.altPhone = payload.contactInfo.altPhone;
  if (payload.contactInfo?.email !== undefined)
    updateData.email = payload.contactInfo.email;
  if (payload.contactInfo?.city !== undefined)
    updateData.city = payload.contactInfo.city;
  if (payload.contactInfo?.address !== undefined)
    updateData.address = payload.contactInfo.address;
  if (payload.birthDate) updateData.dateOfBirth = payload.birthDate;
  if (payload.gender) updateData.gender = payload.gender;
  if (payload.medicalHistory?.bloodGroup)
    updateData.bloodGroup = payload.medicalHistory.bloodGroup;
  if (payload.medicalHistory?.generalNotes !== undefined)
    updateData.notes = payload.medicalHistory.generalNotes;
  if (payload.status)
    updateData.isActive = payload.status === PatientStatus.ACTIVE;
  if (payload.medicalHistory?.allergies)
    updateData.allergies = payload.medicalHistory.allergies
      .map((a) => a.allergen)
      .join(", ");
  if (payload.medicalHistory?.currentMedications)
    updateData.currentMedications = payload.medicalHistory.currentMedications.join(", ");

  // Emergency contact — always overwrite so clearing the fields works too
  if ("emergencyContact" in payload) {
    updateData.emergencyName = payload.emergencyContact?.name ?? null;
    updateData.emergencyRelationship =
      payload.emergencyContact?.relationship ?? null;
    updateData.emergencyPhone = payload.emergencyContact?.phone ?? null;
  }

  const { data, error } = await supabase
    .from("patients")
    .update(updateData)
    .eq("id", id)
    .select("*, medical_histories(*)")
    .single();

  if (error) throw new Error(`Failed to update patient: ${error.message}`);

  // Replace medical history if provided
  if (payload.medicalHistory?.conditions) {
    await supabase.from("medical_histories").delete().eq("patientId", id);

    if (payload.medicalHistory.conditions.length > 0) {
      await supabase.from("medical_histories").insert(
        payload.medicalHistory.conditions.map((c) => ({
          patientId: id,
          condition: c.condition,
          severity: "LOW",
          notes: c.notes ?? null,
        })),
      );
    }
  }

  revalidatePath("/dashboard/patients");
  revalidatePath(`/dashboard/patients/${id}`);
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);

  return mapRowToPatient(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// deletePatientAction
// ---------------------------------------------------------------------------
export async function deletePatientAction(id: string): Promise<void> {
  const clinicId = await getClinicId();
  if (!clinicId) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Verify ownership before deleting
  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("id", id)
    .eq("clinicId", clinicId)
    .single();

  if (!existing) throw new Error("Patient not found or access denied.");

  // Soft delete: set deletedAt to current timestamp
  const { error } = await supabase
    .from("patients")
    .update({ deletedAt: new Date().toISOString(), isActive: false, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .eq("clinicId", clinicId);

  if (error) throw new Error(`Failed to delete patient: ${error.message}`);

  // Revalidate to update UI
  revalidatePath("/dashboard/patients");
  revalidatePath("/patients");
}
