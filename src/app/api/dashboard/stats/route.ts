import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Today's Appointments
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 2. New Patients This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // 3. Pending Treatment Plans
    const pendingPlans = await prisma.treatmentPlan.count({
      where: {
        status: "IN_PROGRESS",
      },
    });

    // 4. Total Revenue (simplistic calculation based on Paid invoices)
    const paidInvoices = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "PAID",
      },
    });
    const totalRevenue = paidInvoices._sum.amount || 0;

    return NextResponse.json(
      {
        todaysAppointments,
        newPatients,
        pendingPlans,
        totalRevenue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return NextResponse.json({ error: "فشل في استرجاع إحصائيات لوحة التحكم" }, { status: 500 });
  }
}
