// =============================================================================
// DENTAL CMS — Patients Module: Mock / Seed Data
// features/patients/mock/patients.mock.ts
//
// Purpose:
//   Realistic Arabic patient records for UI development and Storybook stories.
//   Replace with real API calls once the backend is wired up.
// =============================================================================

import {
  BloodGroup,
  Gender,
  Patient,
  PatientStatus,
  VisitType,
} from "../types";

// Helpers to cast plain strings to branded types without runtime cost
const id       = (s: string) => s as Patient["id"];
/** Cast to ISODateTimeString (with time component) */
const date     = (s: string) => s as Patient["createdAt"];
/** Cast to ISODateString (date-only, YYYY-MM-DD) */
const dateOnly = (s: string) => s as Patient["birthDate"];

export const MOCK_PATIENTS: Patient[] = [
  // ─── Patient 1 ────────────────────────────────────────────────────────────
  {
    id:        id("a1b2c3d4-0001-0001-0001-000000000001"),
    fullName:  "أحمد محمد السيد",
    gender:    Gender.MALE,
    birthDate: dateOnly("1985-04-12"),
    age:       39,
    photoUrl:  undefined,

    contactInfo: {
      phone:    "+201012345678",
      altPhone: "+20225551234",
      email:    "ahmed.sayed@example.com",
      address:  "15 شارع التحرير، الدقي",
      city:     "الجيزة",
    },

    emergencyContact: {
      name:         "منى محمد",
      relationship: "زوجة",
      phone:        "+201098765432",
    },

    medicalHistory: {
      conditions: [
        {
          condition:    "داء السكري من النوع الثاني",
          isActive:     true,
          notes:        "تحت السيطرة بالأدوية الفموية",
          diagnosedAt:  dateOnly("2018-03-01"),
        },
      ],
      allergies: [
        { allergen: "البنسلين", reaction: "طفح جلدي", severity: "MODERATE" },
      ],
      currentMedications: ["Metformin 500mg", "Aspirin 81mg"],
      previousDentalHistory: [
        "قلع الضرس العقلي العلوي الأيسر – 2019",
        "حشو تجميلي للضرس رقم 26 – 2021",
      ],
      generalNotes: "المريض قلق من الألم، يُفضَّل استخدام التخدير الموضعي الكافي",
      bloodGroup:   BloodGroup.A_POS,
      heightCm:     175,
      weightKg:     88,
    },

    xrayCount: 4,
    visits: [
      {
        id:             id("v-0001-001"),
        visitDate:      date("2024-11-20T10:00:00Z"),
        type:           VisitType.TREATMENT,
        dentistName:    "د. سارة أحمد",
        chiefComplaint: "حشو تجميلي كومبوزيت ضرس رقم 16",
        totalBilled:    850,
        isPaid:         true,
      },
      {
        id:             id("v-0001-002"),
        visitDate:      date("2025-01-08T09:30:00Z"),
        type:           VisitType.FOLLOW_UP,
        dentistName:    "د. سارة أحمد",
        chiefComplaint: "متابعة ما بعد الحشو",
        totalBilled:    200,
        isPaid:         true,
      },
    ],

    status:             PatientStatus.ACTIVE,
    nationalId:         "28504120012345",
    assignedDentistId:  id("dentist-001"),
    createdAt:          date("2024-10-01T08:00:00Z"),
    updatedAt:          date("2025-01-08T09:30:00Z"),
    lastVisit:          date("2025-01-08T09:30:00Z"),
  },

  // ─── Patient 2 ────────────────────────────────────────────────────────────
  {
    id:        id("a1b2c3d4-0002-0002-0002-000000000002"),
    fullName:  "نور عبدالرحمن خالد",
    gender:    Gender.FEMALE,
    birthDate: dateOnly("1998-09-25"),
    age:       26,

    contactInfo: {
      phone:  "+201155566677",
      email:  "nour.khaled@example.com",
      city:   "القاهرة",
      address: "مدينة نصر، الحي العاشر",
    },

    medicalHistory: {
      conditions: [],
      allergies: [
        { allergen: "اللاتكس", reaction: "حكة وتورم", severity: "SEVERE" },
      ],
      currentMedications: [],
      previousDentalHistory: ["تركيب تقويم معدني – 2020", "خلع 4 أضراس لأغراض التقويم – 2020"],
      bloodGroup: BloodGroup.O_NEG,
      heightCm:   163,
      weightKg:   55,
    },

    xrayCount: 8,
    visits: [
      {
        id:             id("v-0002-001"),
        visitDate:      date("2025-02-14T11:00:00Z"),
        type:           VisitType.CONSULTATION,
        dentistName:    "د. كريم منصور",
        chiefComplaint: "ألم في منطقة التقويم – السلك العلوي",
        totalBilled:    500,
        isPaid:         false,
      },
    ],

    status:            PatientStatus.ACTIVE,
    nationalId:        "29809250034567",
    assignedDentistId: id("dentist-002"),
    createdAt:         date("2025-02-10T10:00:00Z"),
    updatedAt:         date("2025-02-14T11:00:00Z"),
    lastVisit:         date("2025-02-14T11:00:00Z"),
  },

  // ─── Patient 3 ────────────────────────────────────────────────────────────
  {
    id:        id("a1b2c3d4-0003-0003-0003-000000000003"),
    fullName:  "محمود فتحي إبراهيم",
    gender:    Gender.MALE,
    birthDate: dateOnly("1965-01-30"),
    age:       60,

    contactInfo: {
      phone:   "+201011223344",
      altPhone: "+20222334455",
      city:    "الإسكندرية",
      address: "سموحة، شارع هولندا",
    },

    emergencyContact: {
      name:         "عمر محمود",
      relationship: "ابن",
      phone:        "+201222334455",
    },

    medicalHistory: {
      conditions: [
        { condition: "ارتفاع ضغط الدم", isActive: true,  notes: "Amlodipine 5mg يومياً" },
        { condition: "أمراض القلب – دعامة إكليلية", isActive: true, notes: "2019", diagnosedAt: dateOnly("2019-06-01") },
      ],
      allergies: [],
      currentMedications: ["Amlodipine 5mg", "Aspirin 100mg", "Atorvastatin 40mg"],
      previousDentalHistory: [
        "تركيب طقم أسنان كامل علوي – 2016",
        "إزالة جذور أضراس سفلية – 2015",
      ],
      generalNotes: "يجب التنسيق مع طبيب القلب قبل أي تدخل جراحي. يأخذ مضادات التخثر.",
      bloodGroup:  BloodGroup.B_POS,
      heightCm:    170,
      weightKg:    95,
    },

    xrayCount:         2,
    visits: [
      {
        id:             id("v-0003-001"),
        visitDate:      date("2023-08-05T09:00:00Z"),
        type:           VisitType.TREATMENT,
        dentistName:    "د. سارة أحمد",
        chiefComplaint: "تعديل الطقم العلوي",
        totalBilled:    600,
        isPaid:         true,
      },
    ],

    status:    PatientStatus.INACTIVE,
    nationalId: "26501300056789",
    createdAt:  date("2015-06-01T08:00:00Z"),
    updatedAt:  date("2023-08-05T09:00:00Z"),
    lastVisit:  date("2023-08-05T09:00:00Z"),
  },

  // ─── Patient 4 (Emergency Case) ───────────────────────────────────────────
  {
    id:        id("a1b2c3d4-0004-0004-0004-000000000004"),
    fullName:  "ريم يوسف الشامي",
    gender:    Gender.FEMALE,
    birthDate: dateOnly("2005-12-03"),
    age:       19,

    contactInfo: {
      phone:   "+201033445566",
      city:    "القاهرة",
      address: "مصر الجديدة، شارع اللواء",
    },

    medicalHistory: {
      conditions: [],
      allergies:  [],
      currentMedications: [],
      bloodGroup: BloodGroup.AB_POS,
      heightCm:   160,
      weightKg:   52,
    },

    xrayCount: 1,
    visits: [
      {
        id:             id("v-0004-001"),
        visitDate:      date("2025-03-20T18:30:00Z"),
        type:           VisitType.EMERGENCY,
        dentistName:    "د. كريم منصور",
        chiefComplaint: "ألم حاد في ضرس العقل السفلي الأيمن",
        totalBilled:    750,
        isPaid:         false,
      },
    ],

    status:    PatientStatus.ACTIVE,
    createdAt: date("2025-03-20T18:00:00Z"),
    updatedAt: date("2025-03-20T18:30:00Z"),
    lastVisit: date("2025-03-20T18:30:00Z"),
  },
];
