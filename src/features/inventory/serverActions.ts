"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { InventoryItem, InventoryCategory } from "./types";

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

export async function getInventoryItemsAction() {
  const clinicId = await getClinicId();
  
  const items = await prisma.inventoryItem.findMany({
    where: { clinicId },
    orderBy: { name: "asc" }
  });

  return items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category as InventoryCategory,
    quantity: item.quantity,
    minQuantity: item.minStock,
    unit: item.unit,
    unitPrice: Number(item.price),
    supplier: item.supplier || undefined,
    expiryDate: item.expiryDate?.toISOString(),
    location: item.location || undefined,
    notes: item.notes || undefined
  })) as InventoryItem[];
}

export async function createInventoryItemAction(payload: Omit<InventoryItem, "id">) {
  const clinicId = await getClinicId();
  
  const item = await prisma.inventoryItem.create({
    data: {
      clinicId,
      name: payload.name,
      category: payload.category,
      quantity: payload.quantity,
      minStock: payload.minQuantity,
      unit: payload.unit,
      price: payload.unitPrice,
      supplier: payload.supplier,
      expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : null,
      location: payload.location,
      notes: payload.notes,
      code: `INV-${Date.now().toString().slice(-6)}` // Required by schema
    }
  });

  revalidatePath("/dashboard/inventory");
  return item;
}

export async function updateInventoryQuantityAction(id: string, newQuantity: number) {
  const clinicId = await getClinicId();
  
  const item = await prisma.inventoryItem.update({
    where: { id, clinicId },
    data: { quantity: newQuantity }
  });

  revalidatePath("/dashboard/inventory");
  return item;
}

export async function deleteInventoryItemAction(id: string) {
  const clinicId = await getClinicId();
  
  await prisma.inventoryItem.delete({
    where: { id, clinicId }
  });

  revalidatePath("/dashboard/inventory");
}
