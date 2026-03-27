import { Patient } from "../types/index";

const STORAGE_KEY = "dental_patients_data";

export const patientService = {
  getPatients: (): Patient[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getPatientById: (id: string): Patient | undefined => {
    const patients = patientService.getPatients();
    return patients.find(p => p.id === id);
  },

  savePatient: (patient: Patient): void => {
    const patients = patientService.getPatients();
    const index = patients.findIndex(p => p.id === patient.id);
    
    if (index >= 0) {
      patients[index] = patient;
    } else {
      patients.push(patient);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  },

  deletePatient: (id: string): void => {
    const patients = patientService.getPatients();
    const filtered = patients.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
