"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { StaffMember, StaffRole } from "./types";
import type { UserRole } from "@prisma/client";

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

export async function getStaffMembersAction() {
  const clinicId = await getClinicId();
  
  const staff = await prisma.staff.findMany({
    where: { clinicId },
    include: {
      user: {
        select: { role: true }
      }
    },
    orderBy: { fullName: "asc" }
  });

  return staff.map(s => ({
    id: s.id,
    fullName: s.fullName,
    role: (s.user?.role || "ASSISTANT") as StaffRole,
    specialty: s.specialty || undefined,
    certifications: s.certification ? [s.certification] : [],
    email: s.email,
    phone: s.phone,
    joinDate: s.joinDate.toISOString(),
    salary: Number(s.salary || 0),
    isActive: s.isActive,
  })) as StaffMember[];
}

export async function createStaffMemberAction(payload: Omit<StaffMember, "id">) {
  const clinicId = await getClinicId();

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true, clinicId: true },
  });

  if (existingUser && existingUser.clinicId !== clinicId) {
    throw new Error("Email already in use by another clinic");
  }

  const userId = existingUser?.id ?? crypto.randomUUID();

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role as UserRole,
        clinicId,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: payload.fullName,
        role: payload.role as UserRole,
      },
    });
  }

  const staff = await prisma.staff.create({
    data: {
      clinicId,
      userId,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      specialty: payload.specialty,
      certification: payload.certifications.join(", "),
      salary: payload.salary,
      joinDate: new Date(payload.joinDate),
      isActive: payload.isActive,
      employeeCode: `STF-${Date.now().toString().slice(-6)}`,
    },
    include: {
      user: {
        select: { role: true },
      },
    },
  });

  revalidatePath("/dashboard/staff");
  return {
    id: staff.id,
    fullName: staff.fullName,
    role: (staff.user?.role || "ASSISTANT") as StaffRole,
    specialty: staff.specialty || undefined,
    certifications: staff.certification
      ? staff.certification.split(",").map((entry) => entry.trim()).filter(Boolean)
      : [],
    email: staff.email,
    phone: staff.phone,
    joinDate: staff.joinDate.toISOString(),
    salary: Number(staff.salary || 0),
    isActive: staff.isActive,
  } as StaffMember;
}

export async function updateStaffMemberAction(id: string, payload: Partial<StaffMember>) {
  const clinicId = await getClinicId();

  const existing = await prisma.staff.findFirst({
    where: { id, clinicId },
    select: { id: true, userId: true },
  });
  if (!existing) throw new Error("Unauthorized or not found");

  const data: {
    fullName?: string;
    email?: string;
    phone?: string;
    specialty?: string;
    certification?: string;
    salary?: number;
    isActive?: boolean;
  } = {};
  if (payload.fullName) data.fullName = payload.fullName;
  if (payload.email) data.email = payload.email;
  if (payload.phone) data.phone = payload.phone;
  if (payload.specialty) data.specialty = payload.specialty;
  if (payload.certifications) data.certification = payload.certifications.join(", ");
  if (payload.salary !== undefined) data.salary = payload.salary;
  if (payload.isActive !== undefined) data.isActive = payload.isActive;

  if (existing.userId && (payload.fullName || payload.role || payload.email)) {
    await prisma.user.update({
      where: { id: existing.userId },
      data: {
        ...(payload.fullName ? { fullName: payload.fullName } : {}),
        ...(payload.role ? { role: payload.role as UserRole } : {}),
        ...(payload.email ? { email: payload.email } : {}),
      },
    });
  }

  const staff = await prisma.staff.update({
    where: { id },
    data,
    include: {
      user: {
        select: { role: true },
      },
    },
  });

  revalidatePath("/dashboard/staff");
  return {
    id: staff.id,
    fullName: staff.fullName,
    role: (staff.user?.role || "ASSISTANT") as StaffRole,
    specialty: staff.specialty || undefined,
    certifications: staff.certification
      ? staff.certification.split(",").map((entry) => entry.trim()).filter(Boolean)
      : [],
    email: staff.email,
    phone: staff.phone,
    joinDate: staff.joinDate.toISOString(),
    salary: Number(staff.salary || 0),
    isActive: staff.isActive,
  } as StaffMember;
}

export async function deleteStaffMemberAction(id: string) {
  const clinicId = await getClinicId();

  const existing = await prisma.staff.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) throw new Error("Unauthorized or not found");

  await prisma.staff.delete({
    where: { id },
  });

  revalidatePath("/dashboard/staff");
}
