"use server";

// =============================================================================
// Appointments — Book Appointment Server Action
// =============================================================================

import { z } from "zod";

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
    // Simulate server delay
    await new Promise((r) => setTimeout(r, 800));

    // In production: save to DB via Prisma
    // await prisma.appointment.create({ data: result.data });

    return {
      success: true,
      message: "تم حجز الموعد بنجاح!",
    };
  } catch {
    return {
      success: false,
      errors: { form: ["حدث خطأ أثناء حجز الموعد. حاول مرة أخرى."] },
    };
  }
}
