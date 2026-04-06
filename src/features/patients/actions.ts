"use server";

import { z } from "zod";
import { createPatientActionDB } from "./serverActions";
import { addPatientSchema } from "./schemas/addPatientSchema";
import { 
  Patient, 
  Gender, 
  BloodGroup, 
  PatientStatus, 
  ISODateString, 
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
  const rawData = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    nationalId: formData.get("nationalId"),
    birthDate: formData.get("birthDate"),
    gender: formData.get("gender"),
    city: formData.get("city"),
    bloodGroup: formData.get("bloodGroup"),
    medicalNotes: formData.get("medicalNotes"),
    currentMedications: formData.get("currentMedications"),
    emergencyName: formData.get("emergencyName"),
    emergencyRelationship: formData.get("emergencyRelationship"),
    emergencyPhone: formData.get("emergencyPhone"),
  };

  const validated = addPatientSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: "validationError",
    };
  }

  const { data } = validated;

  const payload: Omit<Patient, "id" | "createdAt" | "updatedAt"> = {
    fullName: data.fullName,
    gender: data.gender,
    birthDate: data.birthDate as ISODateString,
    contactInfo: {
      phone: data.phone,
      city: data.city,
    },
    medicalHistory: {
      conditions: data.medicalNotes ? [{ condition: data.medicalNotes, isActive: true }] : [],
      allergies: [],
      currentMedications: data.currentMedications ? [data.currentMedications] : [],
      bloodGroup: data.bloodGroup || BloodGroup.UNKNOWN,
    },
    emergencyContact: data.emergencyName ? {
      name: data.emergencyName,
      relationship: data.emergencyRelationship || "",
      phone: data.emergencyPhone || "",
    } : undefined,
    status: PatientStatus.ACTIVE,
    nationalId: data.nationalId,
    visits: [],
  };

  try {
    const newPatient = await createPatientActionDB(payload);
    return {
      success: true,
      message: "addPatientSuccess",
      data: newPatient,
    };
  } catch (error) {
    console.error("Failed to create patient:", error);
    return {
      success: false,
      message: "saveError",
    };
  }
}
