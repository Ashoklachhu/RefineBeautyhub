'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Heart, Eye, Star } from 'lucide-react'

const PILLARS = [
  {
    icon: Heart,
    title: 'Our Mission',
    desc: 'To empower confidence through premium beauty services and quality education.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    desc: 'To be a leading beauty hub known for excellence, innovation and skill development.',
  },
  {
    icon: Star,
    title: 'Our Values',
    desc: 'Passion, Integrity, Quality and Continuous Growth.',
  },
]

export function AboutPreview() {
  return (
    <section className="py-20 lg:py-28" style={{ background: '#F9F5F0' }}>
      <div className="luxury-container">
        <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-12 lg:gap-8 xl:gap-14 items-center">

          {/* ── Col 1: Image mosaic ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Top image */}
            <div className="rounded-sm overflow-hidden mb-3 relative" style={{ height: 240 }}>
              <Image
                src="https://res.cloudinary.com/dosxengut/image/upload/v1778961728/489e3a9554d378d489e6e47b7363207c_o3gp1p.jpg"
                alt="Refined Beauty Hub salon interior"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center"
              />
            </div>
            {/* Bottom image — offset right */}
            <div className="rounded-sm overflow-hidden ml-10 relative" style={{ height: 180 }}>
              <Image
                src="https://res.cloudinary.com/dosxengut/image/upload/v1778961728/489e3a9554d378d489e6e47b7363207c_o3gp1p.jpg"
                alt="Refined Beauty Hub salon interior"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center"
              />
            </div>

            {/* RB badge overlay */}
            <div className="absolute -bottom-4 left-4 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center shadow-lg"
              style={{ background: '#F9F5F0', borderColor: '#b8976b' }}>
              <span className="text-2xl font-light leading-none" style={{ fontFamily: 'var(--font-cormorant)', color: '#b8976b' }}>RB</span>
              <span className="text-[7px] tracking-[0.2em] uppercase mt-0.5" style={{ color: '#b8976b' }}>Beauty</span>
            </div>
          </motion.div>

          {/* ── Col 2: Center text ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-center lg:text-left"
          >
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ color: '#b8976b' }}>
              About Us
            </p>
            <h2 className="text-4xl lg:text-5xl font-light leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              Where Passion<br />
              <em style={{ color: '#b8976b' }}>Becomes Profession</em>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#7a6a5e' }}>
              At Refined Beauty Hub, we believe beauty is more than looks — it&apos;s an art.
              We are committed to delivering exceptional services and quality education that
              empowers individuals to shine with confidence.
            </p>
            <Link href="/about"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold
                         tracking-[0.15em] uppercase rounded-sm transition-all group"
              style={{ background: '#1a1410', color: '#fff' }}>
              Learn More
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* ── Col 3: Mission / Vision / Values ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="space-y-7"
          >
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: i * 0.1 + 0.2 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderColor: '#d4b896', background: '#fdf6ee' }}>
                    <Icon className="w-4 h-4" style={{ color: '#b8976b' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.1em] uppercase mb-1"
                      style={{ color: '#1a1410' }}>
                      {p.title}
                    </h4>
                    <p className="text-[12px] leading-relaxed" style={{ color: '#7a6a5e' }}>
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
