'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface LuxuryCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gold?: boolean
  glass?: boolean
  delay?: number
}

export function LuxuryCard({
  children,
  className,
  hover = true,
  gold = false,
  glass = false,
  delay = 0,
}: LuxuryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -6, transition: { duration: 0.3 } } : undefined}
      className={cn(
        'rounded-2xl overflow-hidden transition-shadow duration-300',
        glass
          ? 'glass-card'
          : 'bg-card border border-border',
        gold && 'gold-border',
        hover && 'hover:shadow-[0_8px_40px_oklch(0.3_0_0/0.12)]',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
