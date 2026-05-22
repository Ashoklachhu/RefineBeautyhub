'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ChevronDown, ChevronUp, Star, Sparkles, Flame, Leaf,
  ShoppingBag, Check, CheckCircle2, AlertCircle, Share2, Minus, Plus,
} from 'lucide-react'
import { getProductBySlug } from '@/app/actions/shop'
import { useCart } from '@/providers/CartProvider'
import type { Product } from '@/types/database'

const TAG_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  staff_pick:  { label: 'Staff Pick',  color: '#b8976b', bg: '#fdf6ee', Icon: Star },
  bestseller:  { label: 'Bestseller',  color: '#c26b4a', bg: '#fef3ee', Icon: Flame },
  new:         { label: 'New Arrival', color: '#4a8c6b', bg: '#f0faf5', Icon: Sparkles },
  limited:     { label: 'Limited',     color: '#7c5c8c', bg: '#f5f0fa', Icon: Leaf },
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: '#f0e8e0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left transition-colors hover:opacity-70"
      >
        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#1a1410' }}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#9a8070' }} />
               : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#9a8070' }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-relaxed" style={{ color: '#7a6a5e' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductDetailPage() {
  const { slug }                   = useParams<{ slug: string }>()
  const { addItem, openCart }      = useCart()
  const [product, setProduct]      = useState<Product | null>(null)
  const [loading, setLoading]      = useState(true)
  const [activeImg, setActiveImg]  = useState(0)
  const [qty,      setQty]         = useState(1)
  const [added,    setAdded]       = useState(false)
  const [copied,   setCopied]      = useState(false)

  useEffect(() => {
    getProductBySlug(slug).then(p => {
      setProduct(p)
      setLoading(false)
    })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fdfaf7' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#e8ddd4', borderTopColor: '#b8976b' }} />
        <p className="text-sm" style={{ color: '#9a8070' }}>Loading product…</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: '#fdfaf7' }}>
      <AlertCircle className="w-10 h-10" style={{ color: '#c26b4a' }} />
      <h2 className="text-xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
        Product not found
      </h2>
      <Link href="/shop" className="text-sm underline" style={{ color: '#b8976b' }}>
        Back to shop
      </Link>
    </div>
  )

  const fmt       = (n: number) => new Intl.NumberFormat('en-NP').format(n)
  const discount  = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100) : null
  const allImages = [product.image_url, ...(product.gallery_urls ?? [])].filter(Boolean) as string[]

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleAddToCart() {
    if (!product || !product.in_stock) return
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 600)
  }

  return (
    <>
      <div className="min-h-screen" style={{ background: '#fdfaf7' }}>

        {/* Breadcrumb */}
        <div className="luxury-container pt-8 pb-4">
          <nav className="flex items-center gap-2 text-xs" style={{ color: '#b0a090' }}>
            <Link href="/shop" className="hover:underline transition-colors" style={{ color: '#9a8070' }}>Shop</Link>
            <span>/</span>
            <span className="capitalize">{product.category}</span>
            <span>/</span>
            <span style={{ color: '#1a1410' }}>{product.name}</span>
          </nav>
        </div>

        {/* Main content */}
        <div className="luxury-container pb-20">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">

            {/* ── Left: Images ──────────────────────────────── */}
            <div className="lg:sticky lg:top-28">
              {/* Main image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden"
                style={{ background: '#f5ede3' }}>
                {allImages.length > 0 ? (
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={allImages[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: '#c8b89a' }}>
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.9)', color: copied ? '#4a8c6b' : '#7a6a5e' }}
                  title="Copy link">
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 mt-3">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                      style={{
                        border: `2px solid ${activeImg === i ? '#b8976b' : '#e8ddd4'}`,
                        opacity: activeImg === i ? 1 : 0.6,
                      }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Details ────────────────────────────── */}
            <div>
              {/* Category + tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs uppercase tracking-[0.25em] font-medium" style={{ color: '#b8976b' }}>
                  {product.category}
                </span>
                {product.tags.map(tag => {
                  const cfg = TAG_CONFIG[tag]
                  if (!cfg) return null
                  const Icon = cfg.Icon
                  return (
                    <span key={tag}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  )
                })}
              </div>

              {/* Product name */}
              <h1 className="text-4xl lg:text-5xl font-light leading-tight mb-4"
                style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                {product.name}
              </h1>

              {/* Short description */}
              {product.short_description && (
                <p className="text-base leading-relaxed mb-6" style={{ color: '#7a6a5e' }}>
                  {product.short_description}
                </p>
              )}

              {/* Expert note */}
              {product.expert_note && (
                <div className="rounded-xl p-5 mb-6" style={{ background: '#fdf6ee', border: '1px solid #e8ddd4' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8976b' }} />
                    <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#b8976b' }}>
                      Our Expert Says
                    </span>
                  </div>
                  <p className="text-sm italic leading-relaxed" style={{ color: '#5a4a3e' }}>
                    &ldquo;{product.expert_note}&rdquo;
                  </p>
                </div>
              )}

              {/* Suitable for tags */}
              {product.suitable_for && product.suitable_for.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider mb-2.5 font-semibold" style={{ color: '#9a8070' }}>
                    Perfect for
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.suitable_for.map(tag => (
                      <span key={tag}
                        className="px-3 py-1 rounded-full text-xs border"
                        style={{ borderColor: '#e8ddd4', color: '#7a6a5e', background: '#fff' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-semibold" style={{ color: '#1a1410' }}>
                  NPR {fmt(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className="text-lg line-through" style={{ color: '#b0a090' }}>
                    NPR {fmt(product.compare_at_price)}
                  </span>
                )}
                {discount && (
                  <span className="text-sm font-semibold px-2 py-0.5 rounded"
                    style={{ background: '#fef3ee', color: '#c26b4a' }}>
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 mb-7">
                <div className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                <span className="text-xs" style={{ color: '#9a8070' }}>
                  {product.in_stock ? 'In stock — ready to reserve' : 'Currently out of stock'}
                </span>
              </div>

              {/* Quantity + CTA */}
              <div className="space-y-3 mb-8">
                {/* Qty picker */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: '#e8ddd4' }}>
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-11 h-11 flex items-center justify-center transition-colors"
                      style={{ color: '#7a6a5e' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5ede3'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      disabled={qty <= 1}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold" style={{ color: '#1a1410' }}>{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(10, q + 1))}
                      className="w-11 h-11 flex items-center justify-center transition-colors"
                      style={{ color: '#7a6a5e' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5ede3'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      disabled={qty >= 10}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-sm" style={{ color: '#9a8070' }}>
                    Total: <strong style={{ color: '#1a1410' }}>NPR {fmt(product.price * qty)}</strong>
                  </span>
                </div>

                {/* Add to cart */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all disabled:opacity-40"
                    style={{ background: added ? '#4a8c6b' : '#1a1410', color: '#fff' }}>
                    <AnimatePresence mode="wait" initial={false}>
                      {added
                        ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check className="w-4 h-4" />
                          </motion.span>
                        : <motion.span key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <ShoppingBag className="w-4 h-4" />
                          </motion.span>}
                    </AnimatePresence>
                    {!product.in_stock ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}
                  </button>
                  <Link href="/contact"
                    className="flex items-center justify-center px-6 py-4 rounded-xl text-sm font-medium border transition-colors"
                    style={{ borderColor: '#e8ddd4', color: '#7a6a5e' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#b8976b'
                      e.currentTarget.style.color = '#1a1410'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e8ddd4'
                      e.currentTarget.style.color = '#7a6a5e'
                    }}>
                    Ask an Expert
                  </Link>
                </div>
              </div>

              {/* Accordions */}
              <div className="border-t" style={{ borderColor: '#f0e8e0' }}>
                {product.description && (
                  <Accordion title="About this product">
                    <p className="whitespace-pre-line">{product.description}</p>
                  </Accordion>
                )}
                {product.ingredients && (
                  <Accordion title="Ingredients">
                    <p className="whitespace-pre-line font-mono text-xs">{product.ingredients}</p>
                  </Accordion>
                )}
                {product.how_to_use && (
                  <Accordion title="How to use">
                    <p className="whitespace-pre-line">{product.how_to_use}</p>
                  </Accordion>
                )}
                <Accordion title="Delivery & reservation">
                  <p>
                    Once you reserve this product, our team will contact you within 24 hours to confirm
                    availability and arrange delivery or in-salon pick-up. Payment is collected at the
                    time of pick-up or delivery.
                  </p>
                </Accordion>
              </div>

              {/* Back link */}
              <Link href="/shop"
                className="inline-flex items-center gap-2 mt-8 text-xs transition-colors"
                style={{ color: '#b0a090' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#7a6a5e')}
                onMouseLeave={e => (e.currentTarget.style.color = '#b0a090')}>
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to The Refined Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
