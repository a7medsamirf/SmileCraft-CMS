// =============================================================================
// SmileCraft CMS — Today's Queue: Supabase Data Service (server-only)
// Uses @supabase/ssr createClient — NO Prisma.
// All queries are scoped to the authenticated user's clinicId.
// src/features/appointments/services/queue.ts
// =============================================================================
import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { AppointmentStatus } from '@/types/database.types'

// ---------------------------------------------------------------------------
// Shared Types
// ---------------------------------------------------------------------------

/** Shape of a single row in the Today's Queue list */
export interface QueueAppointment {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  /** HH:mm time string, e.g. "09:30" */
  startTime: string
  type: string | null
  status: AppointmentStatus
}

/** Aggregated stats shown in the header cards */
export interface QueueStats {
  total: number
  /** SCHEDULED — waiting outside */
  scheduled: number
  /** CONFIRMED — currently inside the clinic */
  confirmed: number
  completed: number
  /** CANCELLED + NO_SHOW combined */
  cancelled: number
}

// ---------------------------------------------------------------------------
// fetchTodaysQueue
// ---------------------------------------------------------------------------

/**
 * Fetches today's appointments for `clinicId`, joined with the patients table
 * to get fullName and phone. Ordered by startTime ascending.
 *
 * Uses Supabase PostgREST directly — no Prisma.
 *
 * @param clinicId  The clinic scope (multi-tenant guard).
 */
export async function fetchTodaysQueue(clinicId: string): Promise<{
  appointments: QueueAppointment[]
  stats: QueueStats
}> {
  const supabase = await createClient()

  // Build today's date window in ISO-8601
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      id,
      patientId,
      startTime,
      type,
      status,
      patients!inner (
        fullName,
        phone
      )
    `
    )
    // ── Multi-tenancy filter ───────────────────────────────────────────────
    .eq('clinicId', clinicId)
    // ── Date window ───────────────────────────────────────────────────────
    .gte('date', todayStart.toISOString())
    .lte('date', todayEnd.toISOString())
    // ── Sort by appointment time ───────────────────────────────────────────
    .order('startTime', { ascending: true })

  if (error) {
    // Log the error server-side; return an empty queue to avoid crashing the UI
    console.error('[fetchTodaysQueue] Supabase error:', error.message, error.details)
    return {
      appointments: [],
      stats: { total: 0, scheduled: 0, confirmed: 0, completed: 0, cancelled: 0 },
    }
  }

  // ── Map raw rows → typed QueueAppointment objects ──────────────────────
  const appointments: QueueAppointment[] = (data ?? []).map((row) => {
    // PostgREST returns a single object for many-to-one joins
    const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients

    return {
      id: row.id as string,
      patientId: row.patientId as string,
      patientName: (patient as { fullName: string } | null)?.fullName ?? '—',
      patientPhone: (patient as { phone: string } | null)?.phone ?? '',
      startTime: row.startTime as string,
      type: row.type as string | null,
      status: row.status as AppointmentStatus,
    }
  })

  // ── Build stats ────────────────────────────────────────────────────────
  const stats: QueueStats = {
    total: appointments.length,
    scheduled: appointments.filter((a) => a.status === 'SCHEDULED').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(
      (a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW'
    ).length,
  }

  return { appointments, stats }
}

// ---------------------------------------------------------------------------
// getAuthenticatedClinicId
// ---------------------------------------------------------------------------

/**
 * Reads the authenticated user's session from Supabase Auth, then looks up
 * the corresponding clinicId from the `users` table.
 *
 * Throws an Error if not authenticated or if the user record is missing.
 */
export async function getAuthenticatedClinicId(): Promise<string> {
  const supabase = await createClient()

  // 1. Verify session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized: No active Supabase session.')
  }

  // 2. Fetch clinicId from the users table using the Auth UID
  const { data: dbUser, error: userError } = await supabase
    .from('users')
    .select('clinicId')
    .eq('id', user.id)
    .single()

  if (userError || !dbUser) {
    throw new Error(`User record not found in DB for uid=${user.id}`)
  }

  return dbUser.clinicId as string
}
