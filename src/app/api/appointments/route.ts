import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get("date"); // YYYY-MM-DD
    
    let whereClause = {};
    if (dateQuery) {
      // Find appointments spanning that selected day
      const startOfDay = new Date(dateQuery);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateQuery);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        startTime: "asc", // using HH:mm string for ordering is fine
      },
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("[APPOINTMENTS_GET]", error);
    return NextResponse.json({ error: "فشل في استرجاع الحجوزات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { patientId, doctorId, date, startTime, duration, type, notes } = body;

    // Check availability (Mocking logic mostly, handled by UI, but good for backend integrity)
    if (!patientId || !date || !startTime || !duration || !type) {
      return NextResponse.json({ error: "بيانات الحجز غير مكتملة" }, { status: 400 });
    }

    // Ensure the patient exists
    const patientExists = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patientExists) {
      return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId || undefined,
        date: new Date(date),
        startTime: startTime,
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json({ error: "يوجد حجز آخر في نفس الموعد" }, { status: 409 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: new Date(date),
        startTime,
        duration: parseInt(duration, 10),
        type,
        notes,
        status: "CONFIRMED", // Default for new bookings if approved
      },
      include: {
        patient: true
      }
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("[APPOINTMENTS_POST]", error);
    return NextResponse.json({ error: "فشل في تسجيل الحجز" }, { status: 500 });
  }
}
