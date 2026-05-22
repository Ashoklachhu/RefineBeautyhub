import { getTwilioClient, TWILIO_WHATSAPP_FROM } from '@/lib/twilio'
import { SITE } from '@/constants'

// ── Phone number helpers ──────────────────────────────────────

/**
 * Normalises a phone number to E.164 format for Twilio.
 *
 * Handles common Nepali formats:
 *   98XXXXXXXX       → +97798XXXXXXXX
 *   977-98XXXXXXXX   → +97798XXXXXXXX
 *   +977 98XXXXXXXX  → +97798XXXXXXXX
 *   +1415XXXXXXX     → +1415XXXXXXX   (already E.164)
 */
function toE164(raw: string, defaultCountryCode = '977'): string | null {
  if (!raw) return null

  // Strip all whitespace, dashes, parentheses
  let digits = raw.replace(/[\s\-().]/g, '')

  // Already E.164 (+XXXXXXXXX)
  if (digits.startsWith('+')) return digits

  // Remove leading 00 (international prefix without +)
  if (digits.startsWith('00')) digits = digits.slice(2)

  // Nepal local: starts with 98 or 97 → prepend 977
  if (/^(98|97)\d{8}$/.test(digits)) {
    return `+977${digits}`
  }

  // If already has country code (e.g. 97798XXXXXXXX)
  if (digits.startsWith(defaultCountryCode)) {
    return `+${digits}`
  }

  // Fallback: prepend default country code
  return `+${defaultCountryCode}${digits}`
}

// ── Date / time formatting ────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  })
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm   = h >= 12 ? 'PM' : 'AM'
  const h12    = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

// ── Message builder ───────────────────────────────────────────

export interface BookingWhatsAppData {
  clientName:      string
  phone:           string
  reference:       string
  serviceName:     string
  durationMinutes: number
  staffName?:      string
  bookingDate:     string   // YYYY-MM-DD
  startTime:       string   // HH:MM
  endTime:         string   // HH:MM
  totalAmount:     number
  status:          string
  branchName?:     string
  branchAddress?:  string
}

function buildConfirmationMessage(d: BookingWhatsAppData): string {
  const artistLine = d.staffName
    ? `👩‍🎨 *Artist:* ${d.staffName}`
    : `👩‍🎨 *Artist:* Any Available Artist`

  const locationLine = d.branchName
    ? `📍 *Branch:* ${d.branchName}\n📌 *Address:* ${d.branchAddress ?? SITE.address}`
    : `📍 ${SITE.address}`

  return `✅ *Booking Confirmed — Refined Beauty Hub*

Hello ${d.clientName}! Great news — your appointment has been *confirmed*. Here are your details:

━━━━━━━━━━━━━━━━━━━━
💆 *Service:* ${d.serviceName} (${d.durationMinutes} min)
${artistLine}
📅 *Date:* ${formatDate(d.bookingDate)}
⏰ *Time:* ${formatTime(d.startTime)} – ${formatTime(d.endTime)}
💰 *Total:* NPR ${d.totalAmount.toLocaleString()}
🎫 *Reference:* ${d.reference}
━━━━━━━━━━━━━━━━━━━━

${locationLine}
📞 ${SITE.phone}
🌐 refinedbeautyhub.com

_Please arrive 5 minutes early. Cancellations must be made at least 24 hours in advance._

We look forward to seeing you! 💛`
}

// ── Completed / thank-you message ────────────────────────────

export interface CompletedWhatsAppData {
  clientName:  string
  phone:       string
  reference:   string
  serviceName: string
}

function buildCompletedMessage(d: CompletedWhatsAppData): string {
  return `💛 *Thank You — Refined Beauty Hub*

Hello ${d.clientName}! Thank you for your visit today. We hope you loved your *${d.serviceName}* experience.

We'd love to see you again! Book your next appointment anytime:
🌐 refinedbeautyhub.com
📞 ${SITE.phone}

_Leave us a review — your feedback means the world to us._ 🌟`
}

export async function sendBookingCompleted(
  data: CompletedWhatsAppData
): Promise<{ sent: boolean; error?: string }> {
  const to = toE164(data.phone)
  if (!to) return { sent: false, error: 'Invalid phone number' }

  try {
    const client  = getTwilioClient()
    const message = buildCompletedMessage(data)

    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to:   `whatsapp:${to}`,
      body: message,
    })

    console.log(`[WhatsApp] Completed sent → ${to} | SID: ${result.sid}`)
    return { sent: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[WhatsApp] Failed to send completed message:', msg)
    return { sent: false, error: msg }
  }
}

// ── Send functions ────────────────────────────────────────────

/**
 * Sends a WhatsApp booking confirmation to the client.
 * Errors are caught and logged — never rethrown so they never
 * block the booking creation from completing.
 */
export async function sendBookingConfirmation(
  data: BookingWhatsAppData
): Promise<{ sent: boolean; error?: string }> {
  const to = toE164(data.phone)
  if (!to) {
    console.warn('[WhatsApp] Invalid phone number, skipping:', data.phone)
    return { sent: false, error: 'Invalid phone number' }
  }

  try {
    const client  = getTwilioClient()
    const message = buildConfirmationMessage(data)

    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to:   `whatsapp:${to}`,
      body: message,
    })

    console.log(`[WhatsApp] Confirmation sent → ${to} | SID: ${result.sid}`)
    return { sent: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[WhatsApp] Failed to send confirmation:', msg)
    return { sent: false, error: msg }
  }
}

// ── Cancellation message ──────────────────────────────────────

export interface CancellationWhatsAppData {
  clientName:  string
  phone:       string
  reference:   string
  serviceName: string
  bookingDate: string
  startTime:   string
  reason?:     string
}

function buildCancellationMessage(d: CancellationWhatsAppData): string {
  const reasonLine = d.reason ? `\n📝 *Reason:* ${d.reason}` : ''

  return `❌ *Booking Cancelled — Refined Beauty Hub*

Hello ${d.clientName}, your appointment has been cancelled.

━━━━━━━━━━━━━━━━━━━━
💆 *Service:* ${d.serviceName}
📅 *Date:* ${formatDate(d.bookingDate)}
⏰ *Time:* ${formatTime(d.startTime)}
🎫 *Reference:* ${d.reference}${reasonLine}
━━━━━━━━━━━━━━━━━━━━

We hope to see you again soon! Book your next appointment at:
🌐 refinedbeautyhub.com
📞 ${SITE.phone}`
}

export async function sendBookingCancellation(
  data: CancellationWhatsAppData
): Promise<{ sent: boolean; error?: string }> {
  const to = toE164(data.phone)
  if (!to) return { sent: false, error: 'Invalid phone number' }

  try {
    const client  = getTwilioClient()
    const message = buildCancellationMessage(data)

    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to:   `whatsapp:${to}`,
      body: message,
    })

    console.log(`[WhatsApp] Cancellation sent → ${to} | SID: ${result.sid}`)
    return { sent: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[WhatsApp] Failed to send cancellation:', msg)
    return { sent: false, error: msg }
  }
}
