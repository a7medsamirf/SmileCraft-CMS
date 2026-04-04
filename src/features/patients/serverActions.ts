"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  Patient, 
  PatientFilters, 
  PaginatedPatients,
  Gender,
  BloodGroup,
  PatientStatus,
  UUID,
  ISODateString,
  ISODateTimeString
} from "./types/index";

// Helper function to map Prisma Patient to UI Patient Type
function mapPrismaToUIPatient(dbPatient: any): Patient {
  const mdHistory = typeof dbPatient.medicalHistory === 'string' 
      ? JSON.parse(dbPatient.medicalHistory) 
      : (dbPatient.medicalHistory || {});

  return {
    id: dbPatient.id as UUID,
    fullName: dbPatient.fullName,
    gender: dbPatient.gender as Gender,
    birthDate: dbPatient.dateOfBirth.toISOString() as ISODateString,
    contactInfo: {
      phone: dbPatient.phone,
      altPhone: dbPatient.altPhone || undefined,
      email: dbPatient.email || undefined,
      address: dbPatient.address || undefined,
      city: dbPatient.city || undefined,
    },
    medicalHistory: {
      conditions: mdHistory.conditions || [],
      allergies: mdHistory.allergies || [],
      currentMedications: mdHistory.currentMedications || [],
      bloodGroup: (dbPatient.bloodGroup as BloodGroup) || BloodGroup.UNKNOWN,
      generalNotes: dbPatient.notes || undefined,
      previousDentalHistory: mdHistory.previousDentalHistory || [],
    },
    emergencyContact: mdHistory.emergencyContact || undefined,
    status: dbPatient.isActive ? PatientStatus.ACTIVE : PatientStatus.INACTIVE,
    nationalId: mdHistory.nationalId || undefined,
    createdAt: dbPatient.createdAt.toISOString() as ISODateTimeString,
    updatedAt: dbPatient.updatedAt.toISOString() as ISODateTimeString,
    visits: [], // Will be hydrated if related visits are fetched
  };
}

export async function getPatientsAction(
  filters: PatientFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPatients> {
  const whereClause: any = {};

  if (filters.search) {
    const s = filters.search.toLowerCase();
    whereClause.OR = [
      { fullName: { contains: s, mode: 'insensitive' } },
      { fileNumber: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s, mode: 'insensitive' } },
    ];
  }

  if (filters.gender) {
    whereClause.gender = filters.gender;
  }

  if (filters.status) {
    whereClause.isActive = filters.status === PatientStatus.ACTIVE;
  }

  try {
    const [dbPatients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.patient.count({ where: whereClause }),
    ]);

    return {
      data: dbPatients.map(mapPrismaToUIPatient),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error in getPatientsAction:", error);
    throw error;
  }
}

export async function getPatientByIdAction(id: string): Promise<Patient | null> {
  const dbPatient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!dbPatient) return null;
  return mapPrismaToUIPatient(dbPatient);
}

export async function createPatientActionDB(payload: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
  // Generate a file number based on current time
  const fileNumber = `PT-${Date.now().toString().slice(-6)}`;
  
  // Package what schema doesn't have natively into JSON
  const medHistoryJson = {
    conditions: payload.medicalHistory.conditions,
    allergies: payload.medicalHistory.allergies,
    currentMedications: payload.medicalHistory.currentMedications,
    previousDentalHistory: payload.medicalHistory.previousDentalHistory,
    emergencyContact: payload.emergencyContact,
    nationalId: payload.nationalId,
  };

  const dbPatient = await prisma.patient.create({
    data: {
      fileNumber,
      fullName: payload.fullName,
      phone: payload.contactInfo.phone,
      altPhone: payload.contactInfo.altPhone,
      email: payload.contactInfo.email,
      dateOfBirth: new Date(payload.birthDate),
      gender: payload.gender === Gender.MALE || payload.gender === Gender.FEMALE ? payload.gender : "MALE",
      bloodGroup: payload.medicalHistory.bloodGroup,
      city: payload.contactInfo.city,
      address: payload.contactInfo.address,
      notes: payload.medicalHistory.generalNotes,
      isActive: payload.status === PatientStatus.ACTIVE,
      medicalHistory: medHistoryJson as any,
    },
  });

  revalidatePath("/dashboard/patients");
  return mapPrismaToUIPatient(dbPatient);
}

export async function updatePatientActionDB(id: string, payload: Partial<Patient>): Promise<Patient> {
  const existing = await prisma.patient.findUnique({ where: { id } });
  if (!existing) throw new Error("Patient not found");

  const existingMdHistory = typeof existing.medicalHistory === 'string' 
      ? JSON.parse(existing.medicalHistory) 
      : (existing.medicalHistory || {});

  const updatedMdHistory = {
    ...existingMdHistory,
    conditions: payload.medicalHistory?.conditions || existingMdHistory.conditions,
    allergies: payload.medicalHistory?.allergies || existingMdHistory.allergies,
    currentMedications: payload.medicalHistory?.currentMedications || existingMdHistory.currentMedications,
    previousDentalHistory: payload.medicalHistory?.previousDentalHistory || existingMdHistory.previousDentalHistory,
    emergencyContact: payload.emergencyContact || existingMdHistory.emergencyContact,
    nationalId: payload.nationalId || existingMdHistory.nationalId,
  };

  const updateData: any = {
    medicalHistory: updatedMdHistory as any,
  };

  if (payload.fullName) updateData.fullName = payload.fullName;
  if (payload.contactInfo?.phone) updateData.phone = payload.contactInfo.phone;
  if (payload.contactInfo?.altPhone !== undefined) updateData.altPhone = payload.contactInfo.altPhone;
  if (payload.contactInfo?.email !== undefined) updateData.email = payload.contactInfo.email;
  if (payload.birthDate) updateData.dateOfBirth = new Date(payload.birthDate);
  if (payload.gender) updateData.gender = payload.gender;
  if (payload.medicalHistory?.bloodGroup) updateData.bloodGroup = payload.medicalHistory.bloodGroup;
  if (payload.contactInfo?.city !== undefined) updateData.city = payload.contactInfo.city;
  if (payload.contactInfo?.address !== undefined) updateData.address = payload.contactInfo.address;
  if (payload.medicalHistory?.generalNotes !== undefined) updateData.notes = payload.medicalHistory.generalNotes;
  if (payload.status) updateData.isActive = payload.status === PatientStatus.ACTIVE;

  const dbPatient = await prisma.patient.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/dashboard/patients");
  revalidatePath(`/dashboard/patients/${id}`);
  return mapPrismaToUIPatient(dbPatient);
}

export async function deletePatientAction(id: string): Promise<void> {
  await prisma.patient.delete({
    where: { id },
  });
  revalidatePath("/dashboard/patients");
}
