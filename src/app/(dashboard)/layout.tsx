import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { loadSiteSettings } from '@/lib/settings'
import { SITE } from '@/constants'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const settings = await loadSiteSettings()

  return (
    <>
      <Navbar phone={settings?.phone ?? SITE.phone} />
      <main className="flex-1 pt-20 min-h-screen bg-nude-50/40">
        {children}
      </main>
      <Footer />
    </>
  )
}
