# 🦷 SmileCraft CMS — Context Snapshot
**Date:** March 29, 2026
**Status:** Core Feature-Complete (Patients, Finance, Clinical, Calendar, Dashboard, Landing, Auth)

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
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: NextAuth.js with JWT tokens.
- **Authorization**: Role-based access control (RBAC) with `next-auth` middleware.
- **API**: RESTful API with JSON responses.
- **Server**: `next-auth` for authentication, Prisma for database operations.
- **Client**: React 19 with `useActionState` for server actions.
- **State Management**: `useClient` for local state management.
- **Error Handling**: Comprehensive error logging and user feedback.
- **Performance**: Optimized for fast load times and smooth interactions.


---

## 📦 Modules Progress

### 👥 Patients Module (100%)
- ✅ Full Desktop/Mobile Profile Layout.
- ✅ Medical History with Severity Alerts & In-place Editing.
- ✅ Treatment Timeline (Visual history of visits).
- ✅ **New Patient Intake Form**: Localized 3-step wizard with medical questionnaire.
- ✅ **Persistence**: `patientService` managing records via local storage.

### 💸 Finance & Billing (100%)
- ✅ Universal Currency Formatting (EGP/ج.م).
- ✅ **Optimistic Payments**: Adding payments updates balance instantly.
- ✅ **Daily Revenue Widget**: Grouped by payment method (Cash/Card/Wallet).
- ✅ **Monthly Analytical Dashboard**: High-end charts for revenue and procedure tracking.
- ✅ **Print Support**: Semantic `@media print` layout for reports.

### 📅 Calendar & Appointments (100%)
- ✅ Full Interactive Monthly Grid with RTL Support.
- ✅ Client-side State Management (Date selection & Agenda sync).
- ✅ **Dynamic Agenda**: Polished "Glass-card" UI with localized date formatting.
- ✅ **Stable Re-fetching**: Optimized `useEffect` with stringified date dependencies.
- ✅ **Booking Form Modal**: Full appointment booking form with:
  - Patient name & phone fields.
  - Date picker + Duration selector (15 min → 2 hours).
  - 12 procedure types (حشو عصب، تنظيف، تقويم، زراعة...).
  - Interactive time slot grid (17 slots, 9 AM → 5 PM) with available/booked/selected states.
  - Notes textarea, Zod validation, Arabic error messages, success animation.
  - Server Action (`bookAppointmentAction.ts`) with `useActionState`.

### 🦷 Clinical Module (100%)
- ✅ **Anatomical Odontogram**: Interactive teeth map with distinct SVG shapes.
- ✅ **Clinical Persistence**: Status and treatment plans saved/loaded from storage.
- ✅ **Plan Builder**: Automated procedure generation and cost estimation.
- ✅ **Plan to Invoice**: React 19 actions to convert plans to financial bills.
- ✅ **Session Progress Tracking**: 3-state smart checkboxes (Planned → In-Progress → Completed) per treatment item.
- ✅ **Optimistic Odontogram Sync**: `useOptimistic` changes tooth color instantly on status change (e.g., red→blue) with pulse animation.
- ✅ **Invoice Mode Dialog**: "Full plan" vs. "Completed items only" selection when converting to invoice.
- ✅ **Progress Bar**: Visual treatment completion percentage on the Plan Builder.
- ✅ **Completion History Timeline**: Mini timeline showing recent status changes with timestamps.
- ✅ **Patient Search Component**: Real-time filter by name/phone from mock data with animated dropdown (Framer Motion).
- ✅ **Patient Mini-Profile Card**: Compact card above Odontogram showing name, age, phone, city, blood group, allergies, and medical alerts.
- ✅ **Per-Patient Teeth Data**: Each mock patient has unique MouthMap data loaded on selection (`patientTeeth.mock.ts`).
- ✅ **Empty State UX**: Welcome message with search prompt when no patient is selected; Odontogram hidden.
- ✅ **Color Override System**: `ToothVisual` accepts `colorOverride` prop with glow ring SVG effect for completed treatments.

