'use client'

import { usePathname } from 'next/navigation'

/**
 * Forces a complete React unmount + remount of page content on every route
 * change by using the pathname as a key. This ensures framer-motion
 * animations (whileInView, animate, etc.) always re-run correctly when
 * navigating back — including via the browser's back button.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
