"use client";

import { useState, useOptimistic, useTransition } from "react";
import { DentalService, BusinessDay } from "../types";

const MOCK_SERVICES: DentalService[] = [
  { id: "1", name: "حشو ليزر (Laser Filling)", category: "GENERAL", price: 800, duration: 45 },
  { id: "2", name: "خلع ضرس عقل (Wisdom Extraction)", category: "SURGERY", price: 1200, duration: 60 },
  { id: "3", name: "تبييض أسنان (Teeth Whitening)", category: "COSMETIC", price: 3500, duration: 90 },
  { id: "4", name: "كشف أطفال (Pediatric Exam)", category: "PEDIATRICS", price: 300, duration: 30 },
];

const MOCK_HOURS: BusinessDay[] = [
  { day: "Saturday", isOpen: true, start: "10:00", end: "22:00" },
  { day: "Sunday", isOpen: true, start: "10:00", end: "22:00" },
  { day: "Monday", isOpen: true, start: "10:00", end: "22:00" },
  { day: "Tuesday", isOpen: true, start: "10:00", end: "22:00" },
  { day: "Wednesday", isOpen: true, start: "10:00", end: "22:00" },
  { day: "Thursday", isOpen: true, start: "10:00", end: "18:00" },
  { day: "Friday", isOpen: false, start: "00:00", end: "00:00" },
];

export function useClinicSettings() {
  const [services, setServices] = useState<DentalService[]>(MOCK_SERVICES);
  const [hours, setHours] = useState<BusinessDay[]>(MOCK_HOURS);
  const [isPending, startTransition] = useTransition();

  // Optimistic update for service prices
  const [optimisticServices, addOptimisticService] = useOptimistic(
    services,
    (state, updatedService: DentalService) => {
      return state.map((s) => (s.id === updatedService.id ? updatedService : s));
    }
  );

  const updateServicePrice = async (serviceId: string, newPrice: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const updated = { ...service, price: newPrice };
    
    // 1. Optimistic update
    startTransition(() => {
      addOptimisticService(updated);
    });

    // 2. Mock API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 3. Final update
    setServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)));
  };

  const updateBusinessHours = (updatedHours: BusinessDay[]) => {
    setHours(updatedHours);
  };

  return {
    services: optimisticServices,
    updateServicePrice,
    hours,
    updateBusinessHours,
    isSaving: isPending,
  };
}
