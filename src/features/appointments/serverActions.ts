"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Appointment, AppointmentStatus } from "./types";
import { PROCEDURE_BY_KEY } from "./constants/procedures";
import type {
  AppointmentStatus as PrismaAppointmentStatus,
  Prisma,
} from "@prisma/client";

/** Shape returned by getPatientAppointmentsWithTeethAction */
export interface AppointmentTooth {
  id: string;
  /** Universal Numbering System tooth number (1–32) */
  toothNumber: number;
  /** Machine-readable procedure key (e.g. "procedureRootCanal") */
  procedureKey: string;
  /** Arabic display label */
  procedure: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  appointmentStatus: AppointmentStatus;
}

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { clinicId: true },
  });
  if (!dbUser) throw new Error("User record not found");
  return dbUser.clinicId;
}

/**
 * Helper to get the current user's staff ID (if they are a doctor).
 */
async function getStaffId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const staff = await prisma.staff.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  return staff?.id || null;
}

// Helper to map Prisma Appointment to UI Appointment Type
function mapPrismaToUIAppointment(
  dbApt: AppointmentWithPatientName,
): Appointment {
  // Translate stored procedure key → Arabic label; fall back to raw value for old records
  const procedureLabel =
    PROCEDURE_BY_KEY[dbApt.type ?? ""]?.labelAr || dbApt.type || "";

  // Parse tooth number stored in the 'reason' column
  const rawReason = (dbApt as Record<string, unknown>).reason as
    | string
    | null
    | undefined;
  const toothNumber = rawReason
    ? parseInt(rawReason, 10) || undefined
    : undefined;

  return {
    id: dbApt.id,
    patientId: dbApt.patientId,
    patientName: dbApt.patient.fullName,
    time: dbApt.startTime, // In our DB it's a string like "10:00 ص" or HH:mm
    durationMinutes: 30, // Default if not in DB
    procedure: procedureLabel,
    toothNumber,
    status: dbApt.status as AppointmentStatus,
  };
}

export async function getAppointmentsByDateAction(
  date: Date,
): Promise<Appointment[]> {
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
          select: { fullName: true },
        },
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

export async function getAppointmentStatsAction(
  monthDate: Date,
  selectedDate: Date
): Promise<{ monthlyTotal: number; todayTotal: number }> {
  try {
    const clinicId = await getClinicId();

    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [monthlyTotal, todayTotal] = await Promise.all([
      prisma.appointment.count({
        where: {
          clinicId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.appointment.count({
        where: {
          clinicId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    return { monthlyTotal, todayTotal };
  } catch (error) {
    console.error("Error in getAppointmentStatsAction:", error);
    return { monthlyTotal: 0, todayTotal: 0 };
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
        select: { fullName: true },
      },
    },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
  return mapPrismaToUIAppointment(dbApt);
}

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  const clinicId = await getClinicId();

  // Verify ownership
  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId },
  });
  if (!existing) throw new Error("Unauthorized or not found");

  const normalizedStatus: PrismaAppointmentStatus =
    status === "IN_PROGRESS"
      ? "CONFIRMED"
      : (status as PrismaAppointmentStatus);

  const dbApt = await prisma.appointment.update({
    where: { id },
    data: { status: normalizedStatus },
    include: {
      patient: {
        select: { fullName: true },
      },
    },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/appointments/queue");
  revalidatePath("/appointments/queue");
  return mapPrismaToUIAppointment(dbApt);
}

export async function deleteAppointmentAction(id: string): Promise<void> {
  const clinicId = await getClinicId();
  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId },
  });
  if (!existing) throw new Error("Unauthorized or not found");

  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/appointments/queue");
  revalidatePath("/appointments/queue");
}

// ---------------------------------------------------------------------------
// getPatientAppointmentsWithTeethAction
// Returns all active (non-cancelled, non-no-show) appointments for a patient
// that have a tooth number stored in the `reason` column.
// Results are deduplicated per tooth — only the LATEST appointment per tooth.
// Falls back to [] on any error (never throws).
// ---------------------------------------------------------------------------
export async function getPatientAppointmentsWithTeethAction(
  patientId: string,
): Promise<AppointmentTooth[]> {
  try {
    const clinicId = await getClinicId();

    const dbApts = await prisma.appointment.findMany({
      where: {
        clinicId,
        patientId,
        reason: { not: null },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      orderBy: { date: "desc" }, // newest first → dedup keeps the latest per tooth
    });

    // Deduplicate: one entry per tooth number (keep the latest)
    const seen = new Set<number>();

    return dbApts.reduce<AppointmentTooth[]>((acc, apt) => {
      const rawReason = (apt as Record<string, unknown>).reason as
        | string
        | null;
      if (!rawReason) return acc;

      const toothNumber = parseInt(rawReason, 10);
      if (isNaN(toothNumber) || toothNumber < 1 || toothNumber > 32) return acc;
      if (seen.has(toothNumber)) return acc; // older duplicate — skip
      seen.add(toothNumber);

      const procedureKey = apt.type ?? "";
      acc.push({
        id: apt.id,
        toothNumber,
        procedureKey,
        procedure: PROCEDURE_BY_KEY[procedureKey]?.labelAr || apt.type || "",
        date:
          apt.date instanceof Date
            ? apt.date.toISOString().slice(0, 10)
            : String(apt.date).slice(0, 10),
        appointmentStatus: apt.status as AppointmentStatus,
      });
      return acc;
    }, []);
  } catch (err) {
    console.warn("[getPatientAppointmentsWithTeethAction] failed:", err);
    return [];
  }
}
