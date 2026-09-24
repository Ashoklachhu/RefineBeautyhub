import { SITE } from '@/constants'

/**
 * Email HTML is deliberately old-fashioned — tables, inline styles, no flex or
 * grid — because Outlook and Gmail still drop modern CSS.
 */

const GOLD   = '#b8976b'
const DARK   = '#1a1410'
const CREAM  = '#F9F5F0'
const MUTED  = '#7a6a5e'
const BORDER = '#e8ddd4'

export interface BookingEmailData {
  reference:     string
  clientName:    string
  serviceName:   string
  durationMins?: number
  staffName?:    string | null
  branchName?:   string | null
  branchAddress?: string | null
  dateLabel:     string
  timeLabel:     string
  totalAmount:   number
  notes?:        string | null
  clientEmail?:  string | null
  clientPhone?:  string | null
  /** Salon contact details for the footer, read from Settings. */
  sitePhone?:    string | null
  siteEmail?:    string | null
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px;width:38%;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${DARK};font-size:13px;font-weight:600;">${value}</td>
    </tr>`
}

function detailsTable(d: BookingEmailData): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
    ${row('Reference', d.reference)}
    ${row('Service', d.durationMins ? `${d.serviceName} (${d.durationMins} min)` : d.serviceName)}
    ${row('Artist', d.staffName || 'Any available artist')}
    ${row('Date', d.dateLabel)}
    ${row('Time', d.timeLabel)}
    ${d.branchName ? row('Branch', d.branchName) : ''}
    ${d.branchAddress ? row('Address', d.branchAddress) : ''}
    ${row('Total', `NPR ${d.totalAmount.toLocaleString()}`)}
    ${d.notes ? row('Notes', d.notes) : ''}
  </table>`
}

function shell(opts: {
  heading:  string
  intro:    string
  body:     string
  footNote?: string
  phone?:   string | null
  email?:   string | null
}): string {
  const phone = opts.phone || SITE.phone
  const email = opts.email || SITE.email
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:${CREAM};font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:4px;">

            <tr>
              <td style="background:${DARK};padding:28px 32px;text-align:center;">
                <div style="color:#ffffff;font-size:22px;letter-spacing:3px;text-transform:uppercase;">Refined</div>
                <div style="color:${GOLD};font-size:10px;letter-spacing:4px;text-transform:uppercase;margin-top:4px;">Beauty Hub</div>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:22px;font-weight:400;color:${DARK};">${opts.heading}</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:${MUTED};">${opts.intro}</p>
                ${opts.body}
                ${opts.footNote ? `<p style="margin:0;font-size:12px;line-height:1.7;color:${MUTED};">${opts.footNote}</p>` : ''}
              </td>
            </tr>

            <tr>
              <td style="background:${CREAM};padding:20px 32px;text-align:center;border-top:1px solid ${BORDER};">
                <p style="margin:0 0 6px;font-size:12px;color:${MUTED};">
                  ${phone} &nbsp;·&nbsp; ${email}
                </p>
                <p style="margin:0;font-size:11px;color:#9a8070;">refinedbeautyhub.com</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// ── Client: booking received, awaiting confirmation ───────────

export function bookingReceivedEmail(d: BookingEmailData) {
  return {
    subject: `Booking request received — ${d.reference}`,
    html: shell({
      heading: 'We have your request',
      intro: `Hello ${d.clientName}, thank you for choosing Refined Beauty Hub. Your appointment request has been received and is <strong style="color:${DARK};">awaiting confirmation</strong> from our team.`,
      body: detailsTable(d),
      phone: d.sitePhone,
      email: d.siteEmail,
      footNote: 'We will email you again as soon as your appointment is confirmed, usually within a few hours. This message is a receipt of your request, not a confirmed booking.',
    }),
  }
}

// ── Client: confirmed ─────────────────────────────────────────

export function bookingConfirmedEmail(d: BookingEmailData) {
  return {
    subject: `Appointment confirmed — ${d.reference}`,
    html: shell({
      heading: 'Your appointment is confirmed',
      intro: `Hello ${d.clientName}, good news — your appointment is now <strong style="color:${DARK};">confirmed</strong>. We look forward to seeing you.`,
      body: detailsTable(d),
      phone: d.sitePhone,
      email: d.siteEmail,
      footNote: 'Please arrive five minutes early. To change or cancel, contact us at least 24 hours in advance.',
    }),
  }
}

// ── Client: cancelled ─────────────────────────────────────────

export function bookingCancelledEmail(d: BookingEmailData) {
  return {
    subject: `Appointment cancelled — ${d.reference}`,
    html: shell({
      heading: 'Your appointment has been cancelled',
      intro: `Hello ${d.clientName}, your appointment below has been cancelled. If this was not expected, please get in touch and we will put it right.`,
      body: detailsTable(d),
      phone: d.sitePhone,
      email: d.siteEmail,
      footNote: `Book again any time at refinedbeautyhub.com or call ${d.sitePhone || SITE.phone}.`,
    }),
  }
}

// ── Client: completed / thank you ─────────────────────────────

export function bookingCompletedEmail(d: BookingEmailData) {
  return {
    subject: `Thank you for visiting — ${d.reference}`,
    html: shell({
      heading: 'Thank you for your visit',
      intro: `Hello ${d.clientName}, we hope you loved your ${d.serviceName} experience. It was a pleasure having you with us.`,
      body: detailsTable(d),
      phone: d.sitePhone,
      email: d.siteEmail,
      footNote: 'We would love to see you again — and a review would mean the world to us.',
    }),
  }
}

// ── Admin: new booking alert ──────────────────────────────────

export function newBookingAlertEmail(d: BookingEmailData) {
  const contact = [d.clientEmail, d.clientPhone].filter(Boolean).join(' · ')
  return {
    subject: `New booking request — ${d.clientName} (${d.reference})`,
    html: shell({
      heading: 'New booking request',
      intro: `<strong style="color:${DARK};">${d.clientName}</strong> has requested an appointment. It is pending your confirmation in the admin panel.${contact ? `<br/>${contact}` : ''}`,
      body: `${detailsTable(d)}
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td style="background:${DARK};border-radius:3px;">
              <a href="https://refinedbeautyhub.com/admin/bookings"
                 style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">
                Review in admin panel
              </a>
            </td>
          </tr>
        </table>`,
      footNote: 'The client has been emailed a receipt telling them the request is awaiting confirmation.',
      phone: d.sitePhone,
      email: d.siteEmail,
    }),
  }
}
