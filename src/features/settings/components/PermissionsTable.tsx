"use client";

import React, { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { PermissionRole } from "../types";

interface PermissionRow {
  id: string;
  key: string;
}

const PERMISSIONS: PermissionRow[] = [
  { id: "view_patients", key: "viewPatients" },
  { id: "edit_records", key: "editRecords" },
  { id: "view_revenue", key: "viewRevenue" },
  { id: "delete_data", key: "deleteData" },
];

export function PermissionsTable() {
  const t = useTranslations("Settings.permissions");

  // Initial state logic
  const [rolePermissions, setRolePermissions] = useState<
    Record<PermissionRole, string[]>
  >({
    ADMIN: ["view_patients", "edit_records", "view_revenue", "delete_data"],
    RECEPTIONIST: ["view_patients"],
    ACCOUNTANT: ["view_patients", "view_revenue"],
  });

  const togglePermission = (role: PermissionRole, permId: string) => {
    if (role === "ADMIN") return; // Safety guard for admin

    setRolePermissions((prev) => {
      const current = prev[role];
      const updated = current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId];

      return { ...prev, [role]: updated };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t("title")}
        </h2>
        <div className="flex items-center gap-2 text-amber-600 glass px-3 py-1.5 shadow-sm transition-all duration-300">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-xs font-medium">{t("adminGuard")}</span>
        </div>
      </div>

      <div className="overflow-hidden glass-card transition-all duration-300">
        <table className="w-full text-left rtl:text-right">
          <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4">{t("title").split(" ")[0]}</th>
              <th className="px-6 py-4 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="h-5 w-5 text-blue-600 mb-1" />
                  {t("doctor")}
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="h-5 w-5 text-slate-400 mb-1" />
                  {t("receptionist")}
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="h-5 w-5 text-slate-400 mb-1" />
                  {t("accountant")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {PERMISSIONS.map((perm) => (
              <tr
                key={perm.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {t(perm.key)}
                </td>
                {(
                  ["ADMIN", "RECEPTIONIST", "ACCOUNTANT"] as PermissionRole[]
                ).map((role) => {
                  const isChecked = rolePermissions[role].includes(perm.id);
                  const isDisabled = role === "ADMIN";

                  return (
                    <td key={role} className="px-6 py-4 text-center">
                      <label
                        className={`relative inline-flex items-center cursor-pointer ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => togglePermission(role, perm.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 rtl:peer-checked:after:-translate-x-full">
                          {isDisabled && (
                            <Lock className="h-3 w-3 absolute top-1.5 left-1.5 text-slate-400 z-10" />
                          )}
                        </div>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
