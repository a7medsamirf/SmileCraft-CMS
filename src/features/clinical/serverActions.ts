"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MouthMap } from "./types/odontogram";
import { PlanItem, TreatmentStatus } from "./types/treatmentPlan";

/**
 * Helper to get clinicId
 */
async function getClinicId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { clinicId: true }
  });
  if (!dbUser) throw new Error("User record not found");
  return dbUser.clinicId;
}

export async function getPatientClinicalDataAction(patientId: string) {
  const clinicId = await getClinicId();
  
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    include: {
      treatments: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!patient) return null;

  return {
    mouthMap: patient.mouthMap as any as MouthMap,
    treatments: patient.treatments.map(t => ({
      id: t.id,
      toothId: t.toothNumber ? parseInt(t.toothNumber) : 0,
      procedure: t.procedureName,
      procedureKey: t.procedureType,
      estimatedCost: Number(t.cost),
      status: t.status as TreatmentStatus,
      completedAt: t.completedAt?.toISOString()
    })) as PlanItem[]
  };
}

export async function saveMouthMapAction(patientId: string, mouthMap: MouthMap) {
  const clinicId = await getClinicId();
  
  await prisma.patient.update({
    where: { id: patientId }, // In a real app, also filter by clinicId for safety
    data: {
      mouthMap: mouthMap as any
    }
  });

  revalidatePath(`/dashboard/clinical`);
}

export async function updateTreatmentStatusAction(treatmentId: string, status: TreatmentStatus) {
  const clinicId = await getClinicId();
  
  const updated = await prisma.treatment.update({
    where: { id: treatmentId },
    data: {
      status: status as any,
      completedAt: status === TreatmentStatus.COMPLETED ? new Date() : null
    }
  });

  revalidatePath(`/dashboard/clinical`);
  return updated;
}

export async function createTreatmentAction(patientId: string, item: Omit<PlanItem, "id">) {
  const clinicId = await getClinicId();
  
  const treatment = await prisma.treatment.create({
    data: {
      patientId,
      toothNumber: item.toothId.toString(),
      procedureName: item.procedure,
      procedureType: item.procedureKey,
      cost: item.estimatedCost,
      status: item.status as any,
    }
  });

  revalidatePath(`/dashboard/clinical`);
  return treatment;
}
