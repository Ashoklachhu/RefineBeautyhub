import { createClient, createServiceClient } from '@/lib/supabase/server'

// NOTE: createServiceClient() is used for the booking write-path and slot-availability
// reads so that guest (unauthenticated) users are not blocked by Supabase's default
// anon-role permissions or missing RLS SELECT policies.
// All three functions are ONLY called from trusted Next.js server actions — never
// directly from the browser — so bypassing RLS here is safe.
import { ok, fail, fromSupabaseError, Errors, type ServiceResult } from '@/lib/errors'
import type { Booking, BookingWithDetails } from '@/types/database'

export interface CreateBookingInput {
  serviceId:    string
  staffId?:     string
  branch:       string
  bookingDate:  string
  startTime:    string
  userId?:      string
  guestName?:   string
  guestEmail?:  string
  guestPhone?:  string
  notes?:       string
}

export interface TimeSlotResult {
  slot_time:    string
  is_available: boolean
}

// ── Helpers ───────────────────────────────────────────────────

function toMinutes(time: string): number {
  // Accepts "HH:MM" (24-hr) or "H:MM AM/PM"
  if (time.includes('AM') || time.includes('PM')) {
    const [rawTime, period] = time.trim().split(' ')
    const [h, m] = rawTime.split(':').map(Number)
    const hours = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h
    return hours * 60 + m
  }
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function addMinutes(time: string, minutes: number): string {
  const total = toMinutes(time) + minutes
  const hh    = String(Math.floor(total / 60)).padStart(2, '0')
  const mm    = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// Salon opening hours keyed by lowercase day name
const SALON_HOURS: Record<string, { open: string; close: string } | null> = {
  sunday:    { open: '10:00 AM', close: '7:00 PM'  },
  monday:    { open: '10:00 AM', close: '7:00 PM'  },
  tuesday:   { open: '10:00 AM', close: '7:00 PM'  },
  wednesday: { open: '10:00 AM', close: '7:00 PM'  },
  thursday:  { open: '10:00 AM', close: '7:00 PM'  },
  friday:    { open: '10:00 AM', close: '8:00 PM'  },
  saturday:  { open: '9:00 AM',  close: '8:00 PM'  },
}

export async function getAvailableSlots(
  staffId: string,
  date: string,
  durationMinutes: number
): Promise<ServiceResult<TimeSlotResult[]>> {
  // 1. Determine salon hours for this day
  const dayName = new Date(date + 'T12:00:00')
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase()

  const hours = SALON_HOURS[dayName]
  if (!hours) return ok([])  // salon closed this day

  const openMin  = toMinutes(hours.open)
  const closeMin = toMinutes(hours.close)

  // 2. Generate all 30-min slots that fit within opening hours
  const slots: TimeSlotResult[] = []
  let cursor = openMin
  while (cursor + durationMinutes <= closeMin) {
    const hh = String(Math.floor(cursor / 60)).padStart(2, '0')
    const mm = String(cursor % 60).padStart(2, '0')
    slots.push({ slot_time: `${hh}:${mm}`, is_available: true })
    cursor += 30
  }

  // 3. If no specific staff chosen, all generated slots are available
  if (!staffId) return ok(slots)

  // 4. Fetch existing bookings for this staff + date to mark conflicts.
  //    Use the service client so anon/guest users can see real availability.
  const supabase = createServiceClient()
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('booking_date', date)
    .not('status', 'in', '("cancelled")')

  // If the query fails just return all slots as available (degraded mode)
  if (error || !bookings) return ok(slots)
  if (bookings.length === 0) return ok(slots)

  // 5. Mark slots that overlap with an existing booking as unavailable
  const marked = slots.map(slot => {
    const slotStart = toMinutes(slot.slot_time)
    const slotEnd   = slotStart + durationMinutes

    const conflict = bookings.some(b => {
      const bStart = toMinutes(b.start_time as string)
      const bEnd   = toMinutes(b.end_time   as string)
      // Overlap if slot starts before booking ends AND slot ends after booking starts
      return slotStart < bEnd && slotEnd > bStart
    })

    return { ...slot, is_available: !conflict }
  })

  return ok(marked)
}

export async function checkConflict(
  staffId:   string,
  date:      string,
  startTime: string,
  endTime:   string,
  excludeId?: string
): Promise<ServiceResult<boolean>> {
  // Service client: check_booking_conflict is SECURITY INVOKER, so it would
  // run as anon and see no rows without this. Service client has full access.
  const supabase = createServiceClient()

  const { data, error } = await supabase.rpc('check_booking_conflict', {
    p_staff_id:   staffId,
    p_date:       date,
    p_start_time: startTime,
    p_end_time:   endTime,
    ...(excludeId ? { p_exclude_id: excludeId } : {}),
  })

  if (error) return fail(fromSupabaseError(error))
  return ok(data as boolean)
}

export async function createBooking(
  input: CreateBookingInput,
  serviceDuration: number,
  servicePrice:    number
): Promise<ServiceResult<Booking>> {
  // Use the service client so guest (unauthenticated) users can INSERT.
  // The anon Postgres role does not have INSERT privileges by default.
  // This function is only ever called from trusted server actions.
  const supabase = createServiceClient()

  const hasUser  = !!input.userId
  const hasGuest = !!(input.guestName && input.guestEmail)
  if (!hasUser && !hasGuest) {
    return fail(Errors.validation('Client information is required'))
  }

  const today = new Date().toISOString().split('T')[0]
  if (input.bookingDate < today) {
    return fail(Errors.validation('Cannot book a date in the past'))
  }

  const endTime = addMinutes(input.startTime, serviceDuration)

  if (input.staffId) {
    const conflictResult = await checkConflict(
      input.staffId, input.bookingDate, input.startTime, endTime
    )
    if (conflictResult.error)  return fail(conflictResult.error)
    if (conflictResult.data) {
      return fail(Errors.conflict('This time slot is no longer available. Please select another.'))
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id:      input.userId      ?? null,
      guest_name:   input.guestName   ?? null,
      guest_email:  input.guestEmail  ?? null,
      guest_phone:  input.guestPhone  ?? null,
      branch:       input.branch,
      service_id:   input.serviceId,
      staff_id:     input.staffId     ?? null,
      booking_date: input.bookingDate,
      start_time:   input.startTime,
      end_time:     endTime,
      status:       'pending',
      total_amount: servicePrice,
      notes:        input.notes       ?? null,
    })
    .select()
    .single()

  if (error) return fail(fromSupabaseError(error))
  if (!data)  return fail(Errors.unknown('Booking could not be created'))
  return ok(data as Booking)
}

export async function getBookingByReference(
  reference: string
): Promise<ServiceResult<BookingWithDetails>> {
  // Use the service client so guest (unauthenticated) users can look up their
  // own booking on the confirmation page. The reference is random & unguessable,
  // so there is no meaningful security exposure in allowing read-by-reference.
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*, service:services!service_id(*), staff:staff!staff_id(*), profile:profiles!user_id(*)')
    .eq('reference', reference)
    .single()

  if (error) return fail(fromSupabaseError(error))
  if (!data)  return fail(Errors.notFound('Booking'))
  return ok(data as BookingWithDetails)
}

export async function getUserBookings(
  userId: string
): Promise<ServiceResult<BookingWithDetails[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*, service:services!service_id(*), staff:staff!staff_id(*)')
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })

  if (error) return fail(fromSupabaseError(error))
  return ok(data as BookingWithDetails[])
}

