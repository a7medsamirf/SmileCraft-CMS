import { z } from "zod";
import { Gender, BloodGroup } from "../types/index";

// =============================================================================
// Step 1: Basic Patient Info
// =============================================================================
const step1Schema = z.object({
  fullName: z
    .string()
    .min(3, { message: "validationNameMin" })
    .max(100, { message: "validationNameMax" }),
  phone: z
    .string()
    .min(10, { message: "validationPhoneMin" })
    .max(15, { message: "validationPhoneMax" })
    .regex(/^[0-9+]+$/, { message: "validationPhoneFormat" }),
  nationalId: z
    .string()
    .max(14, { message: "validationNationalIdMax" })
    .optional()
    .or(z.literal("")),
  birthDate: z
    .string()
    .min(1, { message: "validationBirthDateRequired" }),
  gender: z.nativeEnum(Gender, { message: "validationGender" }),
  city: z
    .string()
    .max(50, { message: "validationCityMax" })
    .optional()
    .or(z.literal("")),
});

// =============================================================================
// Step 2: Medical History
// =============================================================================
const step2Schema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  medicalNotes: z
    .string()
    .max(500, { message: "validationMedicalNotesMax" })
    .optional()
    .or(z.literal("")),
  currentMedications: z
    .string()
    .max(500, { message: "validationMedicationsMax" })
    .optional()
    .or(z.literal("")),
});

// =============================================================================
// Step 3: Emergency Contact
// =============================================================================
const step3Schema = z.object({
  emergencyName: z
    .string()
    .max(100, { message: "validationEmergencyNameMax" })
    .optional()
    .or(z.literal("")),
  emergencyRelationship: z
    .string()
    .max(50, { message: "validationEmergencyRelMax" })
    .optional()
    .or(z.literal("")),
  emergencyPhone: z
    .string()
    .max(15, { message: "validationEmergencyPhoneMax" })
    .optional()
    .or(z.literal("")),
});

// =============================================================================
// Combined Full Schema
// =============================================================================
export const addPatientSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export type AddPatientFormData = z.infer<typeof addPatientSchema>;

// Per-step schemas for multi-step validation
export const stepSchemas = [step1Schema, step2Schema, step3Schema] as const;
