import { Resend } from 'resend'

/**
 * Resend client, created lazily so a missing key is a no-op rather than a
 * crash at import time. Email is a side effect of booking — if it is not
 * configured, or Resend is down, the booking itself must still go through.
 */
let client: Resend | null = null

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!client) client = new Resend(key)
  return client
}

/**
 * The From address. Must be on a domain verified in Resend, otherwise every
 * send is rejected. Falls back to Resend's shared sandbox sender, which only
 * delivers to the address that owns the Resend account — fine for a smoke
 * test, not for real clients.
 */
export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || 'Refined Beauty Hub <onboarding@resend.dev>'
}

export interface SendEmailInput {
  to:       string
  subject:  string
  html:     string
  replyTo?: string
}

export interface SendEmailResult {
  sent:     boolean
  skipped?: boolean
  error?:   string
}

/** Never throws: callers treat email as best-effort. */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResendClient()

  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping:', subject)
    return { sent: false, skipped: true, error: 'Email is not configured' }
  }

  if (!to?.trim()) {
    return { sent: false, skipped: true, error: 'No recipient address' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from:    getFromAddress(),
      to:      [to.trim()],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      console.error('[email] Resend rejected the message:', error.message)
      return { sent: false, error: error.message }
    }

    console.log(`[email] sent "${subject}" to ${to} (id: ${data?.id})`)
    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] send failed:', message)
    return { sent: false, error: message }
  }
}
