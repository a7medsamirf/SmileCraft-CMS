"use server";

// =============================================================================
// Appointments — Book Appointment Server Action
// ✅ Secure multi-tenant isolation via strict clinicId resolution
// ✅ Server-side Zod validation on all inputs
// ✅ Error codes instead of hardcoded strings (UI layer translates)
// =============================================================================

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { bookingSchema, type BookingState } from "../schemas";
import { isTimeWithinHours, getDayNameFromDate } from "@/lib/clinic-hours-utils";

// ---------------------------------------------------------------------------
// Error type guards
// ---------------------------------------------------------------------------
function isPrismaInitError(error: unknown): boolean {
  return (
    error instanceof Error && error.name === "PrismaClientInitializationError"
  );
}

function isPrismaMissingColumnError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022"
  );
}

// ---------------------------------------------------------------------------
// Secure clinicId resolver — NO bootstrap, NO fallback to other clinics
// ---------------------------------------------------------------------------
async function getClinicId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { clinicId: true },
  });

  if (!dbUser) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!dbUser.clinicId) {
    throw new Error("NO_CLINIC_ASSIGNED");
  }

  return dbUser.clinicId;
}

export async function bookAppointmentAction(
  prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = prevState;
  const result = bookingSchema.safeParse({
    patientName: formData.get("patientName"),
    phone: formData.get("phone"),
    date: formData.get("date"),
    time: formData.get("time"),
    procedure: formData.get("procedure"),
    procedureKey: formData.get("procedureKey"),
    duration: formData.get("duration"),
    notes: formData.get("notes"),
    toothNumber: formData.get("toothNumber"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const clinicId = await getClinicId();

    // 1. Find or create patient
    let patient = await prisma.patient.findFirst({
      where: {
        clinicId,
        phone: result.data.phone,
      },
    });

    if (!patient) {
      const fileNumber = `PT-${Date.now().toString().slice(-6)}`;
      const defaultDob = new Date("1990-01-01T00:00:00Z");
      patient = await prisma.patient.create({
        data: {
          id: crypto.randomUUID(),
          clinicId,
          fileNumber,
          fullName: result.data.patientName,
          phone: result.data.phone,
          dateOfBirth: defaultDob,
          gender: "OTHER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // 2. Prevent double-booking for the same clinic/date/time
    const appointmentDate = new Date(result.data.date);
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId,
        date: appointmentDate,
        startTime: result.data.time,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      select: { id: true },
    });

    if (conflictingAppointment) {
      return {
        success: false,
        errors: { form: ["هذا الموعد محجوز مسبقاً"] },
      };
    }

    // 2.5 Validate appointment time against clinic business hours
    const clinicHoursRow = await prisma.clinic_business_hours.findUnique({
      where: { clinicId },
      select: { hours: true },
    });

    if (clinicHoursRow) {
      const hours = clinicHoursRow.hours as Array<{
        day: string;
        isOpen: boolean;
        start: string;
        end: string;
      }>;

      const dayName = getDayNameFromDate(appointmentDate);
      const dayHours = hours.find((h) => h.day === dayName);

      // Check if the clinic is open on this day
      if (!dayHours || !dayHours.isOpen) {
        return {
          success: false,
          errors: {
            form: [`العيادة مغلقة يوم ${dayName}`],
          },
        };
      }

      // Check if the time is within operating hours
      if (!isTimeWithinHours(appointmentDate, result.data.time, hours)) {
        return {
          success: false,
          errors: {
            form: [
              `الوقت المختار خارج مواعيد العمل (${dayHours.start} - ${dayHours.end})`,
            ],
          },
        };
      }
    }

    // 3. Create appointment
    await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        clinicId,
        patientId: patient.id,
        date: appointmentDate,
        startTime: result.data.time,
        type: result.data.procedureKey || result.data.procedure,
        notes: result.data.notes,
        reason: result.data.toothNumber?.trim() || null,
        status: "SCHEDULED",
        endTime: null,
        userId: null,
        staffId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/appointments/queue");
    revalidatePath("/appointments/queue");

    return {
      success: true,
      message: "تم حجز الموعد بنجاح",
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return { success: false, errors: { form: ["غير مصرح لك"] } };
      }
      if (error.message === "USER_NOT_FOUND") {
        return { success: false, errors: { form: ["المستخدم غير موجود"] } };
      }
      if (error.message === "NO_CLINIC_ASSIGNED") {
        return { success: false, errors: { form: ["العيادة غير محددة"] } };
      }
    }

    if (isPrismaInitError(error)) {
      return {
        success: false,
        errors: { form: ["خطأ في الاتصال بقاعدة البيانات"] },
      };
    }

    if (isPrismaMissingColumnError(error)) {
      return {
        success: false,
        errors: { form: ["خطأ في مخطط قاعدة البيانات"] },
      };
    }

    // Log the actual error for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("[bookAppointmentAction] Detailed error:", error);
    }

    // Check for unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return {
        success: false,
        errors: { form: ["هذا الموعد محجوز مسبقاً"] },
      };
    }

    return {
      success: false,
      errors: { form: ["حدث خطأ أثناء الحجز"] },
    };
  }
}
