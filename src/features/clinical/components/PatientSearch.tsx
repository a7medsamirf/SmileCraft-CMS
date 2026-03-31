"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MOCK_PATIENTS } from "@/features/patients/mock/patients.mock";
import { Patient } from "@/features/patients/types";
import { Search, X, User, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface PatientSearchProps {
  onSelect: (patient: Patient) => void;
  selectedPatientId?: string;
}

export function PatientSearch({ onSelect, selectedPatientId }: PatientSearchProps) {
  const t = useTranslations("Clinical");
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter patients by name or phone
  const filteredPatients = useMemo(() => {
    if (!query.trim()) return MOCK_PATIENTS;
    const q = query.trim().toLowerCase();
    return MOCK_PATIENTS.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.contactInfo.phone.includes(q) ||
        p.contactInfo.altPhone?.includes(q),
    );
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (patient: Patient) => {
      onSelect(patient);
      setQuery("");
      setIsFocused(false);
    },
    [onSelect],
  );

  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={t("searchPatientPlaceholder")}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pe-4 ps-11 text-sm font-medium text-slate-900 
            placeholder:text-slate-400 
            focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 
            dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-600 
            dark:focus:border-blue-600 dark:focus:ring-blue-500/20 
            transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsFocused(false); }}
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
          >
            {filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                {t("noPatientResults")}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto py-1">
                {filteredPatients.map((patient) => {
                  const isSelected = patient.id === selectedPatientId;
                  return (
                    <button
                      key={patient.id}
                      onClick={() => handleSelect(patient)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-start transition-colors ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {patient.fullName.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {patient.fullName}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span dir="ltr">{patient.contactInfo.phone}</span>
                        </p>
                      </div>

                      {/* Age Badge */}
                      {patient.age && (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {patient.age} {t("years") || "سنة"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
