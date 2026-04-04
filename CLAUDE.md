<!-- BEGIN:nextjs-agent-rules -->
@AGENTS.md

# 🦷 SmileCraft CMS — Context Snapshot
**Date:** April 2, 2026
**Status:** ✅ Prisma + Supabase Initialized - Ready for Migration

---

## 🏗️ Technical Stack
- **Framework**: Next.js 16 (App Router) + React 19.
- **Styling**: Tailwind CSS 4.2 (Glassmorphism, CSS Variables).
- **Localization**: `next-intl` (Arabic/English, RTL/LTR support).
- **Theming**: `next-themes` (Dark/Light mode via Sidebar).
- **Animations**: `framer-motion` (Spring indicators, Page transitions).
- **Type Safety**: Strict TypeScript (Branded primitives and defineRouting).
- **React Hook Form**: Utilized for form state management and validation.
- **Zod**: Data validation and parsing.
- **Database & BaaS**: ✅ Supabase (PostgreSQL) - Configured & Connected.
- **ORM**: ✅ Prisma Client v7.6 - Schema defined with 12 models.
- **Authentication**: Supabase Auth (pending integration with Next.js Middleware).
- **Backend Architecture**: Next.js Server Actions (`useActionState`) communicating directly with Supabase via Prisma Client. No external Node/Laravel API needed.
- **State Management**: `useClient` for local state, React 19 Actions for mutations.
- **Error Handling**: Comprehensive error logging and user feedback via Zod & Prisma Error Codes.

---

## 📦 Modules Progress

### 👥 Patients Module (100% UI - Pending DB)
- ✅ Full Desktop/Mobile Profile Layout.
- ✅ Medical History with Severity Alerts & In-place Editing.
- ✅ Treatment Timeline (Visual history of visits).
- ✅ **New Patient Intake Form**: Localized 3-step wizard with medical questionnaire.
- 🔄 **Persistence**: Migrating from `localStorage` (`patientService`) to Prisma/Supabase.

### 💸 Finance & Billing (100% UI - Pending DB)
- ✅ Universal Currency Formatting (EGP/ج.م).
- ✅ **Optimistic Payments**: Adding payments updates balance instantly.
- ✅ **Daily Revenue Widget**: Grouped by payment method (Cash/Card/Wallet).
- ✅ **Monthly Analytical Dashboard**: High-end charts for revenue and procedure tracking.
- ✅ **Print Support**: Semantic `@media print` layout for reports.


### 📅 Calendar & Appointments (100% UI - Pending DB)
- ✅ Full Interactive Monthly Grid with RTL Support.
- ✅ Client-side State Management (Date selection & Agenda sync).
- ✅ **Dynamic Agenda**: Polished "Glass-card" UI with localized date formatting.
- ✅ **Stable Re-fetching**: Optimized `useEffect` with stringified date dependencies.
- ✅ **Booking Form Modal**: Full appointment booking form with server action integration.


### 🦷 Clinical Module (100% UI - Pending DB)
- ✅ **Anatomical Odontogram**: Interactive teeth map with distinct SVG shapes.
- ✅ **Plan Builder**: Automated procedure generation and cost estimation.
- ✅ **Session Progress Tracking**: 3-state smart checkboxes per treatment item.
- ✅ **Optimistic Odontogram Sync**: `useOptimistic` changes tooth color instantly.
- 🔄 **Clinical Persistence**: Moving Odontogram state to JSONB columns in Supabase via Prisma.

- ✅ **Invoice Mode Dialog**: "Full plan" vs. "Completed items only" selection when converting to invoice.
- ✅ **Progress Bar**: Visual treatment completion percentage on the Plan Builder.
- ✅ **Completion History Timeline**: Mini timeline showing recent status changes with timestamps.
- ✅ **Patient Search Component**: Real-time filter by name/phone from mock data with animated dropdown (Framer Motion).
- ✅ **Patient Mini-Profile Card**: Compact card above Odontogram showing name, age, phone, city, blood group, allergies, and medical alerts.
- ✅ **Per-Patient Teeth Data**: Each mock patient has unique MouthMap data loaded on selection (`patientTeeth.mock.ts`).
- ✅ **Empty State UX**: Welcome message with search prompt when no patient is selected; Odontogram hidden.
- ✅ **Color Override System**: `ToothVisual` accepts `colorOverride` prop with glow ring SVG effect for completed treatments.

