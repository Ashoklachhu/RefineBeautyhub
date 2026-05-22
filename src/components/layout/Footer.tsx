import Link from 'next/link'
import { Camera, Globe, PlayCircle, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { NAV_LINKS, SITE } from '@/constants'
import { createServiceClient } from '@/lib/supabase/server'
import type { SiteSettings, OpeningHourEntry } from '@/types/database'

// ── Static nav links (not user-editable) ─────────────────────

const SERVICES_LINKS = [
  { label: 'Hair Services',   href: '/services#hair' },
  { label: 'Skin & Facials',  href: '/services#skin' },
  { label: 'Nails',           href: '/services#nails' },
  { label: 'Makeup',          href: '/services#makeup' },
  { label: 'Lash Extensions', href: '/services#lashes' },
  { label: 'Bridal Packages', href: '/services#bridal' },
]

const ACADEMY_LINKS = [
  { label: 'Hair Artistry Course', href: '/academy#hair' },
  { label: 'Makeup Mastery',       href: '/academy#makeup' },
  { label: 'Nail Technician',      href: '/academy#nails' },
  { label: 'Skincare Professional',href: '/academy#skincare' },
  { label: 'Enroll Now',           href: '/academy#enroll' },
]

// ── Helpers ───────────────────────────────────────────────────

/** Convert 24-hour "HH:mm" to "h:mm AM/PM" */
function fmt24(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// ── Data fetch ────────────────────────────────────────────────

async function loadSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single()
    return data as SiteSettings | null
  } catch {
    return null
  }
}

// ── Component ─────────────────────────────────────────────────

export async function Footer() {
  const settings = await loadSettings()

  // Fall back to constants if DB not yet seeded
  const phone     = settings?.phone     ?? SITE.phone
  const email     = settings?.email     ?? SITE.email
  const address   = settings?.address   ?? SITE.address
  const mapUrl    = settings?.map_url   ?? SITE.mapUrl
  const instagram = settings?.instagram ?? SITE.instagram
  const facebook  = settings?.facebook  ?? SITE.facebook
  const youtube   = settings?.youtube   ?? SITE.youtube

  const hours: OpeningHourEntry[] = settings?.opening_hours?.length
    ? settings.opening_hours
    : [
        { day: 'Sunday',    open: '10:00', close: '19:00', closed: false },
        { day: 'Monday',    open: '10:00', close: '19:00', closed: false },
        { day: 'Tuesday',   open: '10:00', close: '19:00', closed: false },
        { day: 'Wednesday', open: '10:00', close: '19:00', closed: false },
        { day: 'Thursday',  open: '10:00', close: '19:00', closed: false },
        { day: 'Friday',    open: '10:00', close: '20:00', closed: false },
        { day: 'Saturday',  open: '09:00', close: '20:00', closed: false },
      ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-charcoal-950 text-white/80">
      {/* Main footer */}
      <div className="luxury-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex flex-col leading-none mb-6">
              <span
                className="text-2xl font-light tracking-[0.12em] text-white uppercase"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Refined
              </span>
              <span className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">
                Beauty Hub
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Kathmandu&apos;s premier luxury beauty salon and academy. Where artistry meets excellence.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4">
              {[
                { icon: Camera,     href: instagram, label: 'Instagram' },
                { icon: Globe,      href: facebook,  label: 'Facebook' },
                { icon: PlayCircle, href: youtube,   label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-gold-400 hover:bg-gold-400/10 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-400 mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 h-px bg-gold-400 group-hover:w-3 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/booking"
                  className="text-sm text-gold-400 hover:text-gold-300 font-medium transition-colors"
                >
                  Book Appointment →
                </Link>
              </li>
            </ul>
          </div>

          {/* Services & Academy */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-400 mb-5">
              Services
            </h4>
            <ul className="space-y-3 mb-8">
              {SERVICES_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-400 mb-5">
              Academy
            </h4>
            <ul className="space-y-3">
              {ACADEMY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-400 mb-5">
              Contact &amp; Hours
            </h4>
            <ul className="space-y-4 mb-8">
              <li>
                <a
                  href={`tel:${phone.replace(/[^+0-9]/g, '')}`}
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <Phone className="w-4 h-4 text-gold-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div>{phone}</div>
                    <div className="text-white/40 text-xs">Call or WhatsApp</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <Mail className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                  <span>{address}</span>
                </a>
              </li>
            </ul>

            {/* Opening Hours */}
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gold-400" />
              <h5 className="text-xs font-semibold tracking-wider uppercase text-white/80">
                Opening Hours
              </h5>
            </div>
            <ul className="space-y-1.5">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between text-xs text-white/50">
                  <span>{h.day}</span>
                  <span className={h.closed ? 'text-red-400' : 'text-white/70'}>
                    {h.closed ? 'Closed' : `${fmt24(h.open)} – ${fmt24(h.close)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Gold divider */}
      <div className="luxury-container">
        <div className="h-px gold-gradient opacity-30" />
      </div>

      {/* Bottom bar */}
      <div className="luxury-container py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {currentYear} Refined Beauty Hub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-white/70 transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-white/70 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
