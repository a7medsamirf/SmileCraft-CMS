// =============================================================================
// SmileCraft CMS — Realtime Appointment Handler
// Client Component — headless, renders nothing.
//
// Subscribes to Supabase Postgres Changes on `appointments` table,
// filtered by clinic_id for multi-tenant isolation.
// Calls router.refresh() on any INSERT / UPDATE / DELETE,
// which re-runs the Server Component and fetches fresh data from Supabase.
//
// Usage:
//   <RealtimeAppointmentHandler clinicId={clinicId} />
//
// src/features/appointments/components/RealtimeAppointmentHandler.tsx
// =============================================================================
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface RealtimeAppointmentHandlerProps {
  /**
   * The clinic ID used to filter Realtime events.
   * Only changes to appointments belonging to this clinic will trigger a refresh.
   * This ensures complete multi-tenant isolation at the subscription layer.
   */
  clinicId: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RealtimeAppointmentHandler({
  clinicId,
}: RealtimeAppointmentHandlerProps) {
  const router = useRouter()
  // Keep a ref to the channel so we can clean it up on unmount or clinicId change
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Guard: clinicId must be a non-empty string
    if (!clinicId) return

    const supabase = createClient()

    // ── Subscribe ────────────────────────────────────────────────────────
    // Channel name is namespaced by clinicId to avoid cross-tab collisions.
    const channel = supabase
      .channel(`smilecraft:queue:${clinicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',          // Listen for INSERT | UPDATE | DELETE
          schema: 'public',
          table: 'appointments',
          // Filter at the Supabase Realtime level so other clinics' events
          // never reach this client. The column name must match the exact
          // PostgreSQL column name (camelCase, as created by Prisma).
          filter: `clinicId=eq.${clinicId}`,
        },
        (payload) => {
          // Any change to today's queue triggers a full Server Component re-render.
          // This is intentionally simple — the Server Component re-fetches
          // fresh data from Supabase and returns the new HTML.
          console.info(
            `[Realtime] ${payload.eventType} on appointments for clinic ${clinicId}`
          )
          router.refresh()
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.info(
            `[Realtime] ✅ Subscribed to queue channel for clinic ${clinicId}`
          )
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[Realtime] ⚠️ Channel issue: ${status}`, err)
        }
      })

    channelRef.current = channel

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [clinicId, router])

  // This component is intentionally headless — it renders no DOM.
  return null
}