### 📊 Dashboard (100% UI - Pending DB)
- ✅ **Stats Grid**: 4 KPI cards.
- ✅ **Weekly Revenue Chart**: CSS bar chart.
- ✅ **Procedures Breakdown**: CSS donut chart.
- ✅ **Recent Activity Feed**: Timeline of last 5 clinic events.

### 🌐 Landing Page (100%)
- ✅ **Design**: Dark Mode Only (Slate-950) + Glassmorphism + Framer Motion animations.
- ✅ **Components**: Fully styled and responsive.

### 🔐 Auth Pages (100% UI - Pending DB Integration)
- ✅ **Login Page**: Split-screen dark design.
- 🔄 **Auth Integration**: Wiring up `loginAction.ts` to use Supabase Auth instead of mock credentials.


### ⚙️ Settings & Optimization (✅ 100% UI - Pending DB)
- ✅ **Glass-card UI**: Standardized premium aesthetics across Permissions and Service lists.
- ✅ **Permissions Matrix**: Role-based access control UI (localized).
- ✅ **Services Management**: Filterable service list with pricing and categorization.
- ✅ **Clinic Hours**: Working hours configuration.
- ✅ **Notification Settings**: Alert preferences.
- ✅ **Data Export**: Export functionality.

### 👨‍⚕️ Staff Management (✅ 100% UI - Pending DB)
- ✅ **Staff Profiles**: Name, specialty, certifications.
- ✅ **Staff Scheduling**: Interactive calendar.
- ✅ **Leave Management**: Leave tracking.
- ✅ **Payroll Management**: Salary tracking.

### 📦 Inventory (✅ 100% UI - Pending DB)
- ✅ **Inventory List**: Track consumables.
- ✅ **Inventory Form**: Add/edit items.
- ✅ **Stock Alerts**: Low-stock notifications.
- ✅ **Expiry Tracking**: Expiration date management.

---

## 🛠️ Key Architectural Patterns
1. **Full-Stack Next.js**: Eradicating external APIs. Next.js App Router handles both UI and Backend Logic using Prisma + Supabase.
2. **React 19 Actions**: Heavy use of `useActionState` and `useOptimistic`.
3. **Database Communication**: Strictly using Prisma Client inside Server Actions. Never expose direct database calls to the Client Components.
4. **Data Persistence**: Moving entirely away from `localStorage`. 
5. **Premium Visuals**: Glassmorphism and Tailwind 4 variables for a modern high-end feel.
6. **Route Groups**: `(dashboard)` for app, `(front-end)` for landing, `(auth)` for login.

---

## 🚀 Recommended Next Steps
1. **Complete Supabase Setup**: Update `.env` with correct credentials and run `npx prisma migrate dev`.
2. **Replace LocalStorage**: Refactor `patientService` and `clinicalService` to use Prisma queries.
3. **Auth Integration**: Connect Supabase Auth to Next.js middleware for secure RBAC (Role-Based Access Control).
4. **Build Server Actions**: Create Server Actions for Finance, Settings, Staff, and Inventory modules.

---

💡 Assistant Memory (Added for Claude/Qwen/AI Agents)
- **Tech Stack Rule**: YOU MUST use Prisma for database operations. DO NOT write raw SQL. DO NOT use `@supabase/supabase-js` for database CRUD unless strictly necessary for Auth or Storage.
- **RTL Preference**: When generating CSS, strictly avoid `right-` or `left-`. Use `-inset-inline-end-` for floating elements.
- **Component Style**: Prefer functional components with TypeScript interfaces defined above the component.
- **Environment**: You are working with a Senior Developer. Keep explanations technical, concise, and skip basic Next.js tutorials.

