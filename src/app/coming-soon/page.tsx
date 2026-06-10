import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coming Soon | Refined Beauty Hub',
  description: 'Refined Beauty Hub is launching soon. Stay tuned for a new luxury salon and academy experience in Kathmandu.',
  robots: { index: false, follow: false },
}

export default function ComingSoonPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: '#F9F5F0', color: '#1a1410' }}
    >
      <div className="mb-8 flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] uppercase"
        style={{ color: '#b8976b' }}>
        <span className="h-px w-8" style={{ background: '#b8976b' }} />
        Refined Beauty Hub
        <span className="h-px w-8" style={{ background: '#b8976b' }} />
      </div>

      <h1
        className="mb-5 text-4xl sm:text-5xl lg:text-6xl font-light leading-tight"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        Something Beautiful<br />
        is <em style={{ color: '#b8976b' }}>Coming Soon</em>
      </h1>

      <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed" style={{ color: '#7a6a5e' }}>
        We&apos;re putting the finishing touches on our new luxury salon &amp; academy
        experience. Thank you for your patience — we&apos;ll be live shortly.
      </p>

      <div className="flex flex-col items-center gap-2 text-xs tracking-[0.15em] uppercase"
        style={{ color: '#1a1410' }}>
        <span>For inquiries, reach us at</span>
        <a
          href="mailto:info@refinedbeautyhub.com"
          className="font-semibold underline-offset-4 hover:underline"
          style={{ color: '#b8976b' }}
        >
          info@refinedbeautyhub.com
        </a>
      </div>
    </main>
  )
}