### 📊 Dashboard (100%)
- ✅ **Stats Grid**: 4 KPI cards (Today's appointments, New patients, Pending plans, Revenue).
- ✅ **Weekly Revenue Chart**: CSS bar chart for 7-day revenue with hover labels and growth percentage.
- ✅ **Procedures Breakdown**: CSS donut chart (conic-gradient) showing procedure type distribution with legend.
- ✅ **Quick Actions**: 4-button shortcut grid (New Patient, Book Appointment, New Invoice, Quick Diagnosis).
- ✅ **Inventory Alerts**: Low-stock warnings with progress bars and severity badges (Critical/Warning).
- ✅ **Recent Activity Feed**: Timeline of last 5 clinic events (payments, appointments, updates, prescriptions).
- ✅ **Birthday Reminders**: Patient CRM widget showing today's + upcoming birthdays with message buttons.
- ✅ **Lab Tracker**: Dental lab work tracking with 4-step progress bars (Sent → In Progress → Ready → Delivered).
- ✅ **Outstanding Balances**: Overdue payment tracker with severity levels and contact action buttons.

### 🌐 Landing Page (100%)
- ✅ **Route Group**: `(front-end)` layout with Cairo + Playfair Display fonts.
- ✅ **9 Components**: `LandingNavbar`, `HeroSection`, `StatsSection`, `FeaturesSection`, `StepsSection`, `TestimonialsSection`, `FAQSection`, `BottomCTA`, `LandingFooter`.
- ✅ **Design**: Dark Mode Only (Slate-950) + Glassmorphism + Framer Motion animations.
- ✅ **Custom CSS**: `landing.css` with grid backgrounds, float animations, gradient text.
- ✅ **Colors**: SmileCraft Blue-600 branding (migrated from Teal/Cyan).

### 🔐 Auth Pages (100%)
- ✅ **Login Page**: Split-screen dark design — branding panel (stats, activity feed) + login form.
- ✅ **Animated Grid**: CSS grid background with slow pan animation on branding panel.
- ✅ **Form Features**: Email/password fields, password visibility toggle, "Remember Me", demo credentials badge.
- ✅ **Trust Badges**: Encrypted data, 100% secure, instant access indicators.
- ✅ **Server Action**: `loginAction.ts` with Zod validation, mock credentials, cookie-based session.

### ⚙️ Settings & Optimization (Progressing)
- ✅ **Glass-card UI**: Standardized premium aesthetics across Permissions and Service lists.
- ✅ **Permissions Matrix**: Role-based access control UI (localized).
- ✅ **Services Management**: Filterable service list with pricing and categorization.

---

## 🛠️ Key Architectural Patterns
1. **Feature-Based Structure**: Organized domain logic (`features/patients`, `features/clinical`, `features/dashboard`, `features/landing`, etc.).
2. **React 19 Actions**: Heavy use of `useActionState` and `useOptimistic`.
3. **Server Actions**: Zod-validated mutations (`loginAction`, `bookAppointmentAction`, `updateTreatmentItemStatus`).
4. **Data Persistence Layer**: Custom client-side services managing state across sessions.
5. **Premium Visuals**: Glassmorphism and Tailwind 4 variables for a modern high-end feel.
6. **Route Groups**: `(dashboard)` for app, `(front-end)` for landing, `(auth)` for login.

---

## 🚀 Recommended Next Steps
1. **Cloud Migration**: Transition current `localStorage` services to actual Axios-based API calls.
2. **Advanced Analytics**: Implement deep-dive reporting for specific dental specialties.
3. **Real-time Notifications**: Push alerts for appointments, low stock, and payment reminders.

---

💡 Assistant Memory (Added for Claude)
RTL Preference: When generating CSS, strictly avoid right- or left-. Use -inset-inline-end- for floating elements.

Component Style: Prefer functional components with TypeScript interfaces defined above the component.

Environment: You are working with a Senior Developer (Ahmed Samir). Keep explanations technical and concise.


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

---

## 🔥 Recommended Additions (Priority-Based)

### 1️⃣ **Settings Module** - *Currently Incomplete*
```typescript
// Needs completion:
- ✅ Permissions Matrix: Role-based access (Admin/Doctor/Reception)
- ✅ Services Management: Filterable list with pricing & categories
- ⚙️ Clinic Settings: Name, address, working hours, appointment slots
```

### 2️⃣ **Technical Infrastructure Upgrade** - *Critical*
```typescript
// Priority: Migrate from localStorage to Real API
- 🚀 Build Backend Layer using Next.js API Routes
- 🔐 Authentication System: JWT + Session Management
- 📦 Production Database (PostgreSQL/MySQL) instead of LocalStorage
```

### 3️⃣ **Staff Management** - *Missing*
```typescript
// To Add:
- 👨‍⚕️ Staff Profiles (Name, Specialty, Certifications)
- 📅 Staff Scheduling with interactive calendar
- ⏳ Leave Management & daily availability
- 💵 Payer & payroll tracking
```

### 4️⃣ **Inventory & Supplies Management** - *Missing*
```typescript
// To Add:
- 🦷 Track consumables (Anesthetics, Threads, Sterilization supplies)
- ⚠️ Low-stock alerts with notifications
- 📊 Sales reports by product + expiration tracking
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

## 📋 Suggested Roadmap

| Phase | Priority | Tasks |
|-------|----------|---------|
| **Phase 1** | 🔴 Critical | Permissions Setup + API Layer + Database Migration |
| **Phase 2** | 🟡 High | Staff Management + Notifications + Basic Reports |
| **Phase 3** | 🟢 Medium | External Integrations + Advanced Analytics + Inventory |

---

## 💡 Important Technical Notes

Based on `CLAUDE.md`:

```typescript
// ✅ Good Practices Currently Used:
- React 19 Actions (useOptimistic) for instant feedback
- Logical Properties for RTL/LTR compatibility
- Unified Glassmorphism design system
- Framer Motion AnimatePresence for smooth state transitions
- Per-patient mock data architecture (ready for API migration)
- Custom hooks for complex state (useSessionProgress)
- Server Actions with Zod validation for mutations
- CSS-based charts (conic-gradient, bar charts) — no charting library dependency

// ⚠️ Areas of Concern:
- localStorage risks data loss on cache clearing
- No API layer = Complete reliance on local storage
```

---

## 📁 Key File Paths

```
src/
├── app/[locale]/
│   ├── (auth)/login/          → Login page + loginAction.ts
│   ├── (dashboard)/
│   │   ├── dashboard/         → Main dashboard with 8 widgets
│   │   ├── appointments/      → Appointments page + BookingForm modal
│   │   ├── patients/          → Patient management
│   │   ├── clinical/          → Clinical module (Odontogram)
│   │   ├── finance/           → Financial management
│   │   ├── calendar/          → Calendar view
│   │   ├── staff/             → Staff management
│   │   ├── inventory/         → Inventory management
│   │   └── settings/          → System settings
│   └── (front-end)/landing/   → Landing page
├── features/
│   ├── dashboard/components/  → 10 widgets (Stats, Revenue, Procedures, etc.)
│   ├── appointments/          → DailyAgenda, BookingForm, CalendarGrid
│   ├── clinical/              → Odontogram, PatientSearch, PlanBuilder
│   ├── patients/              → Profile, MedicalHistory, IntakeWizard
│   ├── finance/               → Payments, DailyRevenue, MonthlyDashboard
│   ├── landing/components/    → 9 landing page sections
│   └── settings/              → Permissions, Services
└── locales/
    ├── ar.json                → Arabic translations
    └── en.json                → English translations
```

---

## 🎯 Summary

SmileCraft CMS is a comprehensive dental clinic management SaaS with **7 complete modules**, a **professional dark-themed landing page**, and a **split-screen auth system**. The dashboard includes **8 intelligent widgets** covering revenue, procedures, inventory, lab tracking, patient CRM, and more. All UI is fully RTL Arabic with premium Glassmorphism aesthetics.