## ✅ Current Complete Modules

| Module | Status | Notes |
|--------|--------|---------|
| 👥 Patients | 100% | Full profile + Medical history + New intake wizard |
| 💸 Finance & Billing | 100% | Multi-currency (EGP) + Daily/ Monthly reports |
| 📅 Calendar & Appointments | 100% | Interactive RTL calendar + Booking form modal |
| 🦷 Clinical | 100% | Interactive teeth map + Session tracking + Patient search + Optimistic UI |
| 📊 Dashboard | 100% | 8 widgets: Revenue chart, Procedures, Quick Actions, Inventory, Activity, Birthdays, Lab, Balances |
| 🌐 Landing Page | 100% | 9-component dark SaaS landing with Framer Motion |
| 🔐 Auth (Login) | 100% | Split-screen dark design + Server Action + Zod validation |
| ⚙️ Settings | 100% UI | Permissions, Services, Clinic Hours, Notifications, Data Export |
| 👨‍⚕️ Staff | 100% UI | Profiles, Scheduling, Leave Management, Payroll |
| 📦 Inventory | 100% UI | Stock tracking, Alerts, Expiry management |
| 🗄️ Database | ✅ Setup | Prisma schema with 12 models, Supabase connected |

---

## 🔥 Recommended Additions (Priority-Based)

### 1️⃣ **Technical Infrastructure Upgrade** - *✅ Completed*
```typescript
// Status: Prisma + Supabase Initialized
- ✅ Prisma Schema with 12 models (Users, Patients, Appointments, Treatments, etc.)
- ✅ Supabase PostgreSQL connection configured
- ✅ Database migration ready to run
- 🔄 Next: Run migration and build Server Actions
```

### 2️⃣ **Settings Module** - *✅ 100% UI Complete*
```typescript
// Components ready:
- ✅ Permissions Matrix: Role-based access (Admin/Doctor/Reception)
- ✅ Services Management: Filterable list with pricing & categories
- ✅ Clinic Settings: Name, address, working hours, appointment slots
- ✅ Notification Settings
- ✅ Data Export functionality
```

### 3️⃣ **Staff Management** - *✅ 100% UI Complete*
```typescript
// Components ready:
- ✅ Staff Profiles (Name, Specialty, Certifications)
- ✅ Staff Scheduling with interactive calendar
- ✅ Leave Management & daily availability
- ✅ Payroll & salary tracking
```

### 4️⃣ **Inventory & Supplies Management** - *✅ 100% UI Complete*
```typescript
// Components ready:
- ✅ Track consumables (Anesthetics, Threads, Sterilization supplies)
- ✅ Low-stock alerts with notifications
- ✅ Expiration date tracking
- ✅ Stock reports by product
```

### 5️⃣ **Notifications & Reminders** - *Missing*
```typescript
// To Add:
- 🔔 Automated SMS/WhatsApp reminders 24h before appointments
- 📱 Push Notifications for schedule changes
- ✉️ Appointment confirmation from patients
```

### 6️⃣ **Advanced Analytics & Reporting** - *Marked as Next Steps*
```typescript
// Development:
- 📈 Reports by Specialty (Root Canal, Cosmetic...)
- 💰 ROI per Procedure (Cost vs. Revenue)
- ⏱️ Average procedure time + wait times
- 🔍 Doctor Performance Analysis (Cases/Reviews)
```

### 7️⃣ **External Integrations** - *Missing*
```typescript
// To Add:
- 🏥 Insurance Company Integration (Step-by-step setup)
- 📞 CRM System for customer management
- 🌐 Third-party booking portal integration
```

