import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "معرف المريض مطلوب" }, { status: 400 });
    }

    // Fetch the treatment plan for the active patient
    const plan = await prisma.treatmentPlan.findFirst({
      where: { patientId },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    console.error("[CLINICAL_TREATMENTS_GET]", error);
    return NextResponse.json({ error: "فشل في استرجاع الخطة العلاجية" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, items } = body;

    if (!patientId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "بيانات الخطة غير مكتملة" }, { status: 400 });
    }

    // Check if patient exists
    const patientExists = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patientExists) {
      return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    }

    // Upsert the treatment plan for the patient (assuming 1 active plan per patient for simplicity)
    let plan = await prisma.treatmentPlan.findFirst({
      where: { patientId, status: "IN_PROGRESS" },
    });

    if (!plan) {
      plan = await prisma.treatmentPlan.create({
        data: {
          patientId,
          status: "IN_PROGRESS",
        },
      });
    }

    // Add new items
    if (items.length > 0) {
      await prisma.treatmentItem.createMany({
        data: items.map((item: any) => ({
          treatmentPlanId: plan?.id,
          toothNumber: item.toothNumber,
          procedureName: item.procedureName,
          cost: parseFloat(item.cost),
          status: item.status || "PLANNED",
          notes: item.notes,
        })),
      });
    }

    const updatedPlan = await prisma.treatmentPlan.findUnique({
      where: { id: plan.id },
      include: { items: true },
    });

    return NextResponse.json(updatedPlan, { status: 201 });
  } catch (error) {
    console.error("[CLINICAL_TREATMENTS_POST]", error);
    return NextResponse.json({ error: "فشل في حفظ الخطة العلاجية" }, { status: 500 });
  }
}
