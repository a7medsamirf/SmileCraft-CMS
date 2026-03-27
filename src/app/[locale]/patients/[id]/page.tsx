import React from "react";
import { notFound } from "next/navigation";
import { MOCK_PATIENTS } from "@/features/patients";
import { ProfileLayout } from "@/features/patients/components/ProfileLayout";

export const metadata = {
  title: "ملف المريض | SmileCraft CMS",
};

interface PatientProfilePageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const { id } = await params;
  
  // Find the patient in our mock data
  const patient = MOCK_PATIENTS.find((p) => p.id === id);

  if (!patient) {
    notFound();
  }

  // Passing the mock patient down. In real app, we'd pass a server action to `onUpdatePatientHistory`
  return (
    <div className="w-full">
       <div className="mb-6">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ملف المريض</h1>
         <p className="text-sm text-slate-500">تفاصيل وسجلات العلاج للمريض المُحدد.</p>
       </div>
       <ProfileLayout patient={patient} />
    </div>
  );
}
