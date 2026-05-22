'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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

// 8 placeholder gallery items — replace bg with real images via next/image
const ITEMS = [
  { id: 1, label: 'Eye Makeup',  tall: false, bg: '#e0d4cc' },
  { id: 2, label: 'Skin Glow',  tall: false, bg: '#d5c9bc' },
  { id: 3, label: 'Hair Style', tall: false, bg: '#e8ddd4' },
  { id: 4, label: 'Bridal',     tall: false, bg: '#ddd0c5' },
  { id: 5, label: 'Nails',      tall: false, bg: '#d0c4b8' },
  { id: 6, label: 'Lashes',     tall: false, bg: '#e8ddd4' },
  { id: 7, label: 'Academy',    tall: false, bg: '#d5c9bc' },
  { id: 8, label: 'Brows',      tall: false, bg: '#ddd0c5' },
]

export function GalleryPreview() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="luxury-container">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-1">
            <span className="h-px w-16" style={{ background: '#d5c9bc' }} />
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase flex items-center gap-2"
              style={{ color: '#b8976b' }}>
              Follow Us
            </p>
            <span className="h-px w-16" style={{ background: '#d5c9bc' }} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8" style={{ background: '#d5c9bc' }} />
            <a
              href="https://instagram.com/refinedbeautyhub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium tracking-[0.15em] uppercase transition-colors"
              style={{ color: '#1a1410' }}>
              <InstagramIcon className="w-4 h-4" style={{ color: '#b8976b' }} />
              @RefinedBeautyHub
            </a>
            <span className="h-px w-8" style={{ background: '#d5c9bc' }} />
          </div>
        </motion.div>

        {/* ── Photo grid ── */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-10">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="aspect-square rounded-sm overflow-hidden group relative cursor-pointer"
              style={{ background: item.bg }}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: 'rgba(26,20,16,0.45)' }}>
                <InstagramIcon className="w-5 h-5 text-white" />
              </div>
              {/* Placeholder label */}
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[9px] tracking-widest uppercase font-medium"
                  style={{ color: '#b8976b', opacity: 0.4 }}>
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mb-10">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-full transition-all"
              style={{
                width: i === 0 ? 20 : 6, height: 6,
                background: i === 0 ? '#b8976b' : '#d5c9bc',
              }} />
          ))}
        </div>

        {/* View gallery CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link href="/gallery"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold
                       tracking-[0.15em] uppercase border rounded-sm transition-all group"
            style={{ borderColor: '#1a1410', color: '#1a1410' }}>
            View Full Gallery
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
