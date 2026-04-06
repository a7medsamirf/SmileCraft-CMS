"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { InvoiceStatus, PaymentMethod } from "./types";

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
  
  const where: any = {};
  if (patientId) where.patientId = patientId;
  // In a real app, patients belong to clinics, so invoices do too.
  // Our schema has clinicId on Patient but not directly on Invoice.
  // We should fetch via patient to ensure clinic scoping.
  
  const invoices = await prisma.invoice.findMany({
    where: {
      patient: {
        clinicId
      },
      ...where
    },
    include: {
      patient: {
        select: { fullName: true }
      },
      payments: true
    },
    orderBy: { createdAt: "desc" }
  });

  return invoices.map(inv => ({
    id: apt.id,
    patientId: inv.patientId,
    patientName: inv.patient.fullName,
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
  
  // 1. Verify invoice belongs to clinic
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: payload.invoiceId,
      patient: { clinicId }
    }
  });

  if (!invoice) throw new Error("Invoice not found");

  // 2. Create payment and update invoice in a transaction
  const [payment, updatedInvoice] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        patientId: invoice.patientId, // Required by schema
        amount: payload.amount,
        method: payload.method as any,
        notes: payload.notes,
        // We need to link payment to invoice, but schema doesn't have invoiceId on Payment.
        // Wait, schema has patientId on Payment but no invoiceId. 
        // Let's check schema again.
      }
    }),
    prisma.invoice.update({
      where: { id: payload.invoiceId },
      data: {
        paidAmount: {
          increment: payload.amount
        }
      }
    })
  ]);

  // 3. Update invoice status based on new balance
  const totalPaid = Number(updatedInvoice.paidAmount);
  const totalAmount = Number(updatedInvoice.totalAmount);
  let newStatus: InvoiceStatus = InvoiceStatus.PARTIAL;
  if (totalPaid >= totalAmount) newStatus = InvoiceStatus.PAID;
  if (totalPaid === 0) newStatus = InvoiceStatus.UNPAID;

  await prisma.invoice.update({
    where: { id: payload.invoiceId },
    data: { status: newStatus as any }
  });

  revalidatePath("/dashboard/finance");
  return payment;
}

export async function getFinanceStatsAction() {
  const clinicId = await getClinicId();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dailyRevenue, totalOutstanding] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        patient: { clinicId },
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    }),
    prisma.invoice.aggregate({
      where: {
        patient: { clinicId },
        status: { not: "PAID" }
      },
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    })
  ]);

  return {
    dailyRevenue: Number(dailyRevenue._sum.amount || 0),
    totalOutstanding: Number(totalOutstanding._sum.totalAmount || 0) - Number(totalOutstanding._sum.paidAmount || 0)
  };
}
