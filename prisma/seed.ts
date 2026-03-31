import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting Seeding...");

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@smile-craft.com" },
    update: {},
    create: {
      email: "admin@smile-craft.com",
      name: "مدير النظام",
      password: await bcrypt.hash("Admin@Smile2026", 12),
      role: "ADMIN",
    },
  });
  console.log("✅ Admin User Created:", admin.email);

  // 2. Create Dummy Patients
  const patientsData = [
    {
      firstName: "أحمد",
      lastName: "علي",
      phone: "01012345678",
      email: "ahmed@example.com",
      dateOfBirth: new Date("1990-05-15"),
      bloodGroup: "A+",
      city: "القاهرة",
      address: "المعادي، شارع ٩",
      medicalAlerts: "حساسية من البنسلين",
      allergies: ["Penicillin"],
    },
    {
      firstName: "سارة",
      lastName: "محمود",
      phone: "01187654321",
      email: "sara@example.com",
      dateOfBirth: new Date("1995-10-20"),
      bloodGroup: "O-",
      city: "الجيزة",
      address: "الدقي، شارع التحرير",
      medicalAlerts: "لا يوجد",
    },
  ];

  for (const patient of patientsData) {
    const p = await prisma.patient.upsert({
      where: { email: patient.email || "" },
      update: {},
      create: patient,
    });
    console.log(`✅ Patient Created: ${p.firstName} ${p.lastName}`);
  }

  // 3. Create Dummy Medical History
  const firstPatient = await prisma.patient.findFirst({ where: { email: "ahmed@example.com" } });
  if (firstPatient) {
    await prisma.medicalHistory.create({
      data: {
        patientId: firstPatient.id,
        condition: "ضغط دم مرتفع",
        severity: "MEDIUM",
        notes: "يتم المتابعة بانتظام",
      },
    });
    console.log("✅ Medical History Created for:", firstPatient.firstName);

    // 4. Create Dummy Treatment Plan
    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId: firstPatient.id,
        status: "IN_PROGRESS",
        items: {
          create: [
            {
              procedureName: "حشو عصب",
              toothNumber: "16",
              cost: 1500,
              status: "IN_PROGRESS",
            },
            {
              procedureName: "خلع عادي",
              toothNumber: "24",
              cost: 500,
              status: "PLANNED",
            },
          ],
        },
      },
    });
    console.log("✅ Treatment Plan Created with ID:", plan.id);
  }

  // 5. Create Dummy Inventory Items
  const inventoryData = [
    { name: "كمامات طبية", sku: "MSK-001", quantity: 150, minQuantity: 50, unit: "box" },
    { name: "قفازات مطاطية", sku: "GLV-002", quantity: 20, minQuantity: 30, unit: "box" },
  ];

  for (const item of inventoryData) {
    await prisma.inventoryItem.upsert({

      where: { sku: item.sku },
      update: {},
      create: item,
    });
    console.log(`✅ Inventory Item Created: ${item.name}`);
  }

  // 6. Create Dummy Appointment
  if (firstPatient) {
    await prisma.appointment.create({
      data: {
        patientId: firstPatient.id,
        date: new Date(),
        startTime: "10:30",
        duration: 30,
        type: "كشف دوري",
        status: "PENDING",
        notes: "أول زيارة للمريض",
      },
    });
    console.log("✅ Appointment Created for:", firstPatient.firstName);
  }

  console.log("🚀 Seeding Complete! ✅");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
