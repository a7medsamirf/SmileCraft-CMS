import { StaffMember, LeaveRequest, StaffSchedule, PayrollRecord } from "../types";

const STAFF_STORAGE_KEY = "dental_staff_data";
const LEAVES_STORAGE_KEY = "dental_leaves_data";
const SCHEDULES_STORAGE_KEY = "dental_staff_schedules";
const PAYROLL_STORAGE_KEY = "dental_staff_payroll";

const MOCK_STAFF: StaffMember[] = [
  {
    id: "1",
    fullName: "Dr. Ahmed Samir",
    role: "DOCTOR",
    specialty: "Orthodontics",
    certifications: ["BDS", "MDS Orthodontics"],
    email: "ahmed@smilecraft.com",
    phone: "+20 123 456 7890",
    joinDate: "2022-01-15",
    salary: 25000,
    isActive: true,
    avatarUrl: "/avatars/doctor1.jpg",
  },
  {
    id: "2",
    fullName: "Dr. Sarah Mahmoud",
    role: "DOCTOR",
    specialty: "Pediatric Dentistry",
    certifications: ["BDS", "Pediatric Dentistry Certificate"],
    email: "sarah@smilecraft.com",
    phone: "+20 123 456 7891",
    joinDate: "2022-06-01",
    salary: 22000,
    isActive: true,
  },
  {
    id: "3",
    fullName: "Nour Hassan",
    role: "ASSISTANT",
    specialty: "Dental Assistant",
    certifications: ["Dental Assistant Certificate"],
    email: "nour@smilecraft.com",
    phone: "+20 123 456 7892",
    joinDate: "2023-03-10",
    salary: 8000,
    isActive: true,
  },
  {
    id: "4",
    fullName: "Mariam Khaled",
    role: "RECEPTIONIST",
    specialty: "Receptionist",
    certifications: [],
    email: "mariam@smilecraft.com",
    phone: "+20 123 456 7893",
    joinDate: "2023-01-20",
    salary: 7000,
    isActive: true,
  },
];

export const staffService = {
  getAllStaff: (): StaffMember[] => {
    if (typeof window === "undefined") return MOCK_STAFF;
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_STAFF;
  },

  getStaffById: (id: string): StaffMember | undefined => {
    const staff = staffService.getAllStaff();
    return staff.find((s) => s.id === id);
  },

  getStaffByRole: (role: string): StaffMember[] => {
    const staff = staffService.getAllStaff();
    return staff.filter((s) => s.role === role);
  },

  saveStaff: (staff: StaffMember): void => {
    const allStaff = staffService.getAllStaff();
    const index = allStaff.findIndex((s) => s.id === staff.id);

    if (index >= 0) {
      allStaff[index] = staff;
    } else {
      allStaff.push(staff);
    }

    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(allStaff));
  },

  deleteStaff: (id: string): void => {
    const allStaff = staffService.getAllStaff();
    const filtered = allStaff.filter((s) => s.id !== id);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(filtered));
  },

  toggleStaffStatus: (id: string): void => {
    const allStaff = staffService.getAllStaff();
    const staff = allStaff.find((s) => s.id === id);
    if (staff) {
      staff.isActive = !staff.isActive;
      staffService.saveStaff(staff);
    }
  },

  // Leave Management
  getAllLeaves: (): LeaveRequest[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(LEAVES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getLeavesByStaffId: (staffId: string): LeaveRequest[] => {
    const leaves = staffService.getAllLeaves();
    return leaves.filter((l) => l.staffId === staffId);
  },

  submitLeaveRequest: (leave: Omit<LeaveRequest, "id" | "status" | "requestedAt">): LeaveRequest => {
    const leaves = staffService.getAllLeaves();
    const newLeave: LeaveRequest = {
      ...leave,
      id: crypto.randomUUID(),
      status: "PENDING",
      requestedAt: new Date().toISOString(),
    };
    leaves.push(newLeave);
    localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(leaves));
    return newLeave;
  },

  approveLeaveRequest: (leaveId: string, reviewedBy: string): void => {
    const leaves = staffService.getAllLeaves();
    const leave = leaves.find((l) => l.id === leaveId);
    if (leave) {
      leave.status = "APPROVED";
      leave.reviewedAt = new Date().toISOString();
      leave.reviewedBy = reviewedBy;
      localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(leaves));
    }
  },

  rejectLeaveRequest: (leaveId: string, reviewedBy: string): void => {
    const leaves = staffService.getAllLeaves();
    const leave = leaves.find((l) => l.id === leaveId);
    if (leave) {
      leave.status = "REJECTED";
      leave.reviewedAt = new Date().toISOString();
      leave.reviewedBy = reviewedBy;
      localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(leaves));
    }
  },

  // Staff Schedule
  getStaffSchedule: (staffId: string, weekStart: string): StaffSchedule | undefined => {
    const schedules = staffService.getAllSchedules();
    return schedules.find((s) => s.staffId === staffId && s.weekStart === weekStart);
  },

  getAllSchedules: (): StaffSchedule[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveStaffSchedule: (schedule: StaffSchedule): void => {
    const schedules = staffService.getAllSchedules();
    const index = schedules.findIndex(
      (s) => s.staffId === schedule.staffId && s.weekStart === schedule.weekStart,
    );

    if (index >= 0) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }

    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  },

  // Payroll
  getAllPayrollRecords: (): PayrollRecord[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(PAYROLL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getPayrollByStaffId: (staffId: string): PayrollRecord[] => {
    const records = staffService.getAllPayrollRecords();
    return records.filter((r) => r.staffId === staffId);
  },

  getPayrollByMonth: (month: string): PayrollRecord[] => {
    const records = staffService.getAllPayrollRecords();
    return records.filter((r) => r.month === month);
  },

  savePayrollRecord: (record: PayrollRecord): void => {
    const records = staffService.getAllPayrollRecords();
    const index = records.findIndex((r) => r.id === record.id);

    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }

    localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(records));
  },

  generateMonthlyPayroll: (month: string): void => {
    const staff = staffService.getAllStaff();
    const existingRecords = staffService.getPayrollByMonth(month);
    
    staff.forEach(member => {
      const exists = existingRecords.some(r => r.staffId === member.id);
      if (!exists && member.isActive) {
        const record: PayrollRecord = {
          id: crypto.randomUUID(),
          staffId: member.id,
          month,
          baseSalary: member.salary,
          bonuses: 0,
          deductions: 0,
          net: member.salary,
          status: "PENDING",
        };
        staffService.savePayrollRecord(record);
      }
    });
  },

  getPayrollSummary: (staffId: string): { baseSalary: number; bonuses: number; deductions: number; net: number } => {
    const records = staffService.getPayrollByStaffId(staffId);
    if (records.length === 0) {
      const staff = staffService.getStaffById(staffId);
      return { baseSalary: staff?.salary || 0, bonuses: 0, deductions: 0, net: staff?.salary || 0 };
    }
    
    const latest = records.sort((a, b) => b.month.localeCompare(a.month))[0];
    return {
      baseSalary: latest.baseSalary,
      bonuses: latest.bonuses,
      deductions: latest.deductions,
      net: latest.net
    };
  },
};
