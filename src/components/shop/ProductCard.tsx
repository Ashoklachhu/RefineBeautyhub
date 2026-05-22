'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, Sparkles, Flame, Leaf, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import type { Product } from '@/types/database'

const TAG_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  staff_pick:  { label: 'Staff Pick',  color: '#b8976b', bg: 'rgba(184,151,107,0.15)', Icon: Star },
  bestseller:  { label: 'Bestseller',  color: '#c26b4a', bg: 'rgba(194,107,74,0.15)',  Icon: Flame },
  new:         { label: 'New Arrival', color: '#4a8c6b', bg: 'rgba(74,140,107,0.15)',  Icon: Sparkles },
  limited:     { label: 'Limited',     color: '#7c5c8c', bg: 'rgba(124,92,140,0.15)',  Icon: Leaf },
}

interface Props {
  product:  Product
  priority?: boolean
  large?:    boolean   // double-width featured card
}

export function ProductCard({ product, priority, large }: Props) {
  const { addItem } = useCart()
  const [hovered,  setHovered]  = useState(false)
  const [added,    setAdded]    = useState(false)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!product.in_stock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  // Pick the first recognised tag for the badge
  const badge = product.tags.find(t => TAG_CONFIG[t])
  const tag   = badge ? TAG_CONFIG[badge] : null
  const TagIcon = tag?.Icon

  const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`group relative block rounded-2xl overflow-hidden cursor-pointer
        ${large ? 'aspect-[3/4] lg:aspect-[4/3]' : 'aspect-[3/4]'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#f5ede3' }}>
            <span className="text-4xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: '#c8b89a' }}>
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Permanent bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0"
          style={{ background: 'rgba(26,20,16,0.55)', backdropFilter: 'blur(2px)' }}
        />
      </div>

      {/* Badge top-left */}
      {tag && TagIcon && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{ background: tag.bg, color: tag.color, backdropFilter: 'blur(8px)', border: `1px solid ${tag.color}30` }}>
          <TagIcon className="w-3 h-3" />
          {tag.label}
        </div>
      )}

      {/* Discount badge top-right */}
      {discount && (
        <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
          style={{ background: '#c26b4a' }}>
          -{discount}%
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        {/* Expert note on hover */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mb-3"
        >
          {product.expert_note && (
            <p className="text-xs leading-relaxed line-clamp-2 italic"
              style={{ color: 'rgba(255,255,255,0.85)' }}>
              &ldquo;{product.expert_note}&rdquo;
            </p>
          )}
        </motion.div>

        {/* Name + price + actions */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {product.category}
            </p>
            <h3 className="text-sm font-semibold leading-snug text-white line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-semibold" style={{ color: '#d4b896' }}>NPR {fmt(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-xs line-through" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  NPR {fmt(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons — visible on hover */}
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 flex-shrink-0">
            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
              style={{ background: added ? '#4a8c6b' : '#b8976b', color: '#fff' }}
              title={product.in_stock ? 'Add to cart' : 'Out of stock'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added
                  ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-3 h-3" />
                    </motion.span>
                  : <motion.span key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <ShoppingBag className="w-3 h-3" />
                    </motion.span>}
              </AnimatePresence>
              {added ? 'Added' : 'Add'}
            </button>
            {/* View details */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Out of stock overlay */}
      {!product.in_stock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(26,20,16,0.6)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full border text-white"
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}>Out of Stock</span>
        </div>
      )}
    </Link>
  )
}
