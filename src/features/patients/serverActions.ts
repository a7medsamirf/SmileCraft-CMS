"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

/**
 * Helper to get the current user's clinic ID.
 * All DB operations must be scoped to the clinic.
 */
async function getClinicId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Find the user in our DB to get their clinicId
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { clinicId: true }
  });
  
  if (!dbUser) throw new Error("User record not found");
  return dbUser.clinicId;
}

// Helper function to map Prisma Patient to UI Patient Type
function mapPrismaToUIPatient(dbPatient: any): Patient {
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
      conditions: dbPatient.medicalHistory?.map((mh: any) => ({
        condition: mh.condition,
        isActive: true, // We can refine this later
        severity: mh.severity.toLowerCase(),
        notes: mh.notes || undefined
      })) || [],
      allergies: dbPatient.allergies ? dbPatient.allergies.split(",").map((a: string) => a.trim()) : [],
      currentMedications: [], // Need to decide where to store this
      bloodGroup: (dbPatient.bloodGroup as BloodGroup) || BloodGroup.UNKNOWN,
      generalNotes: dbPatient.notes || undefined,
      previousDentalHistory: [],
    },
    emergencyContact: undefined, // Need to decide where to store this
    status: dbPatient.isActive ? PatientStatus.ACTIVE : PatientStatus.INACTIVE,
    nationalId: undefined, // Need to decide where to store this
    createdAt: dbPatient.createdAt.toISOString() as ISODateTimeString,
    updatedAt: dbPatient.updatedAt.toISOString() as ISODateTimeString,
    visits: [],
  };
}

export async function getPatientsAction(
  filters: PatientFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedPatients> {
  try {
    const clinicId = await getClinicId();
    const whereClause: any = { clinicId };

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

    const [dbPatients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        include: {
          medicalHistory: true
        },
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
  try {
    const clinicId = await getClinicId();
    const dbPatient = await prisma.patient.findFirst({
      where: { id, clinicId },
      include: {
        medicalHistory: true
      }
    });

    if (!dbPatient) return null;
    return mapPrismaToUIPatient(dbPatient);
  } catch (error) {
    console.error("Error in getPatientByIdAction:", error);
    return null;
  }
}

export async function createPatientActionDB(payload: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
  const clinicId = await getClinicId();
  
  // Generate a file number based on current time
  const fileNumber = `PT-${Date.now().toString().slice(-6)}`;
  
  const dbPatient = await prisma.patient.create({
    data: {
      clinicId,
      fileNumber,
      fullName: payload.fullName,
      nationalId: payload.nationalId,
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
      allergies: payload.medicalHistory.allergies.join(", "),
      medicalHistory: {
        create: payload.medicalHistory.conditions.map(c => ({
          condition: c.condition,
          severity: (c.severity?.toUpperCase() as any) || "LOW",
          notes: c.notes
        }))
      }
    },
    include: {
      medicalHistory: true
    }
  });

  revalidatePath("/dashboard/patients");
  return mapPrismaToUIPatient(dbPatient);
}

export async function updatePatientActionDB(id: string, payload: Partial<Patient>): Promise<Patient> {
  const clinicId = await getClinicId();
  
  const existing = await prisma.patient.findFirst({ 
    where: { id, clinicId } 
  });
  if (!existing) throw new Error("Patient not found");

  const updateData: any = {};

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
  if (payload.medicalHistory?.allergies) updateData.allergies = payload.medicalHistory.allergies.join(", ");

  // Handle medical history updates separately if needed
  if (payload.medicalHistory?.conditions) {
    // For simplicity, we'll replace the history. In production, you might want to sync.
    await prisma.medicalHistory.deleteMany({ where: { patientId: id } });
    updateData.medicalHistory = {
      create: payload.medicalHistory.conditions.map(c => ({
        condition: c.condition,
        severity: (c.severity?.toUpperCase() as any) || "LOW",
        notes: c.notes
      }))
    };
  }

  const dbPatient = await prisma.patient.update({
    where: { id },
    data: updateData,
    include: {
      medicalHistory: true
    }
  });

  revalidatePath("/dashboard/patients");
  revalidatePath(`/dashboard/patients/${id}`);
  return mapPrismaToUIPatient(dbPatient);
}

export async function deletePatientAction(id: string): Promise<void> {
  const clinicId = await getClinicId();
  
  // Verify ownership before delete
  const existing = await prisma.patient.findFirst({ where: { id, clinicId } });
  if (!existing) throw new Error("Unauthorized or not found");

  await prisma.patient.delete({
    where: { id },
  });
  revalidatePath("/dashboard/patients");
}
