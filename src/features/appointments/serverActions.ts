"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Appointment, AppointmentStatus } from "./types";
import type { AppointmentStatus as PrismaAppointmentStatus, Prisma } from "@prisma/client";

type AppointmentWithPatientName = Prisma.AppointmentGetPayload<{
  include: {
    patient: {
      select: { fullName: true };
    };
  };
}>;

/**
 * Helper to get the current user's clinic ID.
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

/**
 * Helper to get the current user's staff ID (if they are a doctor).
 */
async function getStaffId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const staff = await prisma.staff.findUnique({
    where: { userId: user.id },
    select: { id: true }
  });
  return staff?.id || null;
}

// Helper to map Prisma Appointment to UI Appointment Type
function mapPrismaToUIAppointment(dbApt: AppointmentWithPatientName): Appointment {
  return {
    id: dbApt.id,
    patientId: dbApt.patientId,
    patientName: dbApt.patient.fullName,
    time: dbApt.startTime, // In our DB it's a string like "10:00 ص" or HH:mm
    durationMinutes: 30, // Default if not in DB
    procedure: dbApt.type || "",
    status: dbApt.status as AppointmentStatus,
  };
}

export async function getAppointmentsByDateAction(date: Date): Promise<Appointment[]> {
  try {
    const clinicId = await getClinicId();
    
    // Create date range for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dbAppointments = await prisma.appointment.findMany({
      where: {
        clinicId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        patient: {
          select: { fullName: true }
        }
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return dbAppointments.map(mapPrismaToUIAppointment);
  } catch (error) {
    console.error("Error in getAppointmentsByDateAction:", error);
    return [];
  }
}

export async function createAppointmentActionDB(payload: {
  patientId: string;
  date: Date;
  startTime: string;
  type: string;
  notes?: string;
}): Promise<Appointment> {
  const clinicId = await getClinicId();
  const staffId = await getStaffId();

  const dbApt = await prisma.appointment.create({
    data: {
      clinicId,
      patientId: payload.patientId,
      staffId: staffId, // Optional: assigned to the current doctor
      date: payload.date,
      startTime: payload.startTime,
      type: payload.type,
      notes: payload.notes,
      status: "SCHEDULED",
    },
    include: {
      patient: {
        select: { fullName: true }
      }
    }
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
  return mapPrismaToUIAppointment(dbApt);
}

export async function updateAppointmentStatusAction(id: string, status: AppointmentStatus): Promise<Appointment> {
  const clinicId = await getClinicId();
  
  // Verify ownership
  const existing = await prisma.appointment.findFirst({ where: { id, clinicId } });
  if (!existing) throw new Error("Unauthorized or not found");

  const normalizedStatus: PrismaAppointmentStatus =
    status === "IN_PROGRESS" ? "CONFIRMED" : (status as PrismaAppointmentStatus);

  const dbApt = await prisma.appointment.update({
    where: { id },
    data: { status: normalizedStatus },
    include: {
      patient: {
        select: { fullName: true }
      }
    }
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/appointments/queue");
  revalidatePath("/appointments/queue");
  return mapPrismaToUIAppointment(dbApt);
}

export async function deleteAppointmentAction(id: string): Promise<void> {
  const clinicId = await getClinicId();
  const existing = await prisma.appointment.findFirst({ where: { id, clinicId } });
  if (!existing) throw new Error("Unauthorized or not found");

  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/appointments/queue");
  revalidatePath("/appointments/queue");
}
