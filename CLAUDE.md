🦷 SmileCraft CMS — Context Snapshot & Guidelines
Date: March 27, 2026

Status: Core Feature-Complete (Patients, Finance, Clinical, Calendar)

🏗️ Technical Stack
Framework: Next.js 16 (App Router) + React 19.

Styling: Tailwind CSS 4 (Glassmorphism, CSS Variables).

Rule: Always use Logical Properties (ms-, pe-, inset-inline-) for RTL/LTR compatibility.

Localization: next-intl (Arabic/English, RTL/LTR support).

Rule: Use useTranslations for all UI text; no hardcoded strings.

Theming: next-themes (Dark/Light mode via Sidebar).

Animations: framer-motion (Spring indicators, Page transitions).

Type Safety: Strict TypeScript (Branded primitives and defineRouting).

📦 Modules Progress
👥 Patients Module (100%)
✅ Full Desktop/Mobile Profile Layout.

✅ Medical History with Severity Alerts & In-place Editing.

✅ Treatment Timeline (Visual history of visits).

✅ New Patient Intake Form: Localized 3-step wizard with medical questionnaire.

✅ Persistence: patientService managing records via local storage.

💸 Finance & Billing (100%)
✅ Universal Currency Formatting (EGP/ج.م).

✅ Optimistic Payments: Adding payments updates balance instantly.

✅ Daily Revenue Widget: Grouped by payment method (Cash/Card/Wallet).

✅ Monthly Analytical Dashboard: High-end charts for revenue and procedure tracking.

✅ Print Support: Semantic @media print layout for reports.

📅 Calendar & Appointments (100%)
✅ Full Interactive Monthly Grid with RTL Support.

✅ Client-side State Management (Date selection & Agenda sync).

✅ Dynamic Agenda: Polished "Glass-card" UI with localized date formatting.

✅ Stable Re-fetching: Optimized useEffect with stringified date dependencies.

🦷 Clinical Module (100%)
✅ Anatomical Odontogram: Interactive teeth map with distinct SVG shapes.

✅ Clinical Persistence: Status and treatment plans saved/loaded from storage.

✅ Plan Builder: Automated procedure generation and cost estimation.

✅ Plan to Invoice: React 19 actions to convert plans to financial bills.

⚙️ Settings & Optimization (Progressing)
✅ Glass-card UI: Standardized premium aesthetics (blur-3xl) across Permissions and Service lists.

✅ Permissions Matrix: Role-based access control UI (localized).

✅ Services Management: Filterable service list with pricing and categorization.

🛠️ Key Architectural Patterns
Feature-Based Structure: Organized domain logic (features/patients, features/clinical, etc.).

React 19 Actions: Heavy use of useActionState, useOptimistic, and useFormStatus.

Data Persistence Layer: Custom client-side services managing state across sessions (Current: localStorage).

Premium Visuals: Glassmorphism and Tailwind 4 variables for a modern high-end feel (Emerald-500 accents).

🚀 Recommended Next Steps
Cloud Migration: Transition current localStorage services to actual Axios-based API calls.

Advanced Analytics: Implement deep-dive reporting for specific dental specialties.

Appointment Wizard: Expand the calendar with a drag-and-drop scheduling interface.

💡 Assistant Memory (Added for Claude)
RTL Preference: When generating CSS, strictly avoid right- or left-. Use -inset-inline-end- for floating elements.

Component Style: Prefer functional components with TypeScript interfaces defined above the component.

Environment: You are working with a Senior Developer (Ahmed Samir). Keep explanations technical and concise.

## 🎯 Current Task: Appointment Wizard
- Create `features/calendar/components/AppointmentWizard.tsx`.
- Use `@dnd-kit/core` for Drag-and-Drop.
- Implement React 19 `useOptimistic` for instant booking feedback.
- Use Tailwind 4 Logical Properties (RTL-first).
- Theme: High-end Glassmorphism (Emerald-500, blur-3xl).