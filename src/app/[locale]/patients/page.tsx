import React from "react";
import { PatientList } from "@/features/patients/components/PatientList";

export const metadata = {
  title: "إدارة المرضى - العيادة",
  description: "نظام إدارة عيادة الأسنان - ملفات المرضى",
};

export default function PatientsPage() {
  return (
    <div className="min-h-screen">
      <PatientList />
    </div>
  );
}