### 8️⃣ **User Experience Improvements** - *Ongoing Development*
```typescript
// Enhancements:
- ✅ Full Dark Mode Implementation (via next-themes)
- 📱 Mobile-responsive UI optimization
- ✅ Advanced Search for patients (Clinical Module patient search)
- 💾 Data Export/Import (Excel/PDF formats)
```

---

## 📋 Suggested Roadmap (Refocused for Supabase/Prisma)

| Phase | Priority | Tasks |
|-------|----------|---------|
| **Phase 1** | ✅ Done | Prisma Schema Setup + Supabase DB Connection + Auth Setup |
| **Phase 2** | 🔴 Critical | Run Migration + Build Server Actions for all modules |
| **Phase 3** | 🟡 High | Auth Integration + RBAC with Next.js Middleware |
| **Phase 4** | 🟢 Medium | Replace localStorage with Prisma + Real-time Sync |

| Phase | Priority | Tasks |
|-------|----------|---------|
| **Phase 1** | 🔴 Critical | Prisma Schema Setup + Supabase DB Connection + Auth Setup |
| **Phase 2** | 🔴 Critical | Refactor Modules from LocalStorage to Prisma Server Actions |
| **Phase 3** | 🟡 High | Staff Management + Notifications + Real-time Sync (Supabase Realtime) |
| **Phase 4** | 🟢 Medium | Advanced Analytics + Inventory System |

---

## 💡 Important Technical Notes

// ✅ Good Practices Currently Used:
- React 19 Actions (useOptimistic) for instant feedback.
- Unified Glassmorphism design system.
- Framer Motion AnimatePresence for smooth state transitions.

