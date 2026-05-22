'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: '1',
    client_name: 'Priya Sharma',
    service_label: 'Bridal Makeup & Hair',
    rating: 5,
    review: 'Refined Beauty Hub completely transformed my bridal look. The team understood exactly what I envisioned and exceeded every expectation. I felt like royalty on my wedding day.',
    initials: 'PS',
  },
  {
    id: '2',
    client_name: 'Anita Maharjan',
    service_label: 'Balayage & Colour',
    rating: 5,
    review: 'I have been going to RBH for my hair colour for over a year. The balayage they do is simply stunning — so natural and low-maintenance. Absolutely worth every rupee!',
    initials: 'AM',
  },
  {
    id: '3',
    client_name: 'Sujata Thapa',
    service_label: 'Luxury Glow Facial',
    rating: 5,
    review: 'The facial treatment here is next-level luxury. My skin has never looked better. The ambiance is so serene, I feel relaxed the moment I walk in. My absolute favourite place.',
    initials: 'ST',
  },
  {
    id: '4',
    client_name: 'Roshani Karki',
    service_label: 'Gel Nail Extensions',
    rating: 5,
    review: 'Every nail appointment is a treat. The artists are so precise and patient. The designs they create are incredible — I always get compliments. This is truly world-class work.',
    initials: 'RK',
  },
]

export function TestimonialsSection() {
  const [idx, setIdx] = useState(0)
  const prev = () => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => setIdx(i => (i + 1) % TESTIMONIALS.length)
  const t    = TESTIMONIALS[idx]

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="luxury-container">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#b8976b' }}>
            Client Love
          </p>
          <h2 className="text-4xl lg:text-5xl font-light leading-[1.1]"
            style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
            What Our Clients<br />
            <em style={{ color: '#b8976b' }}>Are Saying</em>
          </h2>
        </motion.div>

        {/* Testimonial card */}
        <div className="max-w-2xl mx-auto text-center relative">
          {/* Large quote mark */}
          <div className="flex justify-center mb-6" style={{ opacity: 0.15 }}>
            <Quote className="w-14 h-14" style={{ color: '#b8976b' }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#b8976b' }} />
                ))}
              </div>

              {/* Review text */}
              <blockquote className="text-lg lg:text-xl font-light leading-relaxed mb-8 italic"
                style={{ fontFamily: 'var(--font-cormorant)', color: '#3d2e25', fontSize: '1.25rem' }}>
                &ldquo;{t.review}&rdquo;
              </blockquote>

              {/* Client */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                  style={{ borderColor: '#b8976b', color: '#b8976b', background: '#fdf6ee' }}>
                  {t.initials}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: '#1a1410' }}>{t.client_name}</p>
                  <p className="text-[11px]" style={{ color: '#9a8070' }}>{t.service_label}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={prev}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all"
              style={{ borderColor: '#d5c9bc', color: '#9a8070' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#b8976b'
                e.currentTarget.style.color = '#b8976b'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#d5c9bc'
                e.currentTarget.style.color = '#9a8070'
              }}>
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === idx ? 20 : 6,
                    height: 6,
                    background: i === idx ? '#b8976b' : '#d5c9bc',
                  }} />
              ))}
            </div>

            <button onClick={next}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all"
              style={{ borderColor: '#d5c9bc', color: '#9a8070' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#b8976b'
                e.currentTarget.style.color = '#b8976b'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#d5c9bc'
                e.currentTarget.style.color = '#9a8070'
              }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
