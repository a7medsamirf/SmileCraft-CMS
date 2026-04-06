-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "nationalId" TEXT;
