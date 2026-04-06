"use client";

import { patientService } from "./services/patientService";
import { generateId } from "@/lib/utils/id";
import { addPatientSchema } from "./schemas/addPatientSchema";
import {
  Patient,
  Gender,
  BloodGroup,
  PatientStatus,
  UUID,
  ISODateString,
  ISODateTimeString,
} from "./types/index";

export interface ActionState {
  success: boolean | null;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown;
}

export async function createPatientAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Simulate network delay for better UX (showing loading states)
  await new Promise((res) => setTimeout(res, 800));

  // ── Server-side Zod validation ──
  const rawData = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    nationalId: formData.get("nationalId") as string,
    birthDate: formData.get("birthDate") as string,
    gender: formData.get("gender") as Gender,
    city: formData.get("city") as string,
    bloodGroup: (formData.get("bloodGroup") as BloodGroup) || BloodGroup.UNKNOWN,
    medicalNotes: formData.get("medicalNotes") as string,
    currentMedications: formData.get("currentMedications") as string,
    emergencyName: formData.get("emergencyName") as string,
    emergencyRelationship: formData.get("emergencyRelationship") as string,
    emergencyPhone: formData.get("emergencyPhone") as string,
  };

  const result = addPatientSchema.safeParse(rawData);

  if (!result.success) {
    // Collect per-field errors from Zod
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as string;
      if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
      fieldErrors[fieldName].push(issue.message);
    }

    return {
      success: false,
      message: "validationError",
      errors: fieldErrors,
    };
  }

  const validated = result.data;
  const now = new Date().toISOString() as ISODateTimeString;

  const newPatient: Patient = {
    id: generateId() as UUID,
    fullName: validated.fullName,
    gender: validated.gender,
    birthDate: validated.birthDate as ISODateString,
    contactInfo: {
      phone: validated.phone,
      city: validated.city || undefined,
    },
    medicalHistory: {
      conditions: validated.medicalNotes
        ? [{ condition: validated.medicalNotes, isActive: true }]
        : [],
      allergies: [],
      currentMedications: validated.currentMedications
        ? [validated.currentMedications]
        : [],
      bloodGroup: validated.bloodGroup || BloodGroup.UNKNOWN,
    },
    emergencyContact: validated.emergencyName
      ? {
          name: validated.emergencyName,
          relationship: validated.emergencyRelationship || "",
          phone: validated.emergencyPhone || "",
        }
      : undefined,
    status: PatientStatus.ACTIVE,
    nationalId: validated.nationalId || undefined,
    visits: [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    patientService.savePatient(newPatient);
    return {
      success: true,
      message: "addPatientSuccess",
      data: newPatient,
    };
  } catch (_error) {
    return {
      success: false,
      message: "serverError",
    };
  }
}
