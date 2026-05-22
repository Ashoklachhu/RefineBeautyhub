'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react'
import { ContactForm } from './ContactForm'

function fmt24(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

interface HourEntry { day: string; open: string; close: string; closed: boolean }

interface Props {
  phone:   string
  email:   string
  address: string
  mapUrl:  string
  hours:   HourEntry[]
}

export function ContactPageClient({ phone, email, address, mapUrl, hours }: Props) {
  const cards = [
    {
      icon: Phone, label: 'Phone & WhatsApp', value: phone,
      sub: 'Call or message us anytime', href: `tel:${phone.replace(/[^+0-9]/g, '')}`,
      external: false,
    },
    {
      icon: Mail, label: 'Email', value: email,
      sub: 'We reply within 24 hours', href: `mailto:${email}`,
      external: false,
    },
    {
      icon: MapPin, label: 'Location', value: address,
      sub: 'Find us on Google Maps', href: mapUrl,
      external: true,
    },
  ]

  return (
    <div style={{ background: '#F9F5F0' }}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="pt-8 pb-14" style={{ background: '#F9F5F0' }}>
        <div className="luxury-container">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase mb-10"
            style={{ color: '#b8976b' }}>
            <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
            <span style={{ color: '#d5c9bc' }}>›</span>
            <span>Contact</span>
          </div>

          <div className="max-w-xl">
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-4" style={{ color: '#b8976b' }}>
              Get In Touch
            </p>
            <h1 className="text-5xl lg:text-6xl font-light leading-[1.06] mb-5"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              We&rsquo;d Love to<br />
              <em style={{ color: '#b8976b' }}>Hear From You</em>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#7a6a5e' }}>
              Whether you have a question about our services, want to book an appointment,
              or simply want to say hello — our team is here for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Gold divider ────────────────────────────────────── */}
      <div className="luxury-container">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #b8976b55, transparent)' }} />
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="luxury-container">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-start">

            {/* LEFT — contact info */}
            <div>
              <div className="space-y-4 mb-10">
                {cards.map(card => {
                  const Icon = card.icon
                  return (
                    <a
                      key={card.label}
                      href={card.href}
                      {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="flex items-start gap-4 p-5 rounded-sm border transition-all group"
                      style={{ borderColor: '#e8ddd4', background: '#fff' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#b8976b'
                        e.currentTarget.style.background  = '#fdfaf7'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e8ddd4'
                        e.currentTarget.style.background  = '#fff'
                      }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#f5ede3', border: '1px solid #e0cdb8' }}>
                        <Icon className="w-4 h-4" style={{ color: '#b8976b' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-0.5"
                          style={{ color: '#b8976b' }}>{card.label}</p>
                        <p className="text-sm font-medium leading-snug" style={{ color: '#1a1410' }}>{card.value}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#9a8070' }}>{card.sub}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 mt-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
                        style={{ color: '#b8976b' }} />
                    </a>
                  )
                })}
              </div>

              {/* Opening hours */}
              <div className="p-6 rounded-sm border" style={{ borderColor: '#e8ddd4', background: '#fff' }}>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#f5ede3', border: '1px solid #e0cdb8' }}>
                    <Clock className="w-3.5 h-3.5" style={{ color: '#b8976b' }} />
                  </div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#b8976b' }}>
                    Opening Hours
                  </p>
                </div>
                <div className="space-y-2.5">
                  {hours.map(h => (
                    <div key={h.day} className="flex justify-between items-center pb-2.5 border-b last:border-0 last:pb-0"
                      style={{ borderColor: '#f0e8e0' }}>
                      <span className="text-xs font-medium" style={{ color: '#3d2e25' }}>{h.day}</span>
                      <span className="text-xs font-medium"
                        style={{ color: h.closed ? '#c0392b' : '#7a6a5e' }}>
                        {h.closed ? 'Closed' : `${fmt24(h.open)} – ${fmt24(h.close)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — contact form */}
            <div className="p-8 lg:p-10 rounded-sm border" style={{ borderColor: '#e8ddd4', background: '#fff' }}>
              <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-2" style={{ color: '#b8976b' }}>
                Send a Message
              </p>
              <h2 className="text-2xl font-light mb-8"
                style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                How can we help you?
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section className="py-14" style={{ background: '#1a1410' }}>
        <div className="luxury-container flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-1" style={{ color: '#b8976b' }}>
              Ready to book?
            </p>
            <p className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Skip the wait — reserve your slot online in 2 minutes.
            </p>
          </div>
          <Link href="/booking"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase rounded-sm transition-all flex-shrink-0 group"
            style={{ background: '#b8976b', color: '#1a1410' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#c9a87a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#b8976b')}>
            Book Appointment
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
