import React from "react";
import { StaffClient } from "@/features/staff/components/StaffClient";
import { getStaffMembersAction } from "@/features/staff/serverActions";
import type { StaffMember } from "@/features/staff/types";

export const metadata = {
  title: "الموظفين | SmileCraft CMS",
};

export default async function StaffPage() {
  let initialStaff: StaffMember[] = [];

  try {
    initialStaff = await getStaffMembersAction();
  } catch (error) {
    console.error("Failed to load staff list:", error);
  }

  return <StaffClient initialStaff={initialStaff} />;
}
