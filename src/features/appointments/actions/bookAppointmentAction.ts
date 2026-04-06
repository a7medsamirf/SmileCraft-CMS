"use server";

// =============================================================================
// Appointments — Book Appointment Server Action
// =============================================================================

import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const bookingSchema = z.object({
  patientName: z.string().min(1, "اسم المريض مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  time: z.string().min(1, "الوقت مطلوب"),
  procedure: z.string().min(1, "نوع الإجراء مطلوب"),
  duration: z.string().min(1, "المدة مطلوبة"),
  notes: z.string().optional(),
});

export type BookingState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

function isPrismaInitError(error: unknown): boolean {
  return error instanceof Error && error.name === "PrismaClientInitializationError";
}

function isPrismaMissingColumnError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022";
}

async function getClinicId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  console.log("[bookAppointmentAction] auth user", { id: user.id, email: user.email });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { clinicId: true },
  });
  if (dbUser) {
    console.log("[bookAppointmentAction] existing db user found", { clinicId: dbUser.clinicId });
    return dbUser.clinicId;
  }

  // Bootstrap auth users that were created in Supabase but not yet mirrored in Prisma.
  let clinic = await prisma.clinic.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: { name: "SmileCraft Clinic" },
      select: { id: true },
    });
  }

  const metadata = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const fullName =
    metadata.full_name?.trim() ||
    metadata.name?.trim() ||
    user.email?.split("@")[0] ||
    "New User";

  const safeEmail = user.email ?? `${user.id}@smilecraft.local`;

  await prisma.user.upsert({
    where: { id: user.id },
    update: { clinicId: clinic.id },
    create: {
      id: user.id,
      email: safeEmail,
      fullName,
      clinicId: clinic.id,
    },
  });

  console.log("[bookAppointmentAction] bootstrapped db user", { clinicId: clinic.id, userId: user.id });
  return clinic.id;
}

export async function bookAppointmentAction(
  prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const result = bookingSchema.safeParse({
    patientName: formData.get("patientName"),
    phone: formData.get("phone"),
    date: formData.get("date"),
    time: formData.get("time"),
    procedure: formData.get("procedure"),
    duration: formData.get("duration"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const clinicId = await getClinicId();
    console.log("[bookAppointmentAction] booking payload", {
      clinicId,
      phone: result.data.phone,
      patientName: result.data.patientName,
      date: result.data.date,
      time: result.data.time,
      procedure: result.data.procedure,
    });
    
    // 1. Find or create patient
    let patient = await prisma.patient.findFirst({
      where: {
        clinicId,
        phone: result.data.phone
      }
    });

    if (!patient) {
      const fileNumber = `PT-${Date.now().toString().slice(-6)}`;
      console.log("[bookAppointmentAction] patient not found, creating", { fileNumber });
      patient = await prisma.patient.create({
        data: {
          clinicId,
          fileNumber,
          fullName: result.data.patientName,
          phone: result.data.phone,
          dateOfBirth: new Date(), // Placeholder for quick booking
          gender: "MALE", // Placeholder
        }
      });
      console.log("[bookAppointmentAction] patient created", { patientId: patient.id });
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
      console.warn("[bookAppointmentAction] time slot conflict", {
        clinicId,
        date: result.data.date,
        time: result.data.time,
        conflictingAppointmentId: conflictingAppointment.id,
      });
      return {
        success: false,
        errors: {
          form: ["هذا الموعد محجوز بالفعل في نفس الساعة. اختر وقتًا آخر."],
        },
      };
    }

    // 3. Create appointment
    await prisma.appointment.create({
      data: {
        clinicId,
        patientId: patient.id,
        date: appointmentDate,
        startTime: result.data.time,
        // Calculate optional end time based on duration (assuming duration is in mins)
        // For now, mapping procedure to type/reason
        type: result.data.procedure,
        notes: result.data.notes,
        status: "SCHEDULED",
      }
    });
    console.log("[bookAppointmentAction] appointment created", { patientId: patient.id, clinicId });

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/appointments/queue");
    revalidatePath("/appointments/queue");

    return {
      success: true,
      message: "تم حجز الموعد بنجاح!",
    };
  } catch (error) {
    console.error("Booking error:", error);

    if (isPrismaInitError(error)) {
      return {
        success: false,
        errors: {
          form: [
            "تعذر الاتصال بقاعدة البيانات. تحقق من DATABASE_URL / DIRECT_URL في ملف .env ثم أعد تشغيل السيرفر.",
          ],
        },
      };
    }

    if (isPrismaMissingColumnError(error)) {
      console.error("[bookAppointmentAction] schema mismatch (P2022)", {
        code: error.code,
        meta: error.meta,
      });
      return {
        success: false,
        errors: {
          form: [
            "هيكل قاعدة البيانات غير متوافق مع Prisma schema (عمود مفقود). شغّل migrations ثم أعد تشغيل السيرفر.",
          ],
        },
      };
    }

    return {
      success: false,
      errors: { form: ["حدث خطأ أثناء حجز الموعد. حاول مرة أخرى."] },
    };
  }
}
