import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// نستخدم DIRECT_URL للاتصال المباشر لضمان الثبات في الـ Seed والـ Auth
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false // ضروري جداً لتجاوز مشاكل شهادات Supabase
  },
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// تصدير نسخة موحدة من Prisma لضمان عدم تكرار الاتصالات
export const prisma = globalForPrisma.prisma || new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;