```


## 📁 Key File Paths

```
src/
├── app/
│   └── [locale]/
│       ├── (auth)/
│       │   ├── layout.tsx
│       │   ├── logoutAction.ts
│       │   └── login/                 → Login page + loginAction.ts
│       ├── (dashboard)/
│       │   ├── layout.tsx
│       │   ├── template.tsx
│       │   ├── not-found.tsx
│       │   ├── appointments/          → Appointments page + BookingForm modal
│       │   ├── billing/               → Billing management
│       │   ├── calendar/              → Calendar view
│       │   ├── clinical/              → Clinical module (Odontogram)
│       │   ├── dashboard/             → Main dashboard with 8 widgets
│       │   ├── finance/               → Financial management
│       │   ├── inventory/             → Inventory management
│       │   ├── patients/              → Patient management
│       │   ├── settings/              → System settings
│       │   └── staff/                 → Staff management
│       ├── (front-end)/
│       │   └── landing/               → Landing page
│       ├── [...not_found]/            → Catch-all not found route
│       ├── globals.css
│       ├── layout.tsx
│       ├── template.tsx
│       └── not-found.tsx
├── components/
│   ├── FeaturedProducts.tsx       → Featured products component
│   ├── PromoCard.tsx              → Promo card component
│   ├── Settings/
│   │   ├── LoadingOverlay.tsx
│   │   ├── LocaleSwitcher.tsx
│   │   ├── ThemeProviderWrapper.tsx
│   │   ├── ThemeSwitcher.tsx
│   │   └── TransitionEffect.tsx
│   ├── shared/
│   │   └── Sidebar.tsx            → Main navigation sidebar
│   ├── SharesComponent/
│   │   ├── Button.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── Logo.tsx
│   │   ├── MotionWrapper.tsx
│   │   ├── Pagination.tsx
│   │   ├── SectionHrader.tsx
│   │   └── StarRating.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── CustomButton.tsx
│       └── Input.tsx
├── constant/
│   └── button-variants.ts         → Button variant configurations
├── features/
│   ├── appointments/
│   │   ├── index.ts
│   │   ├── actions/               → Server actions for appointments
│   │   ├── components/            → DailyAgenda, BookingForm, CalendarGrid
│   │   ├── services/              → Appointment service layer
│   │   └── types/                 → TypeScript types for appointments
│   ├── calendar/
│   │   ├── index.ts
│   │   └── components/            → Calendar components
│   ├── clinical/
│   │   ├── index.ts
│   │   ├── actions.ts             → Clinical server actions
│   │   ├── components/            → Odontogram, PatientSearch, PlanBuilder
│   │   ├── hooks/                 → Custom React hooks
│   │   ├── mock/                  → Mock data for development
│   │   ├── services/              → Clinical service layer
│   │   └── types/                 → TypeScript types for clinical
│   ├── dashboard/
│   │   └── components/            → 10 widgets (Stats, Revenue, Procedures, etc.)
│   ├── finance/
│   │   ├── index.ts
│   │   ├── components/            → Payments, DailyRevenue, MonthlyDashboard
│   │   ├── mock/                  → Mock financial data
│   │   └── types/                 → TypeScript types for finance
│   ├── inventory/
│   │   ├── components/            → Inventory management UI
│   │   ├── services/              → Inventory service layer
│   │   └── types/                 → TypeScript types for inventory
│   ├── landing/
│   │   ├── index.ts
│   │   ├── landing.css            → Landing page styles
│   │   └── components/            → 9 landing page sections
│   ├── patients/
│   │   ├── index.ts
│   │   ├── actions.ts             → Patient server actions
│   │   ├── components/            → Profile, MedicalHistory, IntakeWizard
│   │   ├── constants/             → Patient-related constants
│   │   ├── hooks/                 → Custom React hooks
│   │   ├── mock/                  → Mock patient data
│   │   ├── services/              → Patient service layer
│   │   └── types/                 → TypeScript types for patients
│   ├── settings/
│   │   ├── components/            → Permissions, Services management
│   │   ├── hooks/                 → Custom React hooks
│   │   └── types/                 → TypeScript types for settings
│   ├── staff/
│   │   ├── components/            → Staff management UI
│   │   ├── services/              → Staff service layer
│   │   └── types/                 → TypeScript types for staff
│   └── video-processor/
│       ├── components/            → Video processing UI
│       └── hooks/                 → Video processing hooks
├── i18n/
│   ├── request.ts                 → i18n request configuration
│   └── routing.ts                 → Routing configuration for locales
├── lib/
│   ├── apiClient.ts               → API client utility
│   ├── utils.ts                   → Utility functions
│   └── utils/
│       └── id.ts                  → ID generation utilities
├── locales/
│   ├── ar.json                    → Arabic translations
│   └── en.json                    → English translations
├── models/
│   └── product.ts                 → Product data model
├── services/
│   └── videoService.ts            → Video processing service
├── types/
│   └── video.ts                   → Video-related TypeScript types
└── middleware.ts                  → Next.js middleware for auth & routing
```

---

## 🎯 Summary

SmileCraft CMS is a comprehensive dental clinic management SaaS with **10 complete modules**, a **professional dark-themed landing page**, and a **split-screen auth system**. The dashboard includes **10 intelligent widgets** covering revenue, procedures, inventory, lab tracking, patient CRM, and more. All UI is fully RTL Arabic with premium Glassmorphism aesthetics.

---

## 🗄️ Database Schema (Prisma)

**12 Models Implemented:**

1. **User** - System users with role-based access (Admin/Doctor/Receptionist/Assistant)
2. **Patient** - Patient profiles with medical history, mouth map, allergies
3. **Appointment** - Scheduling with status tracking and doctor assignment
4. **Treatment** - Clinical procedures with tooth mapping and status tracking
5. **Payment** - Financial transactions with multiple payment methods
6. **Invoice** - Billing with line items and payment tracking
7. **InvoiceItem** - Invoice line items linked to treatments
8. **Service** - Procedure catalog with pricing and categories
9. **InventoryItem** - Stock management with expiry tracking
10. **Staff** - Employee records with payroll
11. **Notification** - System notifications and alerts
12. **MedicalHistory** - Embedded JSON in Patient model

**Next Step:** Update `.env` with your Supabase credentials and run:
```bash
npx prisma migrate dev --name init
```
