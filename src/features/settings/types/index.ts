export type ServiceCategory = "SURGERY" | "COSMETIC" | "PEDIATRICS" | "GENERAL";

export interface DentalService {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  duration: number; // in minutes
}

export type PermissionRole = "ADMIN" | "RECEPTIONIST" | "ACCOUNTANT";

export interface Permission {
  id: string;
  nameKey: string; // key in locale file
  roles: PermissionRole[];
}

export interface BusinessDay {
  day: string;
  isOpen: boolean;
  start: string;
  end: string;
}

export interface ClinicSettings {
  services: DentalService[];
  businessHours: BusinessDay[];
  lastBackup: string | null;
}
