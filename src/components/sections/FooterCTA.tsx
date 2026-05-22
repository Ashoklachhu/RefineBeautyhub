'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
import { SITE } from '@/constants'

export function FooterCTA() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden" style={{ background: '#1a1410' }}>
      {/* Top gold line */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, #b8976b, transparent)' }} />

      {/* Faint giant text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.03 }}>
        <span className="text-[16vw] font-light text-white whitespace-nowrap"
          style={{ fontFamily: 'var(--font-cormorant)' }}>RBH</span>
      </div>

      {/* Dot texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <div className="w-full h-full"
          style={{ backgroundImage: 'radial-gradient(#b8976b 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="relative z-10 luxury-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-4"
            style={{ color: '#b8976b' }}>
            Visit Us In Kathmandu
          </p>

          <h2 className="text-4xl md:text-5xl font-light leading-[1.1] mb-4 text-white"
            style={{ fontFamily: 'var(--font-cormorant)' }}>
            Experience True<br />
            <em style={{ color: '#c9a87a' }}>Luxury Beauty</em>
          </h2>

          <p className="text-sm mb-10 max-w-sm mx-auto" style={{ color: '#a09080' }}>
            Lazimpat, Kathmandu · Open 7 days a week · 10:00 AM – 8:00 PM
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link href="/booking"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-semibold
                         tracking-[0.15em] uppercase rounded-sm transition-all group"
              style={{ background: '#b8976b', color: '#1a1410' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#c9a87a')}
              onMouseLeave={e => (e.currentTarget.style.background = '#b8976b')}>
              Reserve Your Spot
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href={SITE.mapUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-semibold
                         tracking-[0.15em] uppercase border rounded-sm transition-all"
              style={{ borderColor: '#b8976b55', color: '#c9a87a' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#b8976b'
                e.currentTarget.style.background = '#b8976b15'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#b8976b55'
                e.currentTarget.style.background = 'transparent'
              }}>
              <MapPin className="w-3.5 h-3.5" />
              Get Directions
            </a>
          </div>

          {/* Instagram */}
          <div className="flex items-center justify-center gap-2" style={{ color: '#7a6a5e' }}>
            <InstagramIcon className="w-4 h-4" style={{ color: '#b8976b' }} />
            <span className="text-sm">Follow our journey on</span>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold transition-colors"
              style={{ color: '#c9a87a' }}>
              @refinedbeautyhub
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
