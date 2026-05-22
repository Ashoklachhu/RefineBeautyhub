import twilio from 'twilio'

// Lazily-initialised singleton — only created on the server when first needed.
let _client: ReturnType<typeof twilio> | null = null

export function getTwilioClient(): ReturnType<typeof twilio> {
  if (_client) return _client

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your environment.')
  }

  _client = twilio(accountSid, authToken)
  return _client
}

/** The WhatsApp-enabled sender number (sandbox or paid Twilio number). */
export const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'
