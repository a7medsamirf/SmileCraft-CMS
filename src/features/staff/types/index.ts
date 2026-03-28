export type StaffRole = "DOCTOR" | "ASSISTANT" | "RECEPTIONIST" | "ACCOUNTANT";

export type LeaveType = "ANNUAL" | "SICK" | "EMERGENCY" | "UNPAID";

export interface StaffMember {
  id: string;
  fullName: string;
  role: StaffRole;
  specialty?: string;
  certifications: string[];
  email: string;
  phone: string;
  joinDate: string;
  salary: number;
  isActive: boolean;
  avatarUrl?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface StaffSchedule {
  staffId: string;
  weekStart: string;
  shifts: {
    date: string;
    startTime: string;
    endTime: string;
    isOnCall: boolean;
  }[];
}

export type PayrollStatus = "PENDING" | "PAID" | "CANCELLED";

export interface PayrollRecord {
  id: string;
  staffId: string;
  month: string; // YYYY-MM
  baseSalary: number;
  bonuses: number;
  deductions: number;
  net: number;
  status: PayrollStatus;
  paidAt?: string;
  paymentMethod?: "CASH" | "TRANSFER" | "CHECK";
  note?: string;
}
