"use client";

import React from "react";
import { Search, Plus, Filter, Users } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { usePatients } from "../hooks/usePatients";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { AddPatientModal } from "./AddPatientModal";

export function PatientList() {
  const t = useTranslations("Patients");
  const router = useRouter();
  const { patients, isLoading, total, filters, setFilters } = usePatients();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  return (
    <div className="w-full mx-auto space-y-5 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
            {t("listTitle")}
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("listSummary", { patientCount: t("patientCount", { total }) })}
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 rounded-2xl shadow-blue-500/20 shadow-lg px-6"
        >
          <Plus className="me-2 h-5 w-5" />
          {t("addPatient")}
        </Button>
      </div>

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4 transition-all duration-300">
        <div className="relative w-full sm:max-w-md">
          <Input
            placeholder={t("searchPlaceholder")}
            icon={<Search className="h-5 w-5" />}
            className="rounded-2xl border-slate-200/80 bg-white/80 dark:bg-slate-900/40 dark:border-slate-800"
            value={filters.search || ""}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Button variant="outline" className="rounded-2xl shrink-0">
            <Filter className="me-2 h-4 w-4" />
            {t("advancedFilter")}
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("noResults")}
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t("noResultsSummary")}
          </p>
          <Button
            variant="outline"
            className="mt-6 rounded-2xl dark:border-slate-800"
            onClick={() => setFilters({ search: "" })}
          >
            {t("clearSearch")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={(id) =>
                router.push({ pathname: "/patients/[id]", params: { id } })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
