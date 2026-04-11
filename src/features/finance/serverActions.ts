"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { InvoiceStatus, PaymentMethod, PaymentType } from "./types";
import { z } from "zod";

// Validation schemas
const paymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID format"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  method: z.enum(["CASH", "CARD", "WALLET", "BANK_TRANSFER", "INSURANCE"]),
  notes: z.string().max(500).optional(),
});

const invoiceFromCaseSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  amount: z.number().positive("Invoice amount must be greater than 0"),
  procedure: z.string().min(1, "Procedure is required"),
  notes: z.string().max(1000).optional(),
});

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

export async function getInvoicesAction(patientId?: string) {
  const clinicId = await getClinicId();

  const where: { patientId?: string; patients?: { clinicId: string } } = {};
  if (patientId) where.patientId = patientId;
  
  // Ensure clinic scoping
  where.patients = { clinicId };

  const invoices = await prisma.invoice.findMany({
    where: where as any,
    include: {
      patients: {
        select: { fullName: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return invoices.map(inv => ({
    id: inv.id,
    patientId: inv.patientId,
    patientName: inv.patients.fullName,
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    balance: Number(inv.totalAmount) - Number(inv.paidAmount),
    status: inv.status as InvoiceStatus,
    createdAt: inv.createdAt.toISOString()
  }));
}

export async function createPaymentAction(payload: {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}) {
  const clinicId = await getClinicId();

  // Server-side validation
  const validation = paymentSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(`Invalid payment data: ${validation.error.flatten().formErrors.join(", ")}`);
  }

  // 1. Verify invoice belongs to clinic
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: payload.invoiceId,
      patients: { clinicId }
    }
  });

  if (!invoice) throw new Error("Invoice not found");

  // 2. Create payment and update invoice in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        id: crypto.randomUUID(),
        patientId: invoice.patientId,
        amount: payload.amount,
        method: payload.method as PaymentMethod,
        type: PaymentType.PAYMENT,
        notes: payload.notes,
        reference: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    const updatedInvoice = await tx.invoice.update({
      where: { id: payload.invoiceId },
      data: {
        paidAmount: {
          increment: payload.amount
        }
      }
    });

    // 3. Update invoice status based on new balance
    const totalPaid = Number(updatedInvoice.paidAmount);
    const totalAmount = Number(updatedInvoice.totalAmount);
    let newStatus: InvoiceStatus = InvoiceStatus.PARTIAL;
    if (totalPaid >= totalAmount) newStatus = InvoiceStatus.PAID;
    if (totalPaid === 0) newStatus = InvoiceStatus.DRAFT;

    const finalInvoice = await tx.invoice.update({
      where: { id: payload.invoiceId },
      data: { status: newStatus }
    });

    return { payment, invoice: finalInvoice };
  });

  revalidatePath("/dashboard/finance");
  return result.payment;
}

export async function getFinanceStatsAction() {
  const clinicId = await getClinicId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [dailyRevenue, totalOutstanding, monthlyStats] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        patients: { clinicId },
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    }),
    prisma.invoice.aggregate({
      where: {
        patients: { clinicId },
        status: { not: "PAID" }
      },
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    }),
    // Monthly revenue stats
    prisma.invoice.aggregate({
      where: {
        patients: { clinicId },
        createdAt: { gte: startOfMonth }
      },
      _sum: {
        totalAmount: true,
        paidAmount: true
      },
      _count: true
    })
  ]);

  // Get previous month for comparison
  const prevMonthStart = new Date(startOfMonth);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  
  const prevMonthStats = await prisma.invoice.aggregate({
    where: {
      patients: { clinicId },
      createdAt: {
        gte: prevMonthStart,
        lt: startOfMonth
      }
    },
    _sum: {
      totalAmount: true
    }
  });

  const monthlyTotal = Number(monthlyStats._sum.totalAmount || 0);
  const prevMonthlyTotal = Number(prevMonthStats._sum.totalAmount || 0);
  const growthPercentage = prevMonthlyTotal > 0 
    ? ((monthlyTotal - prevMonthlyTotal) / prevMonthlyTotal) * 100 
    : 0;

  const monthlyPaid = Number(monthlyStats._sum.paidAmount || 0);
  const averageVisit = monthlyStats._count > 0 ? monthlyPaid / monthlyStats._count : 0;

  return {
    dailyRevenue: Number(dailyRevenue._sum.amount || 0),
    totalOutstanding: Number(totalOutstanding._sum.totalAmount || 0) - Number(totalOutstanding._sum.paidAmount || 0),
    monthlyTotal,
    monthlyPaid,
    monthlyInvoiceCount: monthlyStats._count,
    growthPercentage: Math.round(growthPercentage * 100) / 100,
    averageVisit: Math.round(averageVisit * 100) / 100
  };
}

