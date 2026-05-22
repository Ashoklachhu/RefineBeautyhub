'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.2">
        <circle cx="20" cy="12" r="7" /><path d="M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12" /><path d="M26 20l4 4M30 24l4-2" />
      </svg>
    ),
    title: 'Skin Care',
    desc: 'Advanced treatments for healthy, glowing skin.',
    href: '/services?category=skin',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.2">
        <path d="M20 4c0 0-8 4-8 14s8 14 8 14 8-4 8-14S20 4 20 4z" /><path d="M12 18h16M12 22h16" /><path d="M16 8c-2 3-3 7-3 10" /><path d="M24 8c2 3 3 7 3 10" />
      </svg>
    ),
    title: 'Hair Care',
    desc: 'Stylish cuts, colouring, treatments & more.',
    href: '/services?category=hair',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.2">
        <path d="M10 30l4-8 4 4 4-10 4 6" /><circle cx="28" cy="12" r="3" /><rect x="6" y="32" width="28" height="4" rx="1" />
      </svg>
    ),
    title: 'Makeup',
    desc: 'Bridal, party & editorial makeup by experts.',
    href: '/services?category=makeup',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.2">
        <path d="M14 8v20M18 6v22M22 6v22M26 8v20" strokeLinecap="round" /><path d="M10 30q10 6 20 0" strokeLinecap="round" />
      </svg>
    ),
    title: 'Nails',
    desc: 'Nail art, extensions & premium nail care.',
    href: '/services?category=nails',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.2">
        <ellipse cx="20" cy="20" rx="12" ry="6" /><path d="M8 20q5-8 12-8t12 8" /><circle cx="20" cy="20" r="2" fill="currentColor" />
      </svg>
    ),
    title: 'Lashes & Brows',
    desc: 'Perfect lashes & brows that define you.',
    href: '/services?category=lashes',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.2">
        <circle cx="20" cy="14" r="6" /><path d="M14 14c0-2 3-8 6-8s6 6 6 8" /><path d="M10 36l2-8h16l2 8" strokeLinejoin="round" />
      </svg>
    ),
    title: 'PMU',
    desc: 'Permanent makeup for a flawless look.',
    href: '/services?category=pmu',
  },
]

export function FeaturedServices() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="luxury-container">
        <div className="grid lg:grid-cols-[360px_1fr] gap-16 xl:gap-24 items-start">

          {/* ── Left: heading + CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ color: '#b8976b' }}>
              Our Services
            </p>
            <h2 className="text-4xl lg:text-5xl font-light leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              Beauty That<br />
              <em style={{ color: '#b8976b' }}>Defines You</em>
            </h2>
            <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: '#7a6a5e' }}>
              From everyday beauty to special occasions, we offer a wide range of services
              to make you look and feel your best.
            </p>
            <Link href="/services"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold
                         tracking-[0.15em] uppercase rounded-sm transition-all group"
              style={{ background: '#1a1410', color: '#fff' }}>
              View All Services
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* ── Right: 2×3 service cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
            {SERVICES.map((svc, i) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-60px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
              >
                <Link href={svc.href}
                  className="group flex flex-col items-center text-center p-6 border rounded-sm
                             transition-all duration-300 hover:shadow-md"
                  style={{ borderColor: '#e8ddd4', background: '#fdfaf7' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#b8976b'
                    e.currentTarget.style.background = '#fdf6ee'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e8ddd4'
                    e.currentTarget.style.background = '#fdfaf7'
                  }}>
                  {/* Icon */}
                  <div className="mb-4 transition-colors" style={{ color: '#b8976b' }}>
                    {svc.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xs font-bold tracking-[0.15em] uppercase mb-2"
                    style={{ color: '#1a1410' }}>
                    {svc.title}
                  </h3>

                  {/* Desc */}
                  <p className="text-[11px] leading-relaxed mb-4" style={{ color: '#9a8070' }}>
                    {svc.desc}
                  </p>

                  {/* Explore link */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                                   tracking-[0.2em] uppercase transition-colors"
                    style={{ color: '#b8976b' }}>
                    Explore
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
