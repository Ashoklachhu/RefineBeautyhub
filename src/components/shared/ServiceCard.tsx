'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDuration } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Service } from '@/types/database'

interface ServiceCardProps {
  service: Service
  index?: number
  compact?: boolean
}

export function ServiceCard({ service, index = 0, compact = false }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link href={`/services/${service.slug}`}>
        <div className="rounded-2xl overflow-hidden bg-card border border-border hover:border-gold-300/50 hover:shadow-[0_8px_40px_oklch(0.3_0_0/0.1)] transition-all duration-400">
          {/* Image */}
          <div className={cn('relative overflow-hidden bg-nude-100', compact ? 'h-48' : 'h-64')}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
            {service.is_popular && (
              <Badge className="absolute top-4 right-4 z-20 gold-gradient text-white border-0 text-xs">
                Popular
              </Badge>
            )}
            <div className="absolute inset-0 nude-gradient" />
            {service.image_url && (
              <Image
                src={service.image_url}
                alt={service.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3
                className="text-xl font-medium leading-snug group-hover:text-gold-600 transition-colors"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {service.name}
              </h3>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold-500 group-hover:translate-x-1 transition-all mt-1 shrink-0" />
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
              {service.short_description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(service.duration_minutes)}</span>
              </div>
              <div className="text-right">
                {service.discounted_price ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(service.discounted_price)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      {Math.round((1 - service.discounted_price / service.price) * 100)}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(service.price)}
                    {service.price_max && (
                      <span className="text-xs text-muted-foreground font-normal">
                        {' '}– {formatCurrency(service.price_max)}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
