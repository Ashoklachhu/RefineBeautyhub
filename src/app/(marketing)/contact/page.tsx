import type { Metadata } from 'next'
import { ContactPageClient } from '@/components/sections/ContactPageClient'
import { SITE } from '@/constants'
import { resolveBranches } from '@/lib/branches'
import { loadSiteSettings } from '@/lib/settings'
import type { OpeningHourEntry } from '@/types/database'

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

export default async function ContactPage() {
  const settings = await loadSiteSettings()

  return (
    <ContactPageClient
      phone    = {settings?.phone ?? SITE.phone}
      email    = {settings?.email ?? SITE.email}
      branches = {resolveBranches(settings)}
      hours    = {settings?.opening_hours?.length ? settings.opening_hours : DEFAULT_HOURS}
    />
  )
}
