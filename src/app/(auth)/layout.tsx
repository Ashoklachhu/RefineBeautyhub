import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — luxury visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-500/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gold-400/6 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-2xl font-light tracking-[0.12em] text-white uppercase"
              style={{ fontFamily: 'var(--font-cormorant)' }}>Refined</span>
            <span className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">Beauty Hub</span>
          </Link>
          <div>
            <p className="text-5xl font-light text-white leading-[1.15] mb-4"
              style={{ fontFamily: 'var(--font-cormorant)' }}>
              Where Beauty<br />
              <em className="not-italic font-medium" style={{ color: 'oklch(0.83 0.12 72)' }}>Meets Excellence</em>
            </p>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Kathmandu's premier luxury beauty salon and academy. Join thousands of clients who trust us with their beauty journey.
            </p>
          </div>
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Refined Beauty Hub</p>
        </div>
      </div>
      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <Link href="/" className="flex lg:hidden flex-col leading-none mb-10">
            <span className="text-xl font-light tracking-[0.12em] uppercase"
              style={{ fontFamily: 'var(--font-cormorant)' }}>Refined</span>
            <span className="text-xs font-semibold tracking-[0.3em] text-gold-500 uppercase">Beauty Hub</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
