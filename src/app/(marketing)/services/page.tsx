import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllServices, getAllCategories } from '@/services/services.service'
import { Clock, Star, ArrowRight, Sparkles } from 'lucide-react'
import type { ServiceWithCategory, Category } from '@/types/database'

export const metadata: Metadata = {
  title: 'Services — Refined Beauty Hub',
  description: 'Explore our full range of luxury beauty services — hair, skin, nails, makeup, and more at Refined Beauty Hub, Kathmandu.',
}

export const revalidate = 3600

function formatPrice(price: number, priceMax: number | null) {
  if (priceMax) return `NPR ${price.toLocaleString()} – ${priceMax.toLocaleString()}`
  return `NPR ${price.toLocaleString()}`
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const [{ category: rawCategory }, servicesResult, categoriesResult] = await Promise.all([
    searchParams,
    getAllServices(),
    getAllCategories(),
  ])

  const services: ServiceWithCategory[] = servicesResult.data ?? []
  const categories: Category[] = categoriesResult.data ?? []

  const activeCategory = rawCategory ?? 'all'
  const filtered = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category?.slug === activeCategory)

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold-500/6 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold-400/4 blur-3xl" />
        <div className="luxury-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-medium tracking-[0.2em] text-gold-400 uppercase">Our Services</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4 leading-[1.1]"
            style={{ fontFamily: 'var(--font-cormorant)' }}>
            Luxury Beauty,<br />
            <em className="not-italic font-medium" style={{ color: 'oklch(0.83 0.12 72)' }}>Elevated.</em>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
            From transformative hair treatments to precision nail art — every service is crafted for your comfort and results.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b border-border/50 shadow-sm">
        <div className="luxury-container">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-none">
            <Link
              href="/services"
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'gold-gradient text-white shadow-sm'
                  : 'bg-nude-100 text-charcoal-700 hover:bg-nude-200'
              }`}
            >
              All Services
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'gold-gradient text-white shadow-sm'
                    : 'bg-nude-100 text-charcoal-700 hover:bg-nude-200'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-py">
        <div className="luxury-container">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No services found in this category.
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-8">
                {filtered.length} service{filtered.length !== 1 ? 's' : ''} available
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((service) => (
                  <Link key={service.id} href={`/services/${service.slug}`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                      {/* Image */}
                      <div className="aspect-[4/3] bg-nude-100 relative overflow-hidden">
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-nude-300" />
                          </div>
                        )}
                        {service.is_popular && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold-500 text-white text-xs font-semibold">
                            Popular
                          </div>
                        )}
                        {service.is_featured && !service.is_popular && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-charcoal-800 text-white text-xs font-semibold">
                            Featured
                          </div>
                        )}
                        {service.category && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-charcoal-700">
                            {service.category.name}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-medium text-foreground mb-1 group-hover:text-gold-600 transition-colors"
                          style={{ fontFamily: 'var(--font-cormorant)' }}>
                          {service.name}
                        </h3>
                        {service.short_description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                            {service.short_description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <div>
                            {service.discounted_price ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-baseline gap-1.5">
                                  <p className="text-base font-semibold text-foreground">
                                    NPR {service.discounted_price.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-through">
                                    NPR {service.price.toLocaleString()}
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                                  {Math.round((1 - service.discounted_price / service.price) * 100)}% OFF
                                </span>
                              </div>
                            ) : (
                              <p className="text-base font-semibold text-foreground">
                                {formatPrice(service.price, service.price_max)}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-gold-600 text-sm font-medium group-hover:gap-2 transition-all">
                            <span>Details</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section-py bg-nude-50/60">
        <div className="luxury-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal-950 to-charcoal-800 p-12 text-center">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4"
                style={{ fontFamily: 'var(--font-cormorant)' }}>
                Ready for Your Treatment?
              </h2>
              <p className="text-white/60 mb-8 max-w-sm mx-auto text-sm">
                Book your appointment online in under 2 minutes.
              </p>
              <Link href="/booking"
                className="inline-flex items-center gap-2 px-8 py-3.5 gold-gradient text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                Book Appointment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
