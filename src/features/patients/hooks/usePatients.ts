"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { Patient, PatientFilters, PaginationParams } from "../types/index";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { getPatientsAction } from "../serverActions";

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

const DEFAULT_PAGINATION: PaginationParams = { page: 1, limit: DEFAULT_PAGE_SIZE };

export function usePatients(): UsePatientsReturn {
  const [filters, setFiltersState] = useState<PatientFilters>({});
  const [pagination, setPagination] = useState<PaginationParams>(DEFAULT_PAGINATION);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Stable refs for filters and pagination to avoid re-fetching on object reference changes
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPatientsAction(
        filtersRef.current,
        paginationRef.current.page,
        paginationRef.current.limit,
      );
      setPatients(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const setFilters = useCallback((partial: Partial<PatientFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({});
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
    refresh: fetchPatients,
  };
}
