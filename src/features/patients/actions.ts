"use client";

import { patientService } from "./services/patientService";
import { 
  Patient, 
  Gender, 
  BloodGroup, 
  PatientStatus, 
  UUID, 
  ISODateString, 
  ISODateTimeString 
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

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const nationalId = formData.get("nationalId") as string;
  const birthDate = formData.get("birthDate") as string;
  const gender = formData.get("gender") as Gender;
  const city = formData.get("city") as string;
  const bloodGroup = formData.get("bloodGroup") as BloodGroup;
  const medicalNotes = formData.get("medicalNotes") as string;
  const currentMedications = formData.get("currentMedications") as string;
  const emergencyName = formData.get("emergencyName") as string;
  const emergencyRelationship = formData.get("emergencyRelationship") as string;
  const emergencyPhone = formData.get("emergencyPhone") as string;

  // Basic validation - returning keys for localization in the component
  if (!fullName || fullName.length < 3) {
    return {
      success: false,
      message: "validationName",
    };
  }

  if (!phone || phone.length < 10) {
    return {
      success: false,
      message: "validationPhone",
    };
  }

  const now = new Date().toISOString() as ISODateTimeString;
  
  const newPatient: Patient = {
    id: window.crypto.randomUUID() as UUID,
    fullName,
    gender,
    birthDate: birthDate as ISODateString,
    contactInfo: {
      phone,
      city,
    },
    medicalHistory: {
      conditions: medicalNotes ? [{ condition: medicalNotes, isActive: true }] : [],
      allergies: [],
      currentMedications: currentMedications ? [currentMedications] : [],
      bloodGroup: bloodGroup || BloodGroup.UNKNOWN,
    },
    emergencyContact: emergencyName ? {
      name: emergencyName,
      relationship: emergencyRelationship,
      phone: emergencyPhone,
    } : undefined,
    status: PatientStatus.ACTIVE,
    nationalId,
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
      message: "An error occurred while saving the patient.",
    };
  }
}
