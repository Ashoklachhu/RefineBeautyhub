'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CalendarCheck, Phone, ArrowRight } from 'lucide-react'
import { SITE } from '@/constants'

export function CTABanner() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: '#1a1410' }}>
      {/* Dot texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
        <div className="w-full h-full"
          style={{ backgroundImage: 'radial-gradient(#b8976b 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Gold glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: '#b8976b18' }} />

      <div className="relative z-10 luxury-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Divider ornament */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-16" style={{ background: '#b8976b55' }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#b8976b' }} />
            <span className="text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: '#b8976b' }}>
              Book Your Experience
            </span>
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#b8976b' }} />
            <span className="h-px w-16" style={{ background: '#b8976b55' }} />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-4 text-white"
            style={{ fontFamily: 'var(--font-cormorant)' }}>
            Ready to Look &amp; Feel<br />
            <em style={{ color: '#c9a87a' }}>Your Absolute Best?</em>
          </h2>

          <p className="text-sm mb-12 max-w-md mx-auto" style={{ color: '#a09080' }}>
            Book your appointment today and experience the luxury of Refined Beauty Hub.
            Walk-in welcome. No commitment required.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/booking"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-semibold
                         tracking-[0.15em] uppercase rounded-sm transition-all group"
              style={{ background: '#b8976b', color: '#1a1410' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#c9a87a')}
              onMouseLeave={e => (e.currentTarget.style.background = '#b8976b')}>
              <CalendarCheck className="w-4 h-4" />
              Book Appointment
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href={`tel:${SITE.phone.replace(/[^+0-9]/g, '')}`}
              className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-semibold
                         tracking-[0.15em] uppercase border rounded-sm transition-all group"
              style={{ borderColor: '#b8976b66', color: '#c9a87a' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#b8976b'
                e.currentTarget.style.background = '#b8976b15'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#b8976b66'
                e.currentTarget.style.background = 'transparent'
              }}>
              <Phone className="w-4 h-4" />
              {SITE.phone}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
