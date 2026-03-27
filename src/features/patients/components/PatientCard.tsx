import React from "react";
import { Patient, PatientStatus } from "../types";
import { PATIENT_STATUS_LABELS } from "../constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Phone, Calendar, User, ChevronRight, Activity } from "lucide-react";

import { useTranslations } from "next-intl";

interface PatientCardProps {
  patient: Patient;
  onClick?: (id: string) => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const t = useTranslations("Patients");
  const statusLabel = PATIENT_STATUS_LABELS[patient.status];
  
  // Format dates for display
  const formatDate = (isoString?: string) => {
    if (!isoString) return t("noResults"); // Fallback
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  return (
    <div 
      className="group relative flex flex-col gap-4 glass-card p-5 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick?.(patient.id)}
    >
      {/* Header: Name and Status */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {patient.photoUrl ? (
              <img src={patient.photoUrl} alt={patient.fullName} className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{patient.fullName}</h3>
            <p className="text-sm text-slate-500 font-medium">#{patient.nationalId?.slice(-6) || "---"}</p>
          </div>
        </div>
        <Badge 
          className={statusLabel.colorClass} 
          variant="outline"
        >
          {statusLabel.ar}
        </Badge>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate" dir="ltr">{patient.contactInfo.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{patient.age} {t("age")}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Activity className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{t("lastVisit")}: <span className="font-semibold text-slate-900 dark:text-slate-200">{formatDate(patient.lastVisit)}</span></span>
        </div>
      </div>

      {/* Conditions tags if any */}
      {patient.medicalHistory.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {patient.medicalHistory.conditions.slice(0, 2).map((c, i) => (
             <Badge key={i} variant="secondary" className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] px-2 py-0">
               {c.condition}
             </Badge>
          ))}
          {patient.medicalHistory.conditions.length > 2 && (
             <Badge variant="secondary" className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] px-2 py-0">
               +{patient.medicalHistory.conditions.length - 2}
             </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-2 flex items-center justify-between">
         <div className="text-[10px] font-semibold text-slate-400">
           {formatDate(patient.createdAt)}
         </div>
         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600">
           <ChevronRight className="h-4 w-4 rtl:rotate-180" />
         </Button>
      </div>
    </div>
  );
}