export async function cancelBooking(
  bookingId:   string,
  cancelledBy: string,
  reason?:     string
): Promise<ServiceResult<Booking>> {
  const supabase = await createClient()

  const { data: existing, error: fetchErr } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single()

  if (fetchErr || !existing) return fail(Errors.notFound('Booking'))

  const { status } = existing as { status: string }
  if (!['pending', 'confirmed'].includes(status)) {
    return fail(Errors.validation(`Cannot cancel a booking with status: ${status}`))
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({
      status:              'cancelled',
      cancelled_at:        new Date().toISOString(),
      cancelled_by:        cancelledBy,
      cancellation_reason: reason ?? null,
    })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) return fail(fromSupabaseError(error))
  return ok(data as Booking)
}

export async function confirmBooking(bookingId: string): Promise<ServiceResult<Booking>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) return fail(fromSupabaseError(error))
  if (!data)  return fail(Errors.notFound('Booking'))
  return ok(data as Booking)
}

export interface BookingFilters {
  status?:   Booking['status']
  date?:     string
  staffId?:  string
  page?:     number
  pageSize?: number
}

export async function getAllBookings(
  filters: BookingFilters = {}
): Promise<ServiceResult<{ bookings: BookingWithDetails[]; count: number }>> {
  const supabase  = await createClient()
  const page      = filters.page     ?? 1
  const pageSize  = filters.pageSize ?? 20
  const from      = (page - 1) * pageSize
  const to        = from + pageSize - 1

  let query = supabase
    .from('bookings')
    .select('*, service:services!service_id(*), staff:staff!staff_id(*), profile:profiles!user_id(*)', { count: 'exact' })
    .order('booking_date', { ascending: false })
    .range(from, to)

  if (filters.status)  query = query.eq('status', filters.status)
  if (filters.date)    query = query.eq('booking_date', filters.date)
  if (filters.staffId) query = query.eq('staff_id', filters.staffId)

  const { data, error, count } = await query

  if (error) return fail(fromSupabaseError(error))
  return ok({ bookings: data as BookingWithDetails[], count: count ?? 0 })
}
