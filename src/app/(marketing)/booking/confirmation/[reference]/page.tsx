import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBookingByReference } from '@/services/booking.service'
import { CheckCircle, Calendar, Clock, User, Sparkles, ArrowRight, UserPlus, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Booking Confirmed — Refined Beauty Hub',
}

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params
  const result = await getBookingByReference(reference)
  if (!result.data) notFound()

  const booking = result.data

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12  = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const clientName  = booking.profile?.full_name ?? booking.guest_name ?? 'Guest'
  const isGuest     = !booking.user_id

  // Build pre-filled register URL for guest users
  const registerParams = new URLSearchParams()
  if (booking.guest_name)  registerParams.set('name',  booking.guest_name)
  if (booking.guest_email) registerParams.set('email', booking.guest_email)
  if (booking.guest_phone) registerParams.set('phone', booking.guest_phone)
  const registerUrl = `/register?${registerParams.toString()}`

  return (
    <section className="section-py min-h-[70vh] flex items-center">
      <div className="luxury-container">
        <div className="max-w-lg mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-3xl md:text-4xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
            You&apos;re Booked!
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Thank you, <strong>{clientName}</strong>. Your appointment is confirmed. We&apos;ll send a reminder to your email.
          </p>

          {/* Reference */}
          <div className="inline-block px-5 py-2 rounded-full bg-nude-100 border border-nude-200 mb-8">
            <span className="text-xs text-muted-foreground">Booking Reference: </span>
            <span className="text-sm font-mono font-semibold">{booking.reference}</span>
          </div>

          {/* Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6 text-left space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-gold-500 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Service</p>
                <p className="font-medium">{booking.service?.name}</p>
                <p className="text-sm text-muted-foreground">{booking.service?.duration_minutes} minutes</p>
              </div>
            </div>

            {booking.staff && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gold-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Artist</p>
                  <p className="font-medium">{booking.staff.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gold-500 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                <p className="font-medium">
                  {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-NP', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gold-500 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
                <p className="font-medium">{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold">NPR {booking.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 capitalize
            ${booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200'
            : booking.status === 'pending'   ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-nude-100 text-nude-600 border border-nude-200'}`}>
            <span className={`w-2 h-2 rounded-full ${
              booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-nude-400'}`} />
            {booking.status === 'pending' ? 'Pending Confirmation' : booking.status}
          </div>

          <p className="text-xs text-muted-foreground mb-8">
            {booking.status === 'pending'
              ? 'We\'ll confirm your booking within a few hours. You\'ll receive an email once confirmed.'
              : 'Your booking has been confirmed. See you soon!'}
          </p>

          {/* ── Guest: Create Account Reminder ────────────────── */}
          {isGuest && (
            <div className="mb-8 rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50/80 to-nude-50 p-6 text-left">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Save time on your next visit</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create a free account to manage your bookings and book faster next time.
                  </p>
                </div>
              </div>

              {/* Benefits list */}
              <ul className="space-y-1.5 mb-5">
                {[
                  'View and track all your bookings in one place',
                  'Book in seconds — no need to re-enter your details',
                  'Get early access to promotions and offers',
                ].map(benefit => (
                  <li key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-gold-500 flex-shrink-0 fill-gold-500" />
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* CTA — details pre-filled via query params */}
              <Link
                href={registerUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <UserPlus className="w-4 h-4" />
                Create Free Account
              </Link>

              <p className="text-[11px] text-muted-foreground mt-3">
                Your name and email from this booking will be pre-filled for you.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 gold-gradient text-white rounded-full font-medium hover:opacity-90 transition-opacity text-sm">
              Back to Home
            </Link>
            <Link href="/booking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-medium hover:bg-nude-50 transition-colors">
              Book Another
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
