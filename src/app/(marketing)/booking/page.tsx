import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllServices } from '@/services/services.service'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { getServerUser } from '@/lib/auth/get-server-user'
import { createClient } from '@/lib/supabase/server'
import { Loader2, Sparkles } from 'lucide-react'
import type { Profile } from '@/types/database'

export const metadata: Metadata = {
  title: 'Book Appointment — Refined Beauty Hub',
  description: 'Book your luxury beauty treatment online at Refined Beauty Hub, Kathmandu.',
}

async function BookingContent({ serviceId, userProfile }: { serviceId?: string; userProfile: Profile | null }) {
  const result = await getAllServices()
  const services = result.data ?? []

  return (
    <BookingWizard services={services} initialServiceId={serviceId} userProfile={userProfile} />
  )
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const { service } = await searchParams

  // Try to fetch the logged-in user's profile (null for guests — that's fine)
  let userProfile: Profile | null = null
  try {
    const user = await getServerUser()
    if (user) {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      userProfile = data ?? null
    }
  } catch {
    // If anything fails just proceed as guest
  }

  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold-500/8 blur-3xl" />
        <div className="luxury-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-medium tracking-[0.2em] text-gold-400 uppercase">Online Booking</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Book Your Appointment
          </h1>
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Reserve your treatment in under 2 minutes. No account required.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <section className="section-py">
        <div className="luxury-container">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          }>
            <BookingContent serviceId={service} userProfile={userProfile} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
