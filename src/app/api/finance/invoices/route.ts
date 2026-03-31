import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // 'daily' | 'monthly' | 'all'

    // Simple get all invoices with patient details. We can filter further on frontend or here
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("[INVOICES_GET]", error);
    return NextResponse.json({ error: "فشل في استرجاع بيانات الفواتير" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { patientId, amount, status, paymentMethod } = body;

    if (!patientId || amount === undefined) {
      return NextResponse.json({ error: "بيانات الفاتورة غير مكتملة" }, { status: 400 });
    }

    const patientExists = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patientExists) {
      return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        patientId,
        amount: parseFloat(amount),
        status: status || "PENDING",
        paymentMethod: paymentMethod || null,
        paidAt: status === "PAID" ? new Date() : null,
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("[INVOICES_POST]", error);
    return NextResponse.json({ error: "فشل في إنشاء سلسلة الفاتورة" }, { status: 500 });
  }
}
