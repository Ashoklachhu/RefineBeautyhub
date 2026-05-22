'use client'

import { motion } from 'framer-motion'
import { Award, Sparkles, Heart, Shield, Flower2, GraduationCap } from 'lucide-react'

const REASONS = [
  {
    icon: Award,
    title: 'Expert Professionals',
    desc: 'International certifications, years of experience across top salons worldwide.',
    stat: '12+ Experts',
  },
  {
    icon: Sparkles,
    title: 'Premium Products',
    desc: 'Luxury, skin-safe brands trusted by top professionals. Nothing but the best.',
    stat: 'Luxury Brands',
  },
  {
    icon: Heart,
    title: 'Personalized Service',
    desc: 'Every treatment is tailored to your unique needs, skin type, and desired outcome.',
    stat: '100% Tailored',
  },
  {
    icon: Shield,
    title: 'Hygienic & Safe',
    desc: 'Strict hygiene standards, sterilized tools, and a spotless environment every visit.',
    stat: 'Certified Safe',
  },
  {
    icon: Flower2,
    title: 'Serene Ambiance',
    desc: 'A calming, luxurious space designed to make every visit a truly relaxing experience.',
    stat: 'Premium Space',
  },
  {
    icon: GraduationCap,
    title: 'Academy Certified',
    desc: 'Our in-house academy trains the next generation of beauty professionals.',
    stat: '500+ Trained',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28" style={{ background: '#F9F5F0' }}>
      <div className="luxury-container">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#b8976b' }}>
            Why Choose Us
          </p>
          <h2 className="text-4xl lg:text-5xl font-light leading-[1.1]"
            style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
            The Refined<br />
            <em style={{ color: '#b8976b' }}>Difference</em>
          </h2>
        </motion.div>

        {/* 2×3 grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((r, i) => {
            const Icon = r.icon
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-60px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                className="group p-7 rounded-sm border transition-all duration-300 hover:shadow-md"
                style={{ borderColor: '#e8ddd4', background: '#fff' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#b8976b'
                  e.currentTarget.style.background = '#fdf6ee'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e8ddd4'
                  e.currentTarget.style.background = '#fff'
                }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full border mb-5 flex items-center justify-center"
                  style={{ borderColor: '#d4b896', background: '#fdf6ee' }}>
                  <Icon className="w-5 h-5" style={{ color: '#b8976b' }} />
                </div>

                {/* Stat chip */}
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
                  style={{ color: '#b8976b' }}>
                  {r.stat}
                </p>

                <h3 className="text-base font-semibold mb-2"
                  style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410', fontSize: 18 }}>
                  {r.title}
                </h3>
                <p className="text-[12px] leading-relaxed" style={{ color: '#7a6a5e' }}>
                  {r.desc}
                </p>

                {/* Bottom gold bar on hover */}
                <div className="mt-5 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: 'linear-gradient(to right, #b8976b, #d4b896)' }} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
