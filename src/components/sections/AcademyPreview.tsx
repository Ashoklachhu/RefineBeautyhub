'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Users, BookOpen, Award, Briefcase } from 'lucide-react'

const STATS = [
  { icon: Users,    value: '500+',  label: 'Trained Students'      },
  { icon: BookOpen, value: '15+',   label: 'Professional Courses'  },
  { icon: Award,    value: '100%',  label: 'Placement Support'     },
  { icon: Briefcase,value: 'Expert',label: 'Industry Trainers'     },
]

export function AcademyPreview() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#1a1410' }}>
      <div className="luxury-container py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: text + stats ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow */}
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ color: '#b8976b' }}>
              Build Skills. Build Success.
            </p>

            {/* Heading */}
            <h2 className="text-4xl lg:text-5xl font-light leading-[1.12] mb-6 text-white"
              style={{ fontFamily: 'var(--font-cormorant)' }}>
              Professional Beauty<br />
              <em style={{ color: '#c9a87a' }}>Training Programs</em>
            </h2>

            {/* Body */}
            <p className="text-sm leading-relaxed mb-10 max-w-sm" style={{ color: '#b0a090' }}>
              Learn from industry experts and gain the knowledge, confidence, and certification
              to build a successful career in the beauty industry.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              {STATS.map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: '#b8976b44', background: '#b8976b15' }}>
                      <Icon className="w-4 h-4" style={{ color: '#c9a87a' }} />
                    </div>
                    <div>
                      <p className="text-2xl font-light leading-none" style={{ fontFamily: 'var(--font-cormorant)', color: '#c9a87a' }}>
                        {s.value}
                      </p>
                      <p className="text-[11px] mt-1 leading-tight" style={{ color: '#8a7a6a' }}>
                        {s.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <Link href="/academy"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold
                         tracking-[0.15em] uppercase rounded-sm transition-all group border"
              style={{ borderColor: '#b8976b', color: '#c9a87a' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#b8976b'
                e.currentTarget.style.color = '#1a1410'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#c9a87a'
              }}>
              Explore Courses
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* ── Right: image placeholder ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative rounded-sm overflow-hidden"
            style={{ height: 460, background: '#2d2419' }}
          >
            {/* Image placeholder */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center" style={{ opacity: 0.2 }}>
                <div className="w-36 h-36 rounded-full border-2 flex items-center justify-center mx-auto mb-4"
                  style={{ borderColor: '#b8976b' }}>
                  <span className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: '#b8976b' }}>RB</span>
                </div>
                <p className="text-xs tracking-[0.3em] uppercase" style={{ color: '#b8976b' }}>Academy Image</p>
              </div>
            </div>

            {/* Decorative corner lines */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t border-l" style={{ borderColor: '#b8976b55' }} />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r" style={{ borderColor: '#b8976b55' }} />
          </motion.div>
        </div>
      </div>

      {/* Background texture dots */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <div className="w-full h-full"
          style={{ backgroundImage: 'radial-gradient(#b8976b 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>
    </section>
  )
}
