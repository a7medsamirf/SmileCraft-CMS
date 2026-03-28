"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Award,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StaffMember, StaffRole } from "../types";
import { staffService } from "../services/staffService";

interface StaffListProps {
  onEdit: (staff: StaffMember) => void;
  onAdd: () => void;
}

export function StaffList({ onEdit, onAdd }: StaffListProps) {
  const t = useTranslations("Staff");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<StaffRole | "ALL">("ALL");
  const [staff, setStaff] = useState<StaffMember[]>(() => staffService.getAllStaff());
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh staff when refreshKey changes
  useMemo(() => {
    setStaff(staffService.getAllStaff());
  }, [refreshKey]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "ALL" || s.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [staff, searchTerm, filterRole]);

  const handleToggleStatus = (id: string) => {
    staffService.toggleStaffStatus(id);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("confirmDelete"))) {
      staffService.deleteStaff(id);
      setRefreshKey((k) => k + 1);
    }
  };

  const getRoleBadgeColor = (role: StaffRole) => {
    switch (role) {
      case "DOCTOR":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "ASSISTANT":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "RECEPTIONIST":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "ACCOUNTANT":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("listTitle")}
        </h2>
        <Button onClick={onAdd} className="rounded-2xl shadow-emerald-500/20 shadow-lg">
          <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
          {t("addStaff")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 glass-card p-4 transition-all duration-300">
        <div className="relative flex-1">
          <Input
            placeholder={t("search")}
            icon={<Search className="h-5 w-5" />}
            className="rounded-2xl border-slate-200/80 bg-white/80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {(["ALL", "DOCTOR", "ASSISTANT", "RECEPTIONIST", "ACCOUNTANT"] as const).map((role) => (
            <Button
              key={role}
              variant={filterRole === role ? "primary" : "outline"}
              className="rounded-xl px-4 py-1 h-9 whitespace-nowrap"
              onClick={() => setFilterRole(role)}
            >
              {role === "ALL" ? t("filterAll") : t(`roles.${role.toLowerCase()}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="group glass-card p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {member.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{member.fullName}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {t(`roles.${member.role.toLowerCase()}`)}
                  </span>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>

            <div className="space-y-2 text-sm">
              {member.specialty && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Award className="h-4 w-4" />
                  <span>{member.specialty}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <DollarSign className="h-4 w-4" />
                <span>{member.salary.toLocaleString()} EGP</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(member)}
                className="flex-1 rounded-xl"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant={member.isActive ? "outline" : "primary"}
                size="sm"
                onClick={() => handleToggleStatus(member.id)}
                className="rounded-xl"
              >
                {member.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(member.id)}
                className="rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12 glass-card">
          <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{t("noStaffFound")}</p>
        </div>
      )}
    </div>
  );
}
