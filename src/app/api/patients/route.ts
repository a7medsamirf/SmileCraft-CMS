import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// We use Zod for validation later, but for now we expect JSON from the frontend service

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    const patients = await prisma.patient.findMany({
      where: query
        ? {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients, { status: 200 });
  } catch (error) {
    console.error("[PATIENTS_GET]", error);
    return NextResponse.json({ error: "فشل في استرجاع بيانات المرضى" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic required fields (in real code, use Zod schema validation)
    const { firstName, lastName, phone, dateOfBirth, city, address, bloodGroup, medicalAlerts, allergies } = body;

    if (!firstName || !lastName || !phone || !dateOfBirth) {
      return NextResponse.json({ error: "البيانات الأساسية مطلوبة (الاسم وتاريخ الميلاد ورقم الهاتف)" }, { status: 400 });
    }

    const newPatient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        city,
        address,
        bloodGroup,
        medicalAlerts,
        allergies: allergies || [],
      },
    });

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("[PATIENTS_POST]", error);
    return NextResponse.json({ error: "فشل في تسجيل مريض جديد" }, { status: 500 });
  }
}
