"use client";

import React, { useState, useActionState, useEffect } from "react";
import { X, Plus, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { DentalService, ServiceCategory, ProcedureType } from "../types";
import { createServiceAction, updateServiceAction } from "../serverActions";

const PROCEDURE_TYPES: ProcedureType[] = [
  "TEETH_CLEANING",
  "FILLING",
  "EXTRACTION",
  "ROOT_CANAL",
  "CROWN",
  "BRACES",
  "BLEACHING",
  "EXAMINATION",
  "XRAY",
  "OTHER",
];

const CATEGORIES: ServiceCategory[] = ["GENERAL", "SURGERY", "COSMETIC", "PEDIATRICS"];

type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const initialFormState: FormState = { success: false };

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editService?: DentalService | null;
  onSuccess: () => void;
}

async function serviceFormAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const category = formData.get("category") as ServiceCategory;
  const price = formData.get("price") as string;
  const duration = formData.get("duration") as string;
  const procedureType = formData.get("procedureType") as ProcedureType;

  const errors: Record<string, string[]> = {};

  if (!name.trim()) errors.name = ["Name is required"];
  if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.price = ["Valid price required"];
  if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) errors.duration = ["Valid duration required"];
  if (!procedureType) errors.procedureType = ["Procedure type is required"];

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const payload = {
      name: name.trim(),
      category,
      price: Number(price),
      duration: Number(duration),
      procedureType,
    };

    if (id) {
      await updateServiceAction(id, payload);
    } else {
      await createServiceAction(payload);
    }

    return { success: true, message: id ? "Updated" : "Created" };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export function ServiceModal({ isOpen, onClose, editService, onSuccess }: ServiceModalProps) {
  const t = useTranslations("Settings.services");
  const [state, formAction, isPending] = useActionState(serviceFormAction, initialFormState);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("GENERAL");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [procedureType, setProcedureType] = useState<ProcedureType>("OTHER");

  useEffect(() => {
    if (editService) {
      setName(editService.name);
      setCategory(editService.category);
      setPrice(editService.price.toString());
      setDuration(editService.duration.toString());
      setProcedureType(editService.procedureType);
    } else {
      setName("");
      setCategory("GENERAL");
      setPrice("");
      setDuration("");
      setProcedureType("OTHER");
    }
  }, [editService, isOpen]);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onSuccess();
        handleClose();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const inputCls = (error?: string[]) =>
   cn(
        "w-full rounded-xl px-4 py-3 text-[13px] font-medium appearance-none",
        "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
        "text-slate-700 dark:text-slate-300 outline-none",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all",
        error && "border-red-500",
      );

  return (
    <>
        {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        style={{ animation: "fadeIn 0.2s ease" }}
        onClick={onClose}
      />

       {/* Modal shell */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50"
          style={{ animation: "slideUp 0.3s ease" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editService ? t("editService") : t("add")}
                </h2>
                <p className="text-[12px] text-slate-500">
                  {editService ? "تعديل بيانات الخدمة" : "إضافة خدمة جديدة"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form action={formAction} className="p-6 space-y-5">
            <input type="hidden" name="id" value={editService?.id ?? ""} />

            <div>
              <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                {t("name")}
              </label>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                disabled={isPending}
                className={inputCls(state.errors?.name)}
              />
              {state.errors?.name && (
                <p className="text-[11px] text-red-400 font-medium mt-1">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  {t("category")}
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  disabled={isPending}
                  className={inputCls()}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`filter${cat.charAt(0) + cat.slice(1).toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  {t("procedureType")}
                </label>
                <select
                  name="procedureType"
                  value={procedureType}
                  onChange={(e) => setProcedureType(e.target.value as ProcedureType)}
                  disabled={isPending}
                  className={inputCls(state.errors?.procedureType)}
                >
                  <option value="">{t("selectProcedureType")}</option>
                  {PROCEDURE_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {t(`procedureTypes.${pt}`)}
                    </option>
                  ))}
                </select>
                {state.errors?.procedureType && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">{state.errors.procedureType[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  {t("price")}
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t("pricePlaceholder")}
                  disabled={isPending}
                  className={inputCls(state.errors?.price)}
                />
                {state.errors?.price && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">{state.errors.price[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  {t("duration")}
                </label>
                <input
                  name="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder={t("durationPlaceholder")}
                  disabled={isPending}
                  className={inputCls(state.errors?.duration)}
                />
                {state.errors?.duration && (
                  <p className="text-[11px] text-red-400 font-medium mt-1">{state.errors.duration[0]}</p>
                )}
              </div>
            </div>

            {state.message && !state.success && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-[12.5px] text-red-400 text-center font-medium">{state.message}</p>
              </div>
            )}

            {state.success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[12.5px] text-emerald-400 text-center font-medium">
                  {editService ? t("updateSuccess") : t("createSuccess")}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold text-[14px] transition-all duration-200 flex items-center justify-center gap-2",
                  isPending
                    ? "bg-blue-500/30 text-blue-200 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25",
                )}
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {editService ? t("save") : t("add")}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {editService ? t("save") : t("add")}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-6 py-3 rounded-xl font-bold text-[14px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