export async function createInvoiceFromCaseAction(payload: {
  patientId: string;
  amount: number;
  procedure: string;
  notes?: string;
}) {
  const clinicId = await getClinicId();

  // Server-side validation
  const validation = invoiceFromCaseSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(`Invalid invoice data: ${validation.error.flatten().formErrors.join(", ")}`);
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        id: crypto.randomUUID(),
        patientId: payload.patientId,
        invoiceNumber: `INV-${Date.now()}`,
        totalAmount: payload.amount,
        paidAmount: 0,
        status: "DRAFT",
        notes: payload.notes || `Generated from procedure: ${payload.procedure}`,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
    });

    // Create invoice items separately
    await prisma.invoice_items.create({
      data: {
        id: crypto.randomUUID(),
        invoiceId: invoice.id,
        description: payload.procedure,
        unitPrice: payload.amount,
        total: payload.amount,
        quantity: 1,
        treatmentId: null,
      }
    });

    revalidatePath("/dashboard/finance");
    revalidatePath("/dashboard/clinical");

    return { success: true, invoiceId: invoice.id };
  } catch (err) {
    throw new Error(`Failed to create invoice: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}

export async function getMonthlyRevenueDataAction() {
  const clinicId = await getClinicId();

  const now = new Date();
  const months = [];
  
  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    });
  }

  const revenueData = await Promise.all(
    months.map(async (month) => {
      const result = await prisma.invoice.aggregate({
        where: {
          patients: { clinicId },
          createdAt: {
            gte: month.start,
            lt: month.end
          },
          status: {
            not: 'CANCELLED'
          }
        },
        _sum: {
          paidAmount: true,
          totalAmount: true
        },
        _count: true
      });

      return {
        month: month.label,
        revenue: Number(result._sum.paidAmount || 0),
        totalInvoiced: Number(result._sum.totalAmount || 0),
        invoiceCount: result._count
      };
    })
  );

  return revenueData;
}

export async function getTopProceduresAction() {
  const clinicId = await getClinicId();

  // Get all invoice items with their treatments
  const invoiceItems = await prisma.invoice_items.findMany({
    where: {
      invoices: {
        patients: { clinicId }
      },
      treatmentId: {
        not: null
      }
    },
    include: {
      treatments: {
        select: {
          procedureName: true,
          procedureType: true
        }
      }
    },
    orderBy: {
      total: 'desc'
    },
    take: 100
  });

  // Aggregate by procedure type
  const procedureMap = new Map<string, { name: string, count: number, revenue: number }>();

  for (const item of invoiceItems) {
    if (!item.treatments) continue;

    const key = item.treatments.procedureType;
    const existing = procedureMap.get(key);

    if (existing) {
      existing.count += 1;
      existing.revenue += Number(item.total);
    } else {
      procedureMap.set(key, {
        name: item.treatments.procedureName,
        count: 1,
        revenue: Number(item.total)
      });
    }
  }

  // Convert to array and sort by revenue
  const topProcedures = Array.from(procedureMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return topProcedures;
}

export async function getWeeklyRevenueDataAction() {
  const clinicId = await getClinicId();

  const now = new Date();
  const days = [];

  // Get last 7 days (including today)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayName = date.toLocaleDateString('ar-EG', { weekday: 'short' });
    
    days.push({
      start: date,
      end: nextDate,
      label: dayName,
      date: date.toISOString()
    });
  }

  const revenueData = await Promise.all(
    days.map(async (day) => {
      const result = await prisma.payment.aggregate({
        where: {
          patients: { clinicId },
          createdAt: {
            gte: day.start,
            lt: day.end
          },
          type: 'PAYMENT'
        },
        _sum: {
          amount: true
        },
        _count: true
      });

      return {
        day: day.label,
        date: day.date,
        revenue: Number(result._sum.amount || 0),
        transactionCount: result._count
      };
    })
  );

  // Calculate previous week's total for growth percentage
  const prevWeekStart = new Date(now);
  prevWeekStart.setDate(prevWeekStart.getDate() - 13);
  prevWeekStart.setHours(0, 0, 0, 0);
  
  const prevWeekEnd = new Date(prevWeekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() + 7);

  const prevWeekStats = await prisma.payment.aggregate({
    where: {
      patients: { clinicId },
      createdAt: {
        gte: prevWeekStart,
        lt: prevWeekEnd
      },
      type: 'PAYMENT'
    },
    _sum: {
      amount: true
    }
  });

  const currentWeekTotal = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const prevWeekTotal = Number(prevWeekStats._sum.amount || 0);
  const growthPercentage = prevWeekTotal > 0
    ? ((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100
    : 0;

  return {
    days: revenueData,
    totalWeekly: currentWeekTotal,
    growthPercentage: Math.round(growthPercentage * 100) / 100
  };
}
