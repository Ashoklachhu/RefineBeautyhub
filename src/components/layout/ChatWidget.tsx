'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

/** Routes the client-facing assistant should stay out of. */
const HIDDEN_PREFIXES = ['/admin']

interface ChatWidgetProps {
  src:   string
  token: string
}

export function ChatWidget({ src, token }: ChatWidgetProps) {
  const pathname = usePathname()
  const hidden   = HIDDEN_PREFIXES.some(prefix => pathname?.startsWith(prefix))

  // The widget injects its own host element into <body>. React never owns
  // that node, so unmounting this component would leave the bubble on screen
  // after a client-side navigation into /admin — hide the host directly
  // instead, and show it again on the way back out.
  useEffect(() => {
    const host = document.getElementById('cw-host')
    if (host) host.style.display = hidden ? 'none' : ''
  }, [hidden, pathname])

  // On a fresh admin page load the script is never requested at all.
  if (hidden) return null

  return (
    <Script
      src={src}
      data-token={token}
      strategy="afterInteractive"
    />
  )
}
