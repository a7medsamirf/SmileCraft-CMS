import { z } from "zod";
import { Gender, BloodGroup } from "../types";

export const step1Schema = z.object({
  fullName: z.string().min(3, "validationName"),
  phone: z.string().min(10, "validationPhone"),
  nationalId: z.string().optional(),
  birthDate: z.string().min(1, "validationDate"),
  gender: z.nativeEnum(Gender),
  city: z.string().optional(),
});

export const step2Schema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  medicalNotes: z.string().optional(),
  currentMedications: z.string().optional(),
});

export const step3Schema = z.object({
  emergencyName: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

export const addPatientSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type AddPatientFormData = z.infer<typeof addPatientSchema>;
