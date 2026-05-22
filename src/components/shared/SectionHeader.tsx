'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description?: string
  centered?: boolean
  light?: boolean
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  centered = true,
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(centered ? 'text-center' : 'text-left', className)}
    >
      {eyebrow && (
        <div className="flex items-center gap-3 mb-4" style={centered ? { justifyContent: 'center' } : {}}>
          <span className="gold-divider" />
          <span
            className={cn(
              'text-xs font-semibold tracking-[0.25em] uppercase',
              light ? 'text-gold-300' : 'text-gold-500'
            )}
          >
            {eyebrow}
          </span>
          <span className="gold-divider" />
        </div>
      )}

      <h2
        className={cn(
          'text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.15]',
          light ? 'text-white' : 'text-foreground'
        )}
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        {titleHighlight ? (
          <>
            {title}{' '}
            <em
              className="not-italic font-medium"
              style={{ color: light ? 'oklch(0.83 0.12 72)' : undefined }}
            >
              {titleHighlight}
            </em>
          </>
        ) : (
          title
        )}
      </h2>

      {description && (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed max-w-2xl',
            centered ? 'mx-auto' : '',
            light ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  )
}
