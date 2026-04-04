# Patients Module Migration (100% UI -> Real DB)

The goal is to replace the `localStorage` state currently powering the Patient Module with real Next.js Server Actions accessing your configured Supabase PostgreSQL database using Prisma ORM.

## User Review Required
> [!IMPORTANT]
> The current UI form collects `nationalId` and `emergencyContact`, but your Prisma `Patient` schema does not have individual native columns for these fields. 
> To prevent changing your database schema right now, I will store `nationalId` and `emergencyContact` inside the existing `medicalHistory` (JSON) field. Is this acceptable, or would you prefer to run another Prisma migration to add them as native columns first?

## Proposed Changes

### 1. New Server Actions (`src/features/patients/serverActions.ts`)
Creates a new dedicated file exclusively for `"use server"` directives containing operations:
- `getPatientsAction`: Paginates and filters records using `prisma.patient.findMany()`.
- `getPatientByIdAction`: Returns detailed record using `prisma.patient.findUnique()`.
- `createPatientAction`: Maps form data into the DB schema and generates a unique `fileNumber` (e.g. `PT-{Timestamp}`).
- `updatePatientAction`: Updates an individual patient.

### 2. Hook Refactoring (`src/features/patients/hooks/usePatients.ts`)
- [MODIFY] [usePatients.ts](file:///f:/react/SmileCraft-CMS/src/features/patients/hooks/usePatients.ts)
- Will be refactored to asynchronously request `getPatientsAction` within `useEffect` when `filters` or `pagination` update. (Or utilizing React 19's `use` hook asynchronously if you strictly prefer server-components, but to keep the exact SPA feel we will stick to your existing `useState` wrapped around the Server Action fetch).
- The `MOCK_PATIENTS` import will be completely removed.

### 3. Cleanup Legacy Services
- [DELETE] [patientService.ts](file:///f:/react/SmileCraft-CMS/src/features/patients/services/patientService.ts) (localStorage mock logic)
- [DELETE] [patientApiService.ts](file:///f:/react/SmileCraft-CMS/src/features/patients/services/patientApiService.ts) (legacy axios wrapper wrapper)
- Will modify any component originally depending directly on `patientService` to call the new Server Actions instead.

## Open Questions

> [!WARNING]
> Your `actions.ts` inside the `patients` feature is currently marked as `"use client"`. Server Actions inherently must be marked `"use server"`. I will create a separate file `serverActions.ts` and modify your UI components to import from it instead. Do you have any strict naming conventions for server action files?

## Verification Plan

### Automated/Manual Verification
- Fill out the "New Intake Form" UI on the browser.
- Verify that a fresh entry successfully inserts into your Database (by checking Supabase Studio).
- Ensure the Datagrid in the UI properly fetches records with zero errors and renders exactly as it did with the mock data.
