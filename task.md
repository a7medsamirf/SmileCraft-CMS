# Patients Module Migration Tasks

- [ ] Create `src/features/patients/serverActions.ts` containing Prisma DB operations.
- [ ] Delete mock services (`patientService.ts` and `patientApiService.ts`).
- [ ] Update `actions.ts` to redirect its logic to the real database or write it natively inside `actions.ts`.
- [ ] Update `hooks/usePatients.ts` to fetch from Prisma Server Actions.
- [ ] Verify functionality via manual UI testing.
