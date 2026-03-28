"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { generateId } from "@/lib/utils/id";
import { StaffMember, StaffRole } from "../types";

const staffSchema = z.object({
  fullName: z.string().min(2, "nameRequired"),
  role: z.enum(["DOCTOR", "ASSISTANT", "RECEPTIONIST", "ACCOUNTANT"]),
  specialty: z.string().optional(),
  email: z.string().email("invalidEmail"),
  phone: z.string().min(10, "invalidPhone"),
  salary: z.preprocess(
    (val) => Number(val),
    z.number().positive("invalidSalary"),
  ),
  certifications: z.array(z.string()).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffFormProps {
  initialData?: StaffMember;
  onSubmit: (data: Partial<StaffMember>) => void;
  onCancel: () => void;
}

export function StaffForm({ initialData, onSubmit, onCancel }: StaffFormProps) {
  const t = useTranslations("Staff");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(staffSchema) as any,
    defaultValues: {
      fullName: initialData?.fullName || "",
      role: initialData?.role || "ASSISTANT",
      specialty: initialData?.specialty || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      salary: initialData?.salary || 0,
      certifications: initialData?.certifications || [],
      emergencyContactName: initialData?.emergencyContact?.name || "",
      emergencyContactPhone: initialData?.emergencyContact?.phone || "",
      emergencyContactRelationship:
        initialData?.emergencyContact?.relationship || "",
    },
  });

  const role = watch("role");

  const handleCertificationAdd = (cert: string) => {
    if (cert.trim()) {
      const current = watch("certifications") || [];
      setValue("certifications", [...current, cert.trim()]);
    }
  };

  const handleCertificationRemove = (index: number) => {
    const current = watch("certifications") || [];
    setValue(
      "certifications",
      current.filter((_, i) => i !== index),
    );
  };

  const handleFormSubmit = (data: StaffFormValues): void => {
    const staffData: Partial<StaffMember> = {
      fullName: data.fullName,
      role: data.role,
      specialty: data.specialty || undefined,
      email: data.email,
      phone: data.phone,
      salary: data.salary,
      certifications: data.certifications || [],
      isActive: true,
      joinDate: initialData?.joinDate || new Date().toISOString().split("T")[0],
      ...(data.emergencyContactName && {
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone || "",
          relationship: data.emergencyContactRelationship || "",
        },
      }),
    };

    if (initialData) {
      staffData.id = initialData.id;
    } else {
      staffData.id = generateId();
    }

    onSubmit(staffData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {t("personalInfo")}
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("fullName")} *
            </label>
            <Input
              {...register("fullName")}
              placeholder={t("fullNamePlaceholder")}
              className="rounded-xl"
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">
                {t(errors.fullName.message as string)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("role")} *
            </label>
            <select
              {...register("role")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-900"
            >
              <option value="DOCTOR">{t("roles.doctor")}</option>
              <option value="ASSISTANT">{t("roles.assistant")}</option>
              <option value="RECEPTIONIST">{t("roles.receptionist")}</option>
              <option value="ACCOUNTANT">{t("roles.accountant")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("specialty")}
            </label>
            <Input
              {...register("specialty")}
              placeholder={
                role === "DOCTOR"
                  ? t("specialtyPlaceholder")
                  : t("notApplicable")
              }
              disabled={role !== "DOCTOR"}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("salary")} (EGP) *
            </label>
            <Input
              {...register("salary")}
              type="number"
              placeholder="0"
              className="rounded-xl"
            />
            {errors.salary && (
              <p className="text-xs text-red-600 mt-1">
                {t(errors.salary.message as string)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("email")} *
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              className="rounded-xl"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {t(errors.email.message as string)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("phone")} *
            </label>
            <Input
              {...register("phone")}
              placeholder="+20 XXX XXX XXXX"
              className="rounded-xl"
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">
                {t(errors.phone.message as string)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {t("certifications")}
        </h3>

        <div className="flex gap-2">
          <Input
            placeholder={t("addCertification")}
            className="rounded-xl flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCertificationAdd((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <Button type="button" variant="outline" className="rounded-xl">
            {t("add")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(watch("certifications") || []).map((cert, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {cert}
              <button
                type="button"
                onClick={() => handleCertificationRemove(index)}
                className="hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {t("emergencyContact")}
        </h3>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("contactName")}
            </label>
            <Input
              {...register("emergencyContactName")}
              placeholder={t("contactNamePlaceholder")}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("contactPhone")}
            </label>
            <Input
              {...register("emergencyContactPhone")}
              placeholder={t("contactPhonePlaceholder")}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("relationship")}
            </label>
            <Input
              {...register("emergencyContactRelationship")}
              placeholder={t("relationshipPlaceholder")}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl shadow-emerald-500/20 shadow-lg"
        >
          {isSubmitting ? t("saving") : initialData ? t("update") : t("create")}
        </Button>
      </div>
    </form>
  );
}
