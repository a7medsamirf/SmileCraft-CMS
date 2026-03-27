"use client";

import React, { useCallback, useState } from "react";
import { Tooth, ToothStatus, ToothType, TOOTH_STATUS_LABELS } from "../types/odontogram";
import { useTranslations, useLocale } from "next-intl";

interface ToothVisualProps {
  tooth: Tooth;
  onStatusChange: (id: number, newStatus: ToothStatus) => void;
}

/** Map ToothStatus enum strictly to Tailwind hex/CSS colors for the SVG fill */
const COLOR_MAP: Record<ToothStatus, { fill: string; stroke: string }> = {
  [ToothStatus.HEALTHY]:    { fill: "#f8fafc", stroke: "#cbd5e1" }, // slate-50 / slate-300
  [ToothStatus.CARIOUS]:    { fill: "#ef4444", stroke: "#b91c1c" }, // red-500 / red-700
  [ToothStatus.MISSING]:    { fill: "transparent", stroke: "#94a3b8" }, // slate-400 dashed
  [ToothStatus.CROWN]:      { fill: "#fbbf24", stroke: "#d97706" }, // amber-400 / amber-600
  [ToothStatus.FILLING]:    { fill: "#3b82f6", stroke: "#1d4ed8" }, // blue-500 / blue-700
  [ToothStatus.ROOT_CANAL]: { fill: "#a855f7", stroke: "#7e22ce" }, // purple-500 / purple-700
};

/** Anatomical SVG paths for different tooth types (Universal Numbering) */
const TOOTH_PATHS: Record<ToothType, string> = {
  [ToothType.MOLAR]:    "M 15 20 C 15 5, 85 5, 85 20 C 85 35, 95 50, 80 110 C 70 110, 65 90, 50 90 C 35 90, 30 110, 20 110 C 5 50, 15 35, 15 20 Z",
  [ToothType.PREMOLAR]: "M 25 20 C 25 8, 75 8, 75 20 C 75 35, 85 50, 70 110 C 60 110, 55 90, 50 90 C 45 90, 40 110, 30 110 C 15 50, 25 35, 25 20 Z",
  [ToothType.CANINE]:   "M 30 25 C 30 10, 50 0, 70 25 C 70 45, 80 60, 60 115 C 50 115, 50 95, 50 95 C 50 95, 50 115, 40 115 C 20 60, 30 45, 30 25 Z",
  [ToothType.INCISOR]:  "M 30 15 L 70 15 C 70 35, 80 55, 65 110 C 55 110, 50 95, 50 95 C 50 95, 45 110, 35 110 C 20 55, 30 35, 30 15 Z",
};

// ---------------------------------------------------------------------------
// Design Decision (Performance): React.memo
// Mapping 32 complex SVG elements causes heavy React reconciliation if the
// parent array state updates. Using memo ensures ONLY the clicked tooth re-renders.
// ---------------------------------------------------------------------------
export const ToothVisual = React.memo(({ tooth, onStatusChange }: ToothVisualProps) => {
  const t = useTranslations("Clinical");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const colors = COLOR_MAP[tooth.status];
  const toothPath = TOOTH_PATHS[tooth.type] || TOOTH_PATHS[ToothType.INCISOR];

  // We toggle the popover on click
  const togglePopover = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((status: ToothStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(tooth.id, status);
    setIsOpen(false);
  }, [tooth.id, onStatusChange]);

  // Click outside listener for basic custom popover (simple implementation)
  React.useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [isOpen]);

  // Generic simplistic SVG path resembling a premolar/molar
  // For production, a more anatomically accurate SVG set or 5-surface SVGs are used
  const isMissing = tooth.status === ToothStatus.MISSING;

  return (
    <div className="relative inline-flex flex-col items-center group">
      {/* Popover Menu */}
      {isOpen && (
        <div 
          className="absolute z-50 mb-2 bottom-full w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1 border-b border-slate-100 px-2 pb-1 text-center text-[10px] font-bold text-slate-400 dark:border-slate-800">
            {t("selectStatus")}
          </div>
          {Object.values(ToothStatus).map((st) => (
            <button
              key={st}
              onClick={(e) => handleSelect(st, e)}
              className="w-full rounded-lg px-2 py-1.5 text-xs text-right text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {TOOTH_STATUS_LABELS[st][locale === "ar" ? "ar" : "en"]}
            </button>
          ))}
        </div>
      )}

      {/* SVG Tooth Element */}
      <div 
        onClick={togglePopover}
        className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
        role="button"
        title={`${t("toothLabel")} ${tooth.id} - ${TOOTH_STATUS_LABELS[tooth.status][locale === "ar" ? "ar" : "en"]}`}
      >
        <svg 
          viewBox="0 0 100 120" 
          width="40" 
          height="48" 
          className="drop-shadow-sm transition-colors duration-300"
          style={{ opacity: isMissing ? 0.3 : 1 }}
        >
          {/* Anatomically correct path based on tooth type */}
          <path 
            d={toothPath} 
            fill={colors.fill} 
            stroke={colors.stroke}
            strokeWidth={isMissing ? "4" : "3"}
            strokeDasharray={isMissing ? "5,5" : "none"}
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Universal ID Label */}
      <span className="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
        {tooth.id}
      </span>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom equality check: only re-render if the tooth's exact status or reference changed
  return prevProps.tooth.status === nextProps.tooth.status && prevProps.tooth.id === nextProps.tooth.id;
});

// Setting displayName for fast refresh debugging
ToothVisual.displayName = "ToothVisual";
