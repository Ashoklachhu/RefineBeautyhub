import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'
import {
  bookingReceivedEmail,
  bookingConfirmedEmail,
  bookingCancelledEmail,
  bookingCompletedEmail,
  newBookingAlertEmail,
  type BookingEmailData,
} from '@/lib/email/templates'
import { resolveBranches } from '@/lib/branches'
import { SITE } from '@/constants'
import type { BookingStatus } from '@/types/database'

// ── Formatting ────────────────────────────────────────────────

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

// ── Loading ───────────────────────────────────────────────────

interface LoadedBooking {
  data:        BookingEmailData
  clientEmail: string | null
}

/**
 * Pulls everything the templates need in one query. Returns null rather than
 * throwing, so a missing booking can never take down the caller.
 */
async function loadBookingForEmail(bookingId: string): Promise<LoadedBooking | null> {
  const supabase = createServiceClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services!service_id(name, duration_minutes),
      staff:staff!staff_id(name),
      profile:profiles!user_id(full_name, email, phone)
    `)
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    console.error('[email] could not load booking', bookingId, error?.message)
    return null
  }

  const profile = booking.profile as { full_name?: string; email?: string; phone?: string } | null
  const service = booking.service as { name: string; duration_minutes: number } | null
  const staff   = booking.staff as { name: string } | null

  // Branch names and the salon's own contact details live in site_settings,
  // so emails never print the stale constants.
  const { data: settings } = await supabase
    .from('site_settings')
    .select('branches, phone, email')
    .eq('id', 'main')
    .single()

  const site = settings as { branches?: never[]; phone?: string; email?: string } | null

  const branch = resolveBranches(site as { branches: never[] } | null)
    .find(b => b.id === booking.branch)

  return {
    clientEmail: booking.guest_email ?? profile?.email ?? null,
    data: {
      reference:     booking.reference,
      clientName:    profile?.full_name ?? booking.guest_name ?? 'there',
      serviceName:   service?.name ?? 'your appointment',
      durationMins:  service?.duration_minutes,
      staffName:     staff?.name ?? null,
      branchName:    branch?.name ?? null,
      branchAddress: branch?.address ?? null,
      dateLabel:     formatDate(booking.booking_date),
      timeLabel:     `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`,
      totalAmount:   Number(booking.total_amount) || 0,
      notes:         booking.notes ?? null,
      clientEmail:   booking.guest_email ?? profile?.email ?? null,
      clientPhone:   booking.guest_phone ?? profile?.phone ?? null,
      sitePhone:     site?.phone ?? null,
      siteEmail:     site?.email ?? null,
    },
  }
}

/** Where admin alerts go: env override, else the address in Settings. */
async function getAdminRecipient(): Promise<string | null> {
  const override = process.env.ADMIN_NOTIFICATION_EMAIL?.trim()
  if (override) return override

  try {
    const { data } = await createServiceClient()
      .from('site_settings')
      .select('email')
      .eq('id', 'main')
      .single()
    return (data as { email?: string } | null)?.email ?? SITE.email
  } catch {
    return SITE.email
  }
}

// ── Public API ────────────────────────────────────────────────

/**
 * Fired when a booking is created: a receipt for the client saying the
 * request is pending, and an alert for the salon. Both are best-effort.
 */
export async function sendNewBookingEmails(bookingId: string): Promise<void> {
  const loaded = await loadBookingForEmail(bookingId)
  if (!loaded) return

  const adminTo = await getAdminRecipient()
  const jobs: Promise<unknown>[] = []

  if (loaded.clientEmail) {
    const { subject, html } = bookingReceivedEmail(loaded.data)
    jobs.push(sendEmail({ to: loaded.clientEmail, subject, html }))
  } else {
    console.warn('[email] booking has no client address, skipping receipt:', loaded.data.reference)
  }

  if (adminTo) {
    const { subject, html } = newBookingAlertEmail(loaded.data)
    jobs.push(sendEmail({
      to: adminTo,
      subject,
      html,
      // Replying to the alert reaches the client directly.
      replyTo: loaded.clientEmail ?? undefined,
    }))
  }

  await Promise.allSettled(jobs)
}

/** Fired when an admin moves a booking to confirmed / cancelled / completed. */
export async function sendBookingStatusEmail(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const builder =
    status === 'confirmed' ? bookingConfirmedEmail
    : status === 'cancelled' ? bookingCancelledEmail
    : status === 'completed' ? bookingCompletedEmail
    : null

  if (!builder) return   // pending / no_show do not notify the client

  const loaded = await loadBookingForEmail(bookingId)
  if (!loaded?.clientEmail) return

  const { subject, html } = builder(loaded.data)
  await sendEmail({ to: loaded.clientEmail, subject, html })
}
