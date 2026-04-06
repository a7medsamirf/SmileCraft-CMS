# Real-time Appointments Queue Dashboard — Implementation Plan

## Goal
Build a real-time "Today's Queue" dashboard for the receptionist/doctor. It auto-updates via Supabase Realtime `postgres_changes` without full page reload.

---

## Architecture (Hybrid RSC + Realtime)

```mermaid
graph TD
    A["Server Component (page.tsx)"] -->|Prisma query| B["PostgreSQL (Supabase)"]
    A -->|props| C["QueueDashboardUI (Client)"]
    A -->|props| D["RealtimeListener (Client)"]
    D -->|Supabase WS subscription| B
    D -->|router.refresh()| A
```

1. **Server Component** fetches today's appointments securely via Prisma (scoped by `clinicId`).
2. **QueueDashboardUI** renders Quick Stats + table with status colors + action buttons.
3. **RealtimeListener** is an invisible `"use client"` component that subscribes to Supabase `postgres_changes` on `appointments` table. On any INSERT/UPDATE/DELETE event, it calls `router.refresh()` to re-run the Server Component without losing client state.

---

## User Review Required

> [!IMPORTANT]
> **Route Location**: Should the Queue Dashboard live at:
> - **Option A**: `/appointments/queue` — a new dedicated sub-route
> - **Option B**: Replace the existing `/appointments` page entirely
>
> The existing `/appointments` page is a `"use client"` component with a `DailyAgenda` table and a Booking Modal. If we go with Option B, the booking modal will be preserved.

> [!WARNING]
> **Supabase Realtime**: You **must** enable Realtime on the `appointments` table via Supabase Dashboard → Database → Replication → toggle ON for `appointments`. Otherwise the WebSocket subscription won't receive events.

---

## Bugs to Fix First

Before building new features, these existing issues in `serverActions.ts` need fixing:

### Bug 1: `procedure` field doesn't exist on Prisma `Appointment` model
- [serverActions.ts:45](file:///f:/react/SmileCraft-CMS/src/features/appointments/serverActions.ts#L45): `dbApt.procedure` → should be `dbApt.type`
- [serverActions.ts:89-102](file:///f:/react/SmileCraft-CMS/src/features/appointments/serverActions.ts#L89-L102): `procedure: payload.procedure` → should be `type: payload.procedure`
- The Prisma schema defines the field as `type String?` on line 192 of `schema.prisma`.

### Bug 2: Incorrect import path
- [serverActions.ts:6](file:///f:/react/SmileCraft-CMS/src/features/appointments/serverActions.ts#L6): `from "../types"` → should be `from "./types"` (types live inside `appointments/types/`, not `features/types/`)

### Bug 3: `AppointmentStatus` enum mismatch
- The Prisma schema defines: `SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW`
- The UI type defines: `SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW`
- `IN_PROGRESS` doesn't exist in Prisma. Must add `CONFIRMED` to the UI enum (or add `IN_PROGRESS` to Prisma schema). Recommend: add `IN_PROGRESS` to Prisma and keep both.

---

## Proposed Changes

### Component 1: Fix Existing Server Actions
#### [MODIFY] [serverActions.ts](file:///f:/react/SmileCraft-CMS/src/features/appointments/serverActions.ts)
- Fix `procedure` → `type` mapping
- Fix import path `"../types"` → `"./types"`
- Remove `procedure` from `createAppointmentActionDB` payload type

---

### Component 2: Server Page (Data Fetching)
#### [NEW] `src/app/[locale]/(dashboard)/appointments/queue/page.tsx`
- Server Component — no `"use client"`
- Fetches `clinicId` via Supabase Auth + Prisma user lookup
- Queries today's appointments: `prisma.appointment.findMany({ where: { clinicId, date range }, include: { patient }, orderBy: { startTime: 'asc' } })`
- Computes Quick Stats: `total`, `scheduled`, `inProgress`, `completed`, `cancelled`
- Passes data + `clinicId` to Client Components

---

### Component 3: Queue Dashboard UI (Client)
#### [NEW] `src/features/appointments/components/QueueDashboardUI.tsx`
- `"use client"` — receives `appointments[]` and `stats` as props
- **Quick Stats Row**: 4 cards (Total, Pending, In Progress, Completed) with Lucide icons
- **Table**: Patient Name, Time, Type/Procedure, Status Badge, Action Buttons
- **Status Colors** (Tailwind):
  - `SCHEDULED` → `bg-blue-500/10 text-blue-600`
  - `IN_PROGRESS` → `bg-amber-500/10 text-amber-600`
  - `COMPLETED` → `bg-emerald-500/10 text-emerald-600`
  - `CANCELLED` → `bg-red-500/10 text-red-600`
  - `NO_SHOW` → `bg-slate-500/10 text-slate-600`
- **Action Buttons**: Status transitions (Start → Complete → etc.)
- **Empty State**: Animated illustration when no appointments today
- **Loading Skeleton**: For initial load via `loading.tsx`

---

### Component 4: Realtime Listener (Client)
#### [NEW] `src/features/appointments/components/RealtimeAppointmentListener.tsx`
- `"use client"` — invisible component (renders `null`)
- Uses `createClient()` from `@/lib/supabase/client`
- Subscribes to channel: `realtime:appointments`
- Filter: `postgres_changes` on table `appointments` where `clinic_id=eq.{clinicId}`
- Events: `INSERT`, `UPDATE`, `DELETE`
- Handler: `router.refresh()` from `next/navigation`
- Cleanup: `supabase.removeChannel(channel)` on unmount

---

### Component 5: Loading Skeleton
#### [NEW] `src/app/[locale]/(dashboard)/appointments/queue/loading.tsx`
- Skeleton UI matching the Quick Stats + Table layout
- Uses Tailwind `animate-pulse` on placeholder blocks

---

### Component 6: Server Action for Status Update
#### [MODIFY] [serverActions.ts](file:///f:/react/SmileCraft-CMS/src/features/appointments/serverActions.ts)
- Ensure `updateAppointmentStatusAction` uses proper Prisma enum values
- Add `revalidatePath("/dashboard/appointments/queue")`

---

## Open Questions

1. **Route**: `/appointments/queue` (new) or replace existing `/appointments`?
2. **Supabase Realtime**: Have you enabled Realtime replication on the `appointments` table in Supabase Dashboard?

---

## Verification Plan

### Build Verification
- `npm run dev` — ensure zero compilation errors
- Navigate to `/ar/appointments/queue` — verify SSR renders correctly

### Functional Tests
1. Open the Queue page in browser
2. Use the Booking Form (existing) to create a new appointment
3. Verify the Queue table updates automatically within ~1s (no manual refresh)
4. Click "Start" button on an appointment → verify status changes to IN_PROGRESS with yellow badge
5. Click "Complete" → verify green badge
6. Verify Quick Stats numbers update in real-time
