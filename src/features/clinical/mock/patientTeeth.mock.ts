// =============================================================================
// DENTAL CMS — Clinical Module: Mock Teeth Data per Patient
// features/clinical/mock/patientTeeth.mock.ts
//
// Maps patient IDs to pre-defined MouthMap data for demo purposes.
// =============================================================================

import { MouthMap, ToothStatus, generateEmptyMouthMap } from "../types/odontogram";

/**
 * Generates per-patient teeth data by overwriting specific teeth statuses
 * on top of a healthy baseline.
 */
function withOverrides(
  overrides: Array<{ id: number; status: ToothStatus; notes?: string }>,
): MouthMap {
  const base = generateEmptyMouthMap();
  for (const ov of overrides) {
    const tooth = base.find((t) => t.id === ov.id);
    if (tooth) {
      tooth.status = ov.status;
      if (ov.notes) tooth.notes = ov.notes;
    }
  }
  return base;
}

/**
 * Per-patient teeth clinical state.
 * Key = Patient UUID from patients.mock.ts
 */
export const PATIENT_TEETH_MAP: Record<string, MouthMap> = {
  // أحمد محمد السيد — تسوس 2, حشو 16 (from visit history)
  "a1b2c3d4-0001-0001-0001-000000000001": withOverrides([
    { id: 2,  status: ToothStatus.CARIOUS,    notes: "تسوس عميق في السطح الإنسي" },
    { id: 16, status: ToothStatus.FILLING,    notes: "حشو كومبوزيت — متابعة 2025/01" },
    { id: 14, status: ToothStatus.ROOT_CANAL, notes: "سحب عصب سابق — الضرس تحت المراقبة" },
  ]),

  // نور عبدالرحمن خالد — 4 خلع تقويم, تسوس بسيط
  "a1b2c3d4-0002-0002-0002-000000000002": withOverrides([
    { id: 4,  status: ToothStatus.MISSING, notes: "خلع لأغراض التقويم" },
    { id: 13, status: ToothStatus.MISSING, notes: "خلع لأغراض التقويم" },
    { id: 20, status: ToothStatus.MISSING, notes: "خلع لأغراض التقويم" },
    { id: 29, status: ToothStatus.MISSING, notes: "خلع لأغراض التقويم" },
    { id: 8,  status: ToothStatus.CARIOUS, notes: "تسوس سطحي بسيط" },
  ]),

  // محمود فتحي إبراهيم — طقم علوي كامل + جذور سفلية مزالة
  "a1b2c3d4-0003-0003-0003-000000000003": withOverrides([
    // Upper arch — all missing (denture)
    ...Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      status: ToothStatus.MISSING as ToothStatus,
      notes: "طقم أسنان كامل علوي",
    })),
    { id: 17, status: ToothStatus.CROWN,   notes: "تاج مؤقت" },
    { id: 30, status: ToothStatus.MISSING, notes: "جذر مزال 2015" },
    { id: 31, status: ToothStatus.MISSING, notes: "جذر مزال 2015" },
  ]),

  // ريم يوسف الشامي — ضرس عقل ملتهب
  "a1b2c3d4-0004-0004-0004-000000000004": withOverrides([
    { id: 32, status: ToothStatus.CARIOUS, notes: "ضرس العقل السفلي الأيمن — ألم حاد" },
    { id: 1,  status: ToothStatus.CARIOUS, notes: "تسوس بداية" },
  ]),
};
