import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllServices } from '@/services/services.service'
import { getStaffForService } from '@/services/staff.service'
import { Clock, CheckCircle, ArrowRight, Sparkles, Star, Users } from 'lucide-react'

export const revalidate = 3600

export async function generateStaticParams() {
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = createServiceClient()
  const { data } = await supabase.from('services').select('slug').eq('is_active', true)
  return (data ?? []).map((s: { slug: string }) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getServiceBySlug(slug)
  if (!result.data) return { title: 'Service — Refined Beauty Hub' }
  return {
    title: `${result.data.name} — Refined Beauty Hub`,
    description: result.data.short_description ?? result.data.description ?? '',
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [serviceResult, staffResult] = await Promise.all([
    getServiceBySlug(slug),
    // staff fetched after service resolves — ok to do serially in generateStaticParams context
    // but here we optimistically try; will use service.id after resolve
    Promise.resolve({ data: null, error: null }),
  ])

  if (!serviceResult.data) notFound()
  const service = serviceResult.data

  const staffResult2 = await getStaffForService(service.id)
  const staff = staffResult2.data ?? []

  function formatPrice(price: number, priceMax: number | null) {
    if (priceMax) return `NPR ${price.toLocaleString()} – ${priceMax.toLocaleString()}`
    return `NPR ${price.toLocaleString()}`
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-500/8 blur-3xl" />
        <div className="luxury-container relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/40 mb-8">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white/70 transition-colors">Services</Link>
            <span>/</span>
            <span className="text-white/70">{service.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {service.category && (
                <span className="inline-block px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/20 text-gold-400 text-xs font-medium mb-4">
                  {service.category.name}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-light text-white mb-4 leading-[1.1]"
                style={{ fontFamily: 'var(--font-cormorant)' }}>
                {service.name}
              </h1>
              {service.short_description && (
                <p className="text-white/60 text-sm leading-relaxed mb-6">{service.short_description}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span className="text-white text-sm">{service.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <Star className="w-4 h-4 text-gold-400" />
                  {service.discounted_price ? (
                    <span className="text-white text-sm flex items-center gap-2">
                      <span className="flex items-baseline gap-1.5">
                        NPR {service.discounted_price.toLocaleString()}
                        <span className="text-white/40 line-through text-xs">NPR {service.price.toLocaleString()}</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {Math.round((1 - service.discounted_price / service.price) * 100)}% OFF
                      </span>
                    </span>
                  ) : (
                    <span className="text-white text-sm">{formatPrice(service.price, service.price_max)}</span>
                  )}
                </div>
                {service.is_popular && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-500/15 border border-gold-500/20">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span className="text-gold-400 text-sm">Most Popular</span>
                  </div>
                )}
              </div>

              <Link href={`/booking?service=${service.id}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 gold-gradient text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                Book This Service
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Service image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-800">
              {service.image_url ? (
                <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-gold-500/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description + Benefits */}
      <section className="section-py">
        <div className="luxury-container">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'var(--font-cormorant)' }}>
                About This Service
              </h2>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                {service.description ? (
                  <p>{service.description}</p>
                ) : (
                  <p>Experience our premium {service.name} service, delivered by our expert team with the finest products and techniques.</p>
                )}
              </div>

              {/* Benefits */}
              {service.benefits && service.benefits.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-medium mb-4">What&apos;s Included</h3>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="rounded-2xl border border-border p-6 bg-card">
                <h3 className="text-lg font-medium mb-4">Service Details</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between items-baseline">
                    <dt className="text-muted-foreground">Price</dt>
                    {service.discounted_price ? (
                      <dd className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-foreground">NPR {service.discounted_price.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground line-through">NPR {service.price.toLocaleString()}</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                          {Math.round((1 - service.discounted_price / service.price) * 100)}% OFF
                        </span>
                      </dd>
                    ) : (
                      <dd className="font-semibold">{formatPrice(service.price, service.price_max)}</dd>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium">{service.duration_minutes} min</dd>
                  </div>
                  {service.category && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{service.category.name}</dd>
                    </div>
                  )}
                </dl>
                <div className="gold-divider mt-5 mb-5" />
                <Link href={`/booking?service=${service.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 gold-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm">
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Staff who offer this */}
              {staff.length > 0 && (
                <div className="rounded-2xl border border-border p-6 bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-gold-500" />
                    <h3 className="text-sm font-medium">Available With</h3>
                  </div>
                  <div className="space-y-3">
                    {staff.slice(0, 4).map((s) => (
                      <div key={s.id} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-nude-100 overflow-hidden flex-shrink-0">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-medium text-nude-500">
                              {s.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-py bg-nude-50/60 border-t border-border/50">
        <div className="luxury-container text-center">
          <h2 className="text-3xl font-light mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Ready to Experience {service.name}?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            Book your appointment online or call us to schedule at your convenience.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/booking?service=${service.id}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 gold-gradient text-white rounded-full font-medium hover:opacity-90 transition-opacity">
              Book Appointment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/services"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-foreground font-medium hover:bg-nude-50 transition-colors">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
