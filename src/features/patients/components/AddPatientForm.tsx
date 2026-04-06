"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPatientAction } from "../actions";
import {
  addPatientSchema,
  stepSchemas,
  type AddPatientFormData,
} from "../schemas/addPatientSchema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  User,
  Phone,
  CreditCard,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Activity,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Gender, BloodGroup } from "../types";

interface AddPatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Step 1 fields, Step 2 fields, Step 3 fields — used for per-step validation
const stepFieldNames: (keyof AddPatientFormData)[][] = [
  ["fullName", "phone", "nationalId", "birthDate", "gender", "city"],
  ["bloodGroup", "medicalNotes", "currentMedications"],
  ["emergencyName", "emergencyRelationship", "emergencyPhone"],
];

export function AddPatientForm({ onSuccess, onCancel }: AddPatientFormProps) {
  const t = useTranslations("Patients");
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // --- React Hook Form + Zod ---
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      nationalId: "",
      birthDate: "",
      gender: Gender.MALE,
      city: "",
      bloodGroup: BloodGroup.UNKNOWN,
      medicalNotes: "",
      currentMedications: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
    },
  });

  // --- Server Action state ---
  const [state, formAction, isPending] = useActionState(createPatientAction, {
    success: null,
  });

  // Success handling → auto-close modal
  React.useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onSuccess?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, onSuccess]);

  // --- Step navigation with per-step validation ---
  const nextStep = async () => {
    const currentStepFields = stepFieldNames[step - 1];
    const isValid = await trigger(currentStepFields);
    if (isValid) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // --- Helper: render field error ---
  const renderFieldError = (fieldName: keyof AddPatientFormData) => {
    const error = errors[fieldName];
    if (!error?.message) return null;
    return (
      <p className="mt-1 text-xs font-semibold text-red-500">
        {t(error.message as Parameters<typeof t>[0])}
      </p>
    );
  };

  // --- Success screen ---
  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("addPatientSuccess")}
        </h3>
        <p className="mt-2 text-slate-500">{t("redirecting")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === s
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : step > s
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            <span
              className={`hidden sm:inline text-xs font-bold ${step === s ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
            >
              {s === 1
                ? t("stepBasic")
                : s === 2
                  ? t("stepMedical")
                  : t("stepEmergency")}
            </span>
            {s < 3 && (
              <div className="h-px w-8 sm:w-16 bg-slate-100 dark:bg-slate-800" />
            )}
          </div>
        ))}
      </div>

      <form action={formAction} className="space-y-5">
        {/* Hidden inputs → ensure RHF-managed values are always submitted to the server action */}
        {Object.entries(getValues()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value ?? ""} />
        ))}

        <AnimatePresence mode="wait">
          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("fullName")}
                  </label>
                  <Input
                    {...register("fullName")}
                    placeholder={t("fullNamePlaceholder")}
                    icon={<User className="h-4 w-4" />}
                    className={errors.fullName ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("fullName")}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("phone")}
                  </label>
                  <Input
                    {...register("phone")}
                    placeholder={t("phonePlaceholder")}
                    type="tel"
                    icon={<Phone className="h-4 w-4" />}
                    className={errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("phone")}
                </div>

                {/* National ID */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("nationalId")}
                  </label>
                  <Input
                    {...register("nationalId")}
                    placeholder={t("nationalIdPlaceholder")}
                    icon={<CreditCard className="h-4 w-4" />}
                    className={errors.nationalId ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("nationalId")}
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("birthDate")}
                  </label>
                  <Input
                    {...register("birthDate")}
                    type="date"
                    icon={<Calendar className="h-4 w-4" />}
                    className={errors.birthDate ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("birthDate")}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("gender")}
                  </label>
                  <select
                    {...register("gender")}
                    className={`w-full h-11 rounded-xl border bg-slate-50/50 px-4 text-sm font-medium focus:outline-none dark:bg-slate-900 transition-colors ${
                      errors.gender
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500 dark:border-slate-800"
                    }`}
                  >
                    <option value={Gender.MALE}>{t("male")}</option>
                    <option value={Gender.FEMALE}>{t("female")}</option>
                    <option value={Gender.OTHER}>{t("other")}</option>
                  </select>
                  {renderFieldError("gender")}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("city")}
                  </label>
                  <Input
                    {...register("city")}
                    placeholder="..."
                    className={errors.city ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("city")}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Medical History ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Blood Group */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("bloodGroup")}
                  </label>
                  <select
                    {...register("bloodGroup")}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  >
                    {Object.values(BloodGroup).map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medical Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("medicalAlerts")}
                  </label>
                  <Input
                    {...register("medicalNotes")}
                    placeholder={t("medicalAlertsPlaceholder")}
                    icon={<Activity className="h-4 w-4" />}
                    className={errors.medicalNotes ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("medicalNotes")}
                </div>
              </div>

              {/* Current Medications */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("medications")}
                </label>
                <textarea
                  {...register("currentMedications")}
                  rows={3}
                  className={`w-full rounded-xl border bg-slate-50/50 p-4 text-sm font-medium focus:outline-none dark:bg-slate-900 transition-colors ${
                    errors.currentMedications
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500 dark:border-slate-800"
                  }`}
                  placeholder={t("medicationsPlaceholder")}
                />
                {renderFieldError("currentMedications")}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Emergency Contact ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-slate-500 mb-4">
                {t("emergencyNote")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emergency Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("emergencyContactName")}
                  </label>
                  <Input
                    {...register("emergencyName")}
                    placeholder="..."
                    icon={<UserPlus className="h-4 w-4" />}
                    className={errors.emergencyName ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("emergencyName")}
                </div>

                {/* Emergency Relationship */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("emergencyRelationship")}
                  </label>
                  <Input
                    {...register("emergencyRelationship")}
                    placeholder={t("emergencyRelationshipPlaceholder")}
                    className={errors.emergencyRelationship ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("emergencyRelationship")}
                </div>

                {/* Emergency Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("emergencyPhone")}
                  </label>
                  <Input
                    {...register("emergencyPhone")}
                    placeholder={t("phonePlaceholder")}
                    icon={<Phone className="h-4 w-4" />}
                    className={errors.emergencyPhone ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {renderFieldError("emergencyPhone")}
                </div>
              </div>

              {/* Server-side error banner */}
              {state.message && !state.success && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {t(state.message as Parameters<typeof t>[0])}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="rounded-2xl px-6"
            >
              <ArrowRight className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t("prev")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="rounded-2xl text-slate-400 hover:text-red-500"
            >
              {t("cancel")}
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-8"
            >
              {t("next")}
              <ArrowLeft className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 shadow-lg px-10"
            >
              {isPending ? t("registering") : t("register")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
