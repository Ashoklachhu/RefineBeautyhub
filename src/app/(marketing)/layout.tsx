import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { PageTransition } from '@/components/layout/PageTransition'

export const dynamic = 'force-dynamic'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed header shell — AnnouncementBar stacks above Navbar naturally */}
      <div className="fixed top-0 inset-x-0 z-50">
        <AnnouncementBar />
        <Navbar />
      </div>
      {/* PageTransition keys on pathname → forces full remount on every
          navigation so framer-motion animations always re-run correctly */}
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
{/* Cart drawer — global, controlled via CartContext */}
      <CartDrawer />
    </>
  )
}
