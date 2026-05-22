'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck } from 'lucide-react'

const STATS = [
  { value: '8+',    label: 'Years of Excellence' },
  { value: '5,000+', label: 'Happy Clients'      },
  { value: '12+',   label: 'Expert Artists'      },
  { value: '500+',  label: 'Students Trained'    },
]

const VALUES = [
  {
    title: 'Our Mission',
    body:  'To deliver an unparalleled beauty experience that empowers every client to feel confident, radiant, and truly themselves — through world-class services and genuine care.',
  },
  {
    title: 'Our Vision',
    body:  'To be the most trusted name in luxury beauty across Nepal, setting the standard for artistry, education, and client experience in the region.',
  },
  {
    title: 'Our Values',
    body:  'Excellence in every detail. Integrity in every interaction. Innovation that respects tradition. Passion that drives perfection.',
  },
]

const TEAM = [
  { name: 'Sunita Shrestha', role: 'Founder & Lead Artist',   initials: 'SS' },
  { name: 'Anita Maharjan',  role: 'Senior Hair Specialist',  initials: 'AM' },
  { name: 'Roshani Karki',   role: 'Skincare Expert',         initials: 'RK' },
  { name: 'Priya Thapa',     role: 'Nail & Lash Technician',  initials: 'PT' },
]

const WHY = [
  { label: 'International Brands',    desc: 'Olaplex, Redken, Dermalogica, OPI & more' },
  { label: 'Certified Professionals', desc: 'Every artist is trained & accredited'      },
  { label: 'Hygienic Standards',       desc: 'Hospital-grade cleanliness protocols'       },
]

const fade = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay },
})

export default function AboutPage() {
  return (
    <div style={{ background: '#F9F5F0' }}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="pt-8 pb-16" style={{ background: '#F9F5F0' }}>
        <div className="luxury-container">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase mb-10"
            style={{ color: '#b8976b' }}>
            <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
            <span style={{ color: '#d5c9bc' }}>›</span>
            <span>About Us</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fade(0.1)}>
              <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-4" style={{ color: '#b8976b' }}>
                Our Story
              </p>
              <h1 className="text-5xl lg:text-6xl font-light leading-[1.06] mb-6"
                style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                Where Beauty<br />Meets
                <em style={{ color: '#b8976b' }}> Excellence</em>
              </h1>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#7a6a5e' }}>
                Refined Beauty Hub was founded with a single belief: that every person deserves
                access to luxury beauty — not as an indulgence, but as an essential form of
                self-expression and confidence.
              </p>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#7a6a5e' }}>
                From our home in Lazimpat, Kathmandu, we have served thousands of clients,
                trained hundreds of professionals, and quietly raised the standard for what
                beauty in Nepal can be.
              </p>
              <Link href="/booking"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase rounded-sm transition-all group"
                style={{ background: '#1a1410', color: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2d2419')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1a1410')}>
                <CalendarCheck className="w-3.5 h-3.5" />
                Book an Experience
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div {...fade(0.2)}
              className="relative aspect-[4/3] rounded-sm overflow-hidden"
              style={{ background: '#e8ddd4' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center" style={{ opacity: 0.2 }}>
                  <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center mx-auto mb-3"
                    style={{ borderColor: '#b8976b' }}>
                    <span className="text-3xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: '#b8976b' }}>RB</span>
                  </div>
                  <p className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: '#b8976b' }}>Salon Photo</p>
                </div>
              </div>
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l" style={{ borderColor: '#b8976b55' }} />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r" style={{ borderColor: '#b8976b55' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <section className="py-14" style={{ background: '#1a1410' }}>
        <div className="luxury-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...fade(i * 0.1)}>
                <p className="text-4xl lg:text-5xl font-light mb-1"
                  style={{ fontFamily: 'var(--font-cormorant)', color: '#c9a87a' }}>
                  {s.value}
                </p>
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase" style={{ color: '#7a6a5e' }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ────────────────────────── */}
      <section className="py-20 lg:py-24" style={{ background: '#F9F5F0' }}>
        <div className="luxury-container">
          <motion.div {...fade()} className="text-center mb-14">
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-3" style={{ color: '#b8976b' }}>
              What Drives Us
            </p>
            <h2 className="text-4xl lg:text-5xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              Purpose &amp; <em style={{ color: '#b8976b' }}>Principles</em>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} {...fade(i * 0.1)}
                className="p-8 rounded-sm border relative"
                style={{ borderColor: '#e8ddd4', background: '#fff' }}>
                <span className="absolute top-6 right-6 text-4xl font-light"
                  style={{ fontFamily: 'var(--font-cormorant)', color: '#b8976b', opacity: 0.15 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-10 h-0.5 mb-5" style={{ background: '#b8976b' }} />
                <h3 className="text-lg font-light mb-3"
                  style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a6a5e' }}>{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="luxury-container">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #b8976b55, transparent)' }} />
      </div>

      {/* ── Meet the Team ────────────────────────────────────── */}
      <section className="py-20 lg:py-24" style={{ background: '#F9F5F0' }}>
        <div className="luxury-container">
          <motion.div {...fade()} className="text-center mb-14">
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-3" style={{ color: '#b8976b' }}>
              The People Behind The Magic
            </p>
            <h2 className="text-4xl lg:text-5xl font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              Meet Our <em style={{ color: '#b8976b' }}>Team</em>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={member.name} {...fade(i * 0.08)} className="text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
                  style={{ background: '#ede5db', borderColor: '#e0d0c0' }}>
                  <span className="text-2xl font-light"
                    style={{ fontFamily: 'var(--font-cormorant)', color: '#b8976b' }}>
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-base font-light mb-0.5"
                  style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                  {member.name}
                </h3>
                <p className="text-[11px] font-medium tracking-wide" style={{ color: '#9a8070' }}>
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose us ────────────────────────────────────── */}
      <section className="py-14 border-t" style={{ borderColor: '#e8ddd4', background: '#fff' }}>
        <div className="luxury-container">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {WHY.map((item, i) => (
              <motion.div key={item.label} {...fade(i * 0.1)}>
                <div className="w-8 h-0.5 mx-auto mb-4" style={{ background: '#b8976b' }} />
                <h4 className="text-base font-light mb-1.5"
                  style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>{item.label}</h4>
                <p className="text-xs leading-relaxed" style={{ color: '#9a8070' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#1a1410' }}>
        <div className="luxury-container text-center">
          <motion.div {...fade()}>
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-4" style={{ color: '#b8976b' }}>
              Experience The Difference
            </p>
            <h2 className="text-4xl lg:text-5xl font-light text-white mb-4"
              style={{ fontFamily: 'var(--font-cormorant)' }}>
              Ready to Begin Your<br />
              <em style={{ color: '#c9a87a' }}>Beauty Journey?</em>
            </h2>
            <p className="text-sm mb-10 max-w-sm mx-auto" style={{ color: '#7a6a5e' }}>
              Book your first appointment and discover why thousands of clients call RBH their beauty home.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/booking"
                className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-semibold tracking-[0.15em] uppercase rounded-sm transition-all group"
                style={{ background: '#b8976b', color: '#1a1410' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#c9a87a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#b8976b')}>
                Book Appointment
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/contact"
                className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-semibold tracking-[0.15em] uppercase border rounded-sm transition-all group"
                style={{ borderColor: '#b8976b55', color: '#c9a87a' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8976b'; e.currentTarget.style.background = '#b8976b15' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#b8976b55'; e.currentTarget.style.background = 'transparent' }}>
                Contact Us
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
