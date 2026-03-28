"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LeaveRequest, LeaveType } from "../types";
import { staffService } from "../services/staffService";

interface LeaveManagementProps {
  staffId?: string;
}

export function LeaveManagement({ staffId }: LeaveManagementProps) {
  const t = useTranslations("Staff.leaves");
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => staffService.getAllLeaves());
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaveType>("ANNUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const filteredLeaves = useMemo(() => {
    let allLeaves = leaves;
    if (staffId) {
      allLeaves = allLeaves.filter((l) => l.staffId === staffId);
    }
    return allLeaves.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [leaves, staffId]);

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertCircle className="h-3 w-3" />
            {t("status.pending")}
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            {t("status.approved")}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            {t("status.rejected")}
          </span>
        );
    }
  };

  const getTypeBadge = (type: LeaveType) => {
    switch (type) {
      case "ANNUAL":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "SICK":
        return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "EMERGENCY":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "UNPAID":
        return "bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const handleSubmitRequest = () => {
    if (!startDate || !endDate || !reason) return;

    const staff = staffService.getAllStaff()[0]; // Default to first staff for demo
    if (!staff) return;

    staffService.submitLeaveRequest({
      staffId: staff.id,
      type: selectedType,
      startDate,
      endDate,
      reason,
    });

    setLeaves(staffService.getAllLeaves());
    setShowRequestForm(false);
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleReview = (leaveId: string, approve: boolean) => {
    if (approve) {
      staffService.approveLeaveRequest(leaveId, "admin");
    } else {
      staffService.rejectLeaveRequest(leaveId, "admin");
    }
    setLeaves(staffService.getAllLeaves());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarOff className="h-5 w-5" />
          {t("title")}
        </h2>
        {!staffId && (
          <Button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="rounded-2xl shadow-emerald-500/20 shadow-lg"
          >
            <CalendarOff className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            {t("requestLeave")}
          </Button>
        )}
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="glass-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-900 dark:text-white">{t("newRequest")}</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("type")}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as LeaveType)}
                className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-800"
              >
                <option value="ANNUAL">{t("types.annual")}</option>
                <option value="SICK">{t("types.sick")}</option>
                <option value="EMERGENCY">{t("types.emergency")}</option>
                <option value="UNPAID">{t("types.unpaid")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("startDate")}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("endDate")}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("reason")}
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("reasonPlaceholder")}
                className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRequestForm(false)}
              className="rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!startDate || !endDate || !reason}
              className="rounded-2xl"
            >
              {t("submitRequest")}
            </Button>
          </div>
        </div>
      )}

      {/* Leaves List */}
      <div className="space-y-3">
        {filteredLeaves.map((leave) => {
          const staff = staffService.getStaffById(leave.staffId);
          return (
            <div
              key={leave.id}
              className="glass-card p-4 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {staff?.fullName || t("unknownStaff")}
                      </span>
                      {getStatusBadge(leave.status)}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadge(leave.type)}`}>
                        {t(`types.${leave.type.toLowerCase()}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                      <FileText className="h-4 w-4" />
                      {leave.reason}
                    </div>
                  </div>
                </div>

                {leave.status === "PENDING" && !staffId && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(leave.id, true)}
                      className="rounded-xl text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(leave.id, false)}
                      className="rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredLeaves.length === 0 && (
          <div className="text-center py-12 glass-card">
            <CalendarOff className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{t("noLeaves")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
