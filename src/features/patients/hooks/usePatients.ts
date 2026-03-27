"use client";

// =============================================================================
// DENTAL CMS — Patients Module: usePatients Hook
// features/patients/hooks/usePatients.ts
//
// Currently backed by mock data. Swap fetchPatients() with your real API
// service once the backend is ready — the hook interface stays identical.
// =============================================================================

import { useCallback, useMemo, useState, useEffect } from "react";
import { MOCK_PATIENTS } from "../mock/patients.mock";
import { Patient, PatientFilters, PaginationParams } from "../types/index";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { patientService } from "../services/patientService";

interface UsePatientsReturn {
  patients: Patient[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  filters: PatientFilters;
  setFilters: (filters: Partial<PatientFilters>) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  refresh: () => void;
}

const DEFAULT_FILTERS: PatientFilters = {};
const DEFAULT_PAGINATION: PaginationParams = { page: 1, limit: DEFAULT_PAGE_SIZE };

export function usePatients(): UsePatientsReturn {
  const [filters, setFiltersState] = useState<PatientFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState<PaginationParams>(DEFAULT_PAGINATION);
  const [persistedPatients, setPersistedPatients] = useState<Patient[]>(() => {
    if (typeof window !== "undefined") {
      return patientService.getPatients();
    }
    return [];
  });

  // Function to load patients from localStorage
  const refresh = useCallback(() => {
    const saved = patientService.getPatients();
    setPersistedPatients(saved);
  }, []);

  // Load once on mount - no longer needed due to lazy initializer
  // but we keep it empty to satisfy potential other needs or remove if not used.
  useEffect(() => {}, []);

  // In a real app this would be an async call; keep the signature stable.
  const isLoading = false;

  // --- Client-side filtering (will be replaced by server-side query params) ---
  const filtered = useMemo(() => {
    // Merge mock data with persisted data
    // Tip: Use IDs to avoid duplicates if mock data is also persisted
    const allPatients = [...MOCK_PATIENTS, ...persistedPatients];
    let result = [...allPatients];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.contactInfo.phone.includes(q) ||
          p.nationalId?.includes(q),
      );
    }
    if (filters.gender) result = result.filter((p) => p.gender === filters.gender);
    if (filters.status) result = result.filter((p) => p.status === filters.status);
    if (filters.bloodGroup)
      result = result.filter(
        (p) => p.medicalHistory.bloodGroup === filters.bloodGroup,
      );

    return result;
  }, [filters, persistedPatients]);

  const total      = filtered.length;
  const totalPages = Math.ceil(total / pagination.limit);
  const patients   = filtered.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const setFilters = useCallback((partial: Partial<PatientFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, page: 1 })); // reset to first page on filter change
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination(DEFAULT_PAGINATION);
  }, []);

  return {
    patients,
    total,
    currentPage: pagination.page,
    totalPages,
    isLoading,
    filters,
    setFilters,
    setPage,
    resetFilters,
    refresh,
  };
}
