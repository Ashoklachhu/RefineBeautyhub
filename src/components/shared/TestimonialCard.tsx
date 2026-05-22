'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import type { Testimonial } from '@/types/database'

interface TestimonialCardProps {
  testimonial: Testimonial
  index?: number
  light?: boolean
}

export function TestimonialCard({ testimonial, index = 0, light = false }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-2xl p-6 md:p-8 border relative',
        light
          ? 'bg-white/8 border-white/12 text-white'
          : 'bg-card border-border'
      )}
    >
      <Quote
        className={cn('absolute top-6 right-6 w-8 h-8 opacity-20', light ? 'text-gold-300' : 'text-gold-400')}
        aria-hidden
      />

      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn('w-4 h-4', i < testimonial.rating ? 'fill-gold-400 text-gold-400' : 'text-muted-foreground')}
          />
        ))}
      </div>

      <p
        className={cn('text-sm md:text-base leading-relaxed mb-6 italic', light ? 'text-white/80' : 'text-muted-foreground')}
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        &ldquo;{testimonial.review}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border-2 border-gold-300/30">
          <AvatarImage src={testimonial.client_image_url ?? undefined} alt={testimonial.client_name} />
          <AvatarFallback className="bg-nude-200 text-foreground text-sm font-medium">
            {testimonial.client_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={cn('text-sm font-semibold', light ? 'text-white' : 'text-foreground')}>
            {testimonial.client_name}
          </p>
          <p className={cn('text-xs', light ? 'text-white/50' : 'text-muted-foreground')}>
            {testimonial.service_label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
