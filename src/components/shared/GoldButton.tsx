'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { ArrowRight } from 'lucide-react'

interface GoldButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'gold' | 'outline' | 'ghost' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  className?: string
  external?: boolean
  disabled?: boolean
}

const sizeClasses = {
  sm: 'h-9 px-5 text-xs',
  md: 'h-11 px-7 text-sm',
  lg: 'h-13 px-9 text-base',
}

const variantClasses = {
  gold: 'gold-gradient text-white hover:opacity-90 shadow-sm',
  outline: 'bg-transparent border border-gold-400 text-foreground hover:bg-gold-400/8',
  ghost: 'bg-transparent text-gold-500 hover:bg-gold-400/8',
  dark: 'bg-charcoal-900 text-white hover:bg-charcoal-800 border border-white/10',
}

export function GoldButton({
  href,
  onClick,
  children,
  variant = 'gold',
  size = 'md',
  icon = false,
  className,
  external = false,
  disabled = false,
}: GoldButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide',
    'transition-all duration-300 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    sizeClasses[size],
    variantClasses[variant],
    disabled && 'opacity-50 pointer-events-none',
    className
  )

  const inner = (
    <>
      {children}
      {icon && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  )

  if (href) {
    return (
      <motion.div whileTap={{ scale: 0.98 }} className="inline-block group">
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
            {inner}
          </a>
        ) : (
          <Link href={href} className={classes}>
            {inner}
          </Link>
        )}
      </motion.div>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(classes, 'group')}
    >
      {inner}
    </motion.button>
  )
}
