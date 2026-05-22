import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { ContactPageClient } from '@/components/sections/ContactPageClient'
import { SITE } from '@/constants'
import type { SiteSettings, OpeningHourEntry } from '@/types/database'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Refined Beauty Hub. Call, email, or visit us in Lazimpat, Kathmandu.',
}

const DEFAULT_HOURS: OpeningHourEntry[] = [
  { day: 'Sunday',    open: '10:00', close: '19:00', closed: false },
  { day: 'Monday',    open: '10:00', close: '19:00', closed: false },
  { day: 'Tuesday',   open: '10:00', close: '19:00', closed: false },
  { day: 'Wednesday', open: '10:00', close: '19:00', closed: false },
  { day: 'Thursday',  open: '10:00', close: '19:00', closed: false },
  { day: 'Friday',    open: '10:00', close: '20:00', closed: false },
  { day: 'Saturday',  open: '09:00', close: '20:00', closed: false },
]

async function loadSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('site_settings').select('*').eq('id', 'main').single()
    return data as SiteSettings | null
  } catch { return null }
}

export default async function ContactPage() {
  const settings = await loadSettings()

  return (
    <ContactPageClient
      phone   = {settings?.phone   ?? SITE.phone}
      email   = {settings?.email   ?? SITE.email}
      address = {settings?.address ?? SITE.address}
      mapUrl  = {settings?.map_url ?? SITE.mapUrl}
      hours   = {settings?.opening_hours?.length ? settings.opening_hours : DEFAULT_HOURS}
    />
  )
}
