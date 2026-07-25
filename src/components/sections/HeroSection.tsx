'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck } from 'lucide-react'

const fade = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
})

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#F9F5F0' }}>

      {/* ── Mobile layout: stacked column ──────────────────────── */}
      {/* ── Desktop layout: full-width banner, text overlaid on the
             empty left area. The banner keeps its native 1720×914
             aspect ratio so it looks identical on every screen. ──── */}
      <div className="flex flex-col lg:block min-h-[100svh] lg:min-h-0">

        {/* ── LEFT — text panel ──────────────────────────────────── */}
        <div className="relative z-20 flex flex-col justify-center
                        px-4 sm:px-6 md:px-14 lg:px-16 xl:px-24
                        pt-28 sm:pt-32 pb-10 lg:pt-20 lg:pb-0
                        w-full lg:absolute lg:top-0 lg:bottom-0 lg:left-0 lg:w-[52%] xl:w-[48%]">

          {/* Eyebrow */}
          <motion.p {...fade(0.1)}
            className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] uppercase mb-6"
            style={{ color: '#b8976b' }}>
            <span className="w-8 h-px" style={{ background: '#b8976b' }} />
            Enhance. Empower. Elevate.
          </motion.p>

          {/* Headline */}
          <motion.h1 {...fade(0.2)}
            className="text-[2.2rem] sm:text-5xl lg:text-[3.4vw]
                       leading-[1.08] font-light mb-5"
            style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
            Refine Your Beauty,<br />
            <em style={{ color: '#b8976b' }}>Refine Your Confidence.</em>
          </motion.h1>

          {/* Description */}
          <motion.p {...fade(0.3)}
            className="text-sm leading-relaxed max-w-[360px] mb-8"
            style={{ color: '#7a6a5e' }}>
            Refined Beauty Hub is your destination for premium beauty services and professional
            training. Where artistry meets excellence and passion builds perfection.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fade(0.4)} className="flex flex-wrap gap-3">
            <Link href="/booking"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-semibold
                         tracking-[0.15em] uppercase transition-all rounded-sm group"
              style={{ background: '#1a1410', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2d2419')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1a1410')}>
              <CalendarCheck className="w-3.5 h-3.5" />
              Book a Service
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/academy"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-semibold
                         tracking-[0.15em] uppercase border transition-all rounded-sm group"
              style={{ borderColor: '#1a1410', color: '#1a1410' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#1a1410'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#1a1410'
              }}>
              Explore Training
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* ── RIGHT / BOTTOM — image panel ───────────────────────── */}
        {/* Mobile: full-width image below text                       */}
        {/* Desktop: absolute right panel                             */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-[55vw] sm:h-[45vw] lg:h-auto lg:aspect-[1720/914]"
        >
          <div className="w-full h-full relative overflow-hidden">
            <Image
              src="https://res.cloudinary.com/dosxengut/image/upload/v1784980935/web-banner_e98ttk.png"
              alt="Refined Beauty Hub — luxury beauty services"
              fill
              priority
              className="object-cover object-top"
              sizes="100vw"
            />

            {/* Soft cream wash over the empty left side so the overlaid
                text stays readable — desktop only */}
            <div className="absolute left-0 top-0 bottom-0 w-[60%] z-10 hidden lg:block"
              style={{ background: 'linear-gradient(to right, rgba(249,245,240,0.95) 0%, rgba(249,245,240,0.45) 45%, transparent 75%)' }} />

            {/* Top fade — mobile only */}
            <div className="absolute top-0 left-0 right-0 h-16 z-10 lg:hidden"
              style={{ background: 'linear-gradient(to bottom, #F9F5F0, transparent)' }} />

            {/* Subtle vignette */}
            <div className="absolute inset-0 z-10"
              style={{ background: 'linear-gradient(135deg, transparent 55%, rgba(26,20,16,0.18) 100%)' }} />

            {/* RB monogram — desktop only */}
            <div className="absolute bottom-14 right-10 z-20 hidden lg:block" style={{ opacity: 0.22 }}>
              <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: '#fff', background: 'rgba(26,20,16,0.25)', backdropFilter: 'blur(4px)' }}>
                <span className="text-4xl font-light text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>RB</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Corner ornament — desktop only */}
      <div className="absolute bottom-8 left-8 hidden lg:block" style={{ opacity: 0.08 }}>
        <div className="w-16 h-16 border rotate-45" style={{ borderColor: '#b8976b' }} />
      </div>

    </section>
  )
}
