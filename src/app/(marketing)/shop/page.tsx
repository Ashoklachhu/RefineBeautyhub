import { Suspense } from 'react'
import { getProducts, getFeaturedProducts } from '@/app/actions/shop'
import { CategoryFilter } from '@/components/shop/CategoryFilter'
import { ProductCard } from '@/components/shop/ProductCard'
import type { ProductCategory } from '@/types/database'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ShopPage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const cat = (category as ProductCategory) || undefined

  const [products, featured] = await Promise.all([
    getProducts(cat),
    !cat ? getFeaturedProducts(1) : Promise.resolve([]),
  ])

  const heroProduct   = featured[0] ?? null
  const gridProducts  = heroProduct
    ? products.filter(p => p.id !== heroProduct.id)
    : products

  return (
    <div className="min-h-screen" style={{ background: '#fdfaf7' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 lg:py-28" style={{
        background: 'linear-gradient(135deg, #fdfaf7 0%, #f5ede3 50%, #fdfaf7 100%)',
      }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 right-[15%] w-64 h-64 rounded-full opacity-[0.06]"
            style={{ background: '#b8976b', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 left-[10%] w-48 h-48 rounded-full opacity-[0.05]"
            style={{ background: '#b8976b', filter: 'blur(50px)' }} />
          {/* Subtle grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, #1a1410 0, #1a1410 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #1a1410 0, #1a1410 1px, transparent 1px, transparent 60px)' }} />
        </div>

        <div className="luxury-container relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: '#b8976b' }} />
              <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#b8976b' }}>
                The Refined Edit
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-light leading-[1.15] mb-4"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              Products We Trust.<br />
              <em>Treatments You&apos;ll Love.</em>
            </h1>
            <p className="text-base leading-relaxed max-w-lg" style={{ color: '#7a6a5e' }}>
              Every product in our edit is handpicked by our specialists — the same formulas
              we use in your treatments, now available for home care.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filters + Content ────────────────────────────────── */}
      <div className="luxury-container py-10 lg:py-14">

        {/* Category filter */}
        <Suspense>
          <CategoryFilter current={cat ?? 'all'} />
        </Suspense>

        {/* Count */}
        <p className="text-xs mt-5 mb-8" style={{ color: '#b0a090' }}>
          {products.length === 0
            ? 'No products found'
            : `${products.length} product${products.length === 1 ? '' : 's'} curated for you`}
        </p>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: '#f5ede3' }}>
              <Sparkles className="w-7 h-7" style={{ color: '#c8b89a' }} />
            </div>
            <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              Coming Soon
            </h3>
            <p className="text-sm" style={{ color: '#9a8070' }}>
              We&apos;re curating something special for this category.
            </p>
          </div>
        )}

        {/* Featured hero product (no filter active) */}
        {heroProduct && !cat && (
          <div className="mb-8">
            <FeaturedProductBanner product={heroProduct} />
          </div>
        )}

        {/* Product grid */}
        {gridProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {gridProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 4}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Expert note footer ────────────────────────────────── */}
      <section className="border-t py-16" style={{ borderColor: '#f0e8e0' }}>
        <div className="luxury-container text-center max-w-xl mx-auto">
          <Sparkles className="w-5 h-5 mx-auto mb-4" style={{ color: '#b8976b' }} />
          <p className="text-lg font-light italic mb-3" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
            &ldquo;Every product we carry has been tested by our team first.
            If we don&apos;t love it, it doesn&apos;t make it to our shelves.&rdquo;
          </p>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#b0a090' }}>
            — The Refined Beauty Hub Team
          </p>
        </div>
      </section>
    </div>
  )
}

// ── Featured Banner Component ─────────────────────────────────

import type { Product } from '@/types/database'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function FeaturedProductBanner({ product }: { product: Product }) {
  const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)

  return (
    <Link href={`/shop/${product.slug}`}
      className="group relative flex flex-col lg:flex-row rounded-2xl overflow-hidden transition-shadow hover:shadow-xl"
      style={{ background: '#fff', border: '1px solid #e8ddd4' }}>

      {/* Image side */}
      <div className="relative lg:w-1/2 aspect-[4/3] lg:aspect-auto overflow-hidden" style={{ minHeight: 320 }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#f5ede3' }}>
            <span className="text-6xl font-light" style={{ fontFamily: 'var(--font-cormorant)', color: '#c8b89a' }}>
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Expert's Choice label */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(184,151,107,0.95)', color: '#fff' }}>
          <Sparkles className="w-3 h-3" />
          Expert&apos;s Choice
        </div>
      </div>

      {/* Content side */}
      <div className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
        <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: '#b8976b' }}>
          {product.category} · Featured
        </p>
        <h2 className="text-3xl lg:text-4xl font-light mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
          {product.name}
        </h2>

        {product.expert_note && (
          <blockquote className="border-l-2 pl-4 mb-5"
            style={{ borderColor: '#b8976b' }}>
            <p className="text-sm italic leading-relaxed" style={{ color: '#7a6a5e' }}>
              &ldquo;{product.expert_note}&rdquo;
            </p>
          </blockquote>
        )}

        {product.short_description && (
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#9a8070' }}>
            {product.short_description}
          </p>
        )}

        <div className="flex items-center gap-4">
          <div>
            <span className="text-2xl font-semibold" style={{ color: '#1a1410' }}>NPR {fmt(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-sm line-through ml-2" style={{ color: '#b0a090' }}>
                NPR {fmt(product.compare_at_price)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium transition-colors group-hover:gap-2.5 duration-200"
            style={{ color: '#b8976b' }}>
            Discover
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
