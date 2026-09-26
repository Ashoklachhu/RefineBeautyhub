import crypto from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'

// crypto needs the Node runtime, and a webhook must never be cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Kuro rejects a delivery older than 5 minutes; we do the same. */
const MAX_SKEW_SECONDS = 300

interface KuroLead {
  id?:        string
  name?:      string
  phone?:     string
  email?:     string
  interest?:  string
  message?:   string
  source?:    string
  channel?:   string
  score?:     number
  status?:    string
  sessionId?: string
  createdAt?: string
  details?:   Record<string, unknown>
}

/** Constant-time compare that tolerates unequal lengths. */
function signaturesMatch(received: string, expected: string): boolean {
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const secret = process.env.KURO_WEBHOOK_SECRET
  if (!secret) {
    console.error('[kuro] KURO_WEBHOOK_SECRET is not set — rejecting delivery')
    return new Response('Webhook not configured', { status: 500 })
  }

  // The signature covers the raw bytes, so the body must be read as text and
  // never re-serialised before hashing.
  const rawBody   = await request.text()
  const timestamp = request.headers.get('x-kuro-timestamp')
  const signature = request.headers.get('x-kuro-signature')
  const event     = request.headers.get('x-kuro-event')
  const resourceId = request.headers.get('x-kuro-resource-id')
  const deliveryId = request.headers.get('x-kuro-delivery')

  if (!timestamp || !signature) {
    return new Response('Missing signature headers', { status: 401 })
  }

  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  if (!signaturesMatch(signature, expected)) {
    console.warn('[kuro] bad signature on delivery', deliveryId)
    return new Response('Bad signature', { status: 401 })
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (!Number.isFinite(ageSeconds) || ageSeconds > MAX_SKEW_SECONDS) {
    console.warn('[kuro] stale delivery', deliveryId, `${Math.round(ageSeconds)}s old`)
    return new Response('Stale timestamp', { status: 401 })
  }

  if (event && event !== 'lead.created') {
    // Acknowledge unknown events so Kuro does not retry them forever.
    console.log('[kuro] ignoring unhandled event:', event)
    return new Response('Ignored', { status: 200 })
  }

  let payload: { data?: { lead?: KuroLead } }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    // Malformed JSON will never parse on retry either, so accept and drop it.
    console.error('[kuro] could not parse body for delivery', deliveryId)
    return new Response('Invalid JSON', { status: 200 })
  }

  const lead = payload.data?.lead
  if (!lead) {
    console.error('[kuro] delivery had no lead payload', deliveryId)
    return new Response('No lead in payload', { status: 200 })
  }

  // The header id is the documented dedupe key; fall back to the lead id.
  const key = resourceId ?? lead.id
  if (!key) {
    console.error('[kuro] delivery had no resource id', deliveryId)
    return new Response('No resource id', { status: 200 })
  }

  const { error } = await createServiceClient()
    .from('kuro_leads')
    .upsert({
      resource_id:     key,
      lead_id:         lead.id ?? null,
      session_id:      lead.sessionId ?? null,
      name:            lead.name ?? null,
      phone:           lead.phone ?? null,
      email:           lead.email ?? null,
      interest:        lead.interest ?? null,
      message:         lead.message ?? null,
      source:          lead.source ?? null,
      channel:         lead.channel ?? null,
      score:           typeof lead.score === 'number' ? lead.score : null,
      kuro_status:     lead.status ?? null,
      details:         lead.details ?? {},
      lead_created_at: lead.createdAt ?? null,
      updated_at:      new Date().toISOString(),
    }, {
      onConflict: 'resource_id',
      // Retries must not reset the salon's own follow-up status or notes,
      // so those columns are simply never included in the upsert.
    })

  if (error) {
    // 5xx tells Kuro to retry — the right response to a transient DB failure.
    console.error('[kuro] failed to save lead', key, error.message)
    return new Response('Could not store lead', { status: 500 })
  }

  console.log('[kuro] stored lead', key, `(${lead.name ?? 'unnamed'})`)
  return new Response('OK', { status: 200 })
}
