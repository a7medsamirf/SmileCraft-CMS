# Implementation Tasks: SmileCraft CMS Production Readiness

## 1. Database Schema Refinements (Pre-Migration)
- `[x]` Read `prisma/schema.prisma`
- `[x]` Add `clinicId` to all relevant models (multi-tenant support)
- `[x]` Extract `MedicalHistory` into a relational model
- `[x]` Setup 1:1 relation between `Staff` and `User`
- `[x]` Create `AuditLog` model
- `[x]` Create `MediaFile` model
- `[x]` Validate schema

## 2. Authentication & Security Layer
- `[x]` Activate `middleware.ts` for route protection
- `[x]` Create a Global `ErrorBoundary` to catch Server Action failures

## 3. Database Migration
- `[x]` Run `npx prisma migrate dev --name init_multi_tenant_schema`

## 4. Replacing Mock Data
- `[ ]` Convert Patients module to Prisma Server Actions
- `[ ]` Convert Clinical module to Prisma Server Actions
- `[ ]` Convert Appointments module to Prisma Server Actions

## 5. Advanced Integrations
- `[ ]` Add Rate Limiting logic (Redis/Edge)
- `[ ]` Supabase Storage implementation logic
