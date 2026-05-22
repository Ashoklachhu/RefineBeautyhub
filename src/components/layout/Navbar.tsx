'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, User, LogOut, LayoutDashboard, CalendarCheck, ChevronDown, CalendarCheck as Cal, ShoppingBag } from 'lucide-react'
import { cn } from '@/utils/cn'
import { NAV_LINKS, SITE } from '@/constants'
import { useAuth } from '@/providers/AuthProvider'
import { useCart } from '@/providers/CartProvider'
import { signOut } from '@/services/auth.service'

// ── User dropdown ─────────────────────────────────────────────

function UserMenu() {
  const { profile, isAdmin } = useAuth()
  const router  = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-200"
        style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'transparent' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#b8976b'
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{ background: '#fdf6ee', border: '1px solid #d4b896', color: '#b8976b' }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            : initials}
        </div>
        <span className="text-sm font-medium max-w-[90px] truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {profile?.full_name?.split(' ')[0] ?? 'Account'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'rgba(255,255,255,0.4)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-white border rounded-xl shadow-xl overflow-hidden z-50"
            style={{ borderColor: '#e8ddd4' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: '#f0e8e0' }}>
              <p className="text-sm font-semibold truncate" style={{ color: '#1a1410' }}>{profile?.full_name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: '#9a8070' }}>{profile?.email}</p>
            </div>
            <div className="py-1">
              <DropItem href="/profile" icon={User} label="My Profile" onClick={() => setOpen(false)} />
              <DropItem href="/profile/bookings" icon={CalendarCheck} label="My Bookings" onClick={() => setOpen(false)} />
              {isAdmin && (
                <>
                  <div className="my-1 border-t" style={{ borderColor: '#f0e8e0' }} />
                  <DropItem href="/admin" icon={LayoutDashboard} label="Admin Panel" onClick={() => setOpen(false)} gold />
                </>
              )}
            </div>
            <div className="py-1 border-t" style={{ borderColor: '#f0e8e0' }}>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-rose-50"
                style={{ color: '#e05252' }}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropItem({ href, icon: Icon, label, onClick, gold }: {
  href: string; icon: React.ElementType; label: string; onClick: () => void; gold?: boolean
}) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
        ${gold ? 'hover:bg-amber-50' : 'hover:bg-stone-50'}`}
      style={{ color: gold ? '#b8976b' : '#3d2e25' }}>
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}

// ── Navbar ────────────────────────────────────────────────────

function CartButton() {
  const { count, openCart } = useCart()
  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors"
      style={{ color: 'rgba(255,255,255,0.6)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
      aria-label="Open cart"
    >
      <ShoppingBag className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5"
          style={{ background: '#b8976b' }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}

export function Navbar() {
  const { user, profile, isAdmin, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => { setIsOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  async function handleMobileSignOut() {
    setIsOpen(false)
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="relative w-full border-b"
        style={{ background: '#0a0a0a', borderColor: '#2a2a2a' }}>
        <nav className="luxury-container">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <img
                src="https://res.cloudinary.com/dosxengut/image/upload/v1779471572/gallery/eoumyt4amkfqwatfnmpi.png"
                alt="Refined Beauty Hub"
                className="h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-0">
              {NAV_LINKS.map(link => {
                const isShop = link.href === '/shop'
                const active = pathname === link.href || (isShop && pathname.startsWith('/shop'))
                return (
                  <Link key={link.href} href={link.href}
                    className={cn(
                      'relative px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-200 group',
                      active ? 'text-white' : 'text-white/50 hover:text-white'
                    )}>
                    {link.label}
                    {/* New dot for shop */}
                    {isShop && !active && (
                      <span className="absolute top-1.5 right-2.5 w-1 h-1 rounded-full bg-[#b8976b]" />
                    )}
                    {/* Underline indicator */}
                    <span className={cn(
                      'absolute bottom-0 left-4 right-4 h-px transition-all duration-300',
                      active
                        ? 'opacity-100 scale-x-100 bg-[#b8976b]'
                        : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 bg-[#b8976b]'
                    )} />
                  </Link>
                )
              })}
            </div>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Cart */}
              <CartButton />

              {/* Phone */}
              <a href={`tel:${SITE.phone.replace(/[^+0-9]/g, '')}`}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                <Phone className="w-3.5 h-3.5" />
                {SITE.phone}
              </a>

              {/* Auth */}
              {!isLoading && (
                user ? <UserMenu /> : (
                  <Link href="/login"
                    className="px-5 py-2 text-xs font-semibold tracking-[0.12em] uppercase border rounded-sm transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    }}>
                    Sign In
                  </Link>
                )
              )}

              {/* Book CTA */}
              <Link href="/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-[0.12em] uppercase rounded-sm transition-all"
                style={{ background: 'rgb(184,151,107)', color: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgb(163,133,91)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgb(184,151,107)')}>
                <Cal className="w-3.5 h-3.5" />
                Book Appointment
              </Link>
            </div>

            {/* Mobile: cart + menu */}
            <div className="lg:hidden flex items-center gap-1">
              <CartButton />
              <button onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md transition-colors"
                style={{ color: '#ffffff' }}>
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] flex flex-col lg:hidden"
              style={{ background: '#fff', borderLeft: '1px solid #e8ddd4' }}
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#f0e8e0' }}>
                <div className="flex items-center">
                  <img
                    src="https://res.cloudinary.com/dosxengut/image/upload/v1779471572/gallery/eoumyt4amkfqwatfnmpi.png"
                    alt="Refined Beauty Hub"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-md" style={{ color: '#9a8070' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              {user && profile && (
                <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: '#f0e8e0', background: '#fdfaf7' }}>
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ background: '#fdf6ee', border: '1px solid #d4b896', color: '#b8976b' }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                      : profile.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1a1410' }}>{profile.full_name}</p>
                    <p className="text-xs truncate" style={{ color: '#9a8070' }}>{profile.email}</p>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto py-4 px-4">
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, i) => {
                    const isShop = link.href === '/shop'
                    const active = pathname === link.href || (isShop && pathname.startsWith('/shop'))
                    return (
                      <motion.div key={link.href}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}>
                        <Link href={link.href}
                          className={cn(
                            'flex items-center justify-between py-3 px-4 rounded-sm text-sm font-semibold tracking-[0.1em] uppercase transition-all',
                            active ? 'text-white' : 'hover:bg-stone-50'
                          )}
                          style={{
                            color: active ? '#fff' : '#7a6a5e',
                            background: active ? '#1a1410' : undefined,
                          }}>
                          {link.label}
                          {isShop && !active && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fdf6ee', color: '#b8976b' }}>
                              New
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Auth */}
                {!isLoading && (
                  <>
                    <div className="my-4 border-t" style={{ borderColor: '#f0e8e0' }} />
                    {user ? (
                      <div className="flex flex-col gap-1">
                        <Link href="/profile"
                          className="flex items-center gap-3 py-3 px-4 rounded-sm text-sm transition-colors hover:bg-stone-50"
                          style={{ color: '#7a6a5e' }}>
                          <User className="w-4 h-4" style={{ color: '#b8976b' }} /> My Profile
                        </Link>
                        <Link href="/profile/bookings"
                          className="flex items-center gap-3 py-3 px-4 rounded-sm text-sm transition-colors hover:bg-stone-50"
                          style={{ color: '#7a6a5e' }}>
                          <CalendarCheck className="w-4 h-4" style={{ color: '#b8976b' }} /> My Bookings
                        </Link>
                        {isAdmin && (
                          <Link href="/admin"
                            className="flex items-center gap-3 py-3 px-4 rounded-sm text-sm transition-colors hover:bg-amber-50"
                            style={{ color: '#b8976b' }}>
                            <LayoutDashboard className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleMobileSignOut}
                          className="flex items-center gap-3 py-3 px-4 rounded-sm text-sm transition-colors hover:bg-rose-50 text-left"
                          style={{ color: '#e05252' }}>
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link href="/login"
                          className="block py-3 text-center text-xs font-bold tracking-[0.15em] uppercase border rounded-sm transition-all"
                          style={{ borderColor: '#1a1410', color: '#1a1410' }}>
                          Sign In
                        </Link>
                        <Link href="/register"
                          className="block py-3 text-center text-xs font-bold tracking-[0.15em] uppercase rounded-sm transition-all"
                          style={{ background: '#1a1410', color: '#fff' }}>
                          Create Account
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* Phone + Book */}
                <div className="my-4 border-t" style={{ borderColor: '#f0e8e0' }} />
                <a href={`tel:${SITE.phone.replace(/[^+0-9]/g, '')}`}
                  className="flex items-center gap-3 py-3 px-4 rounded-sm text-sm transition-colors hover:bg-stone-50"
                  style={{ color: '#7a6a5e' }}>
                  <Phone className="w-4 h-4" style={{ color: '#b8976b' }} />
                  {SITE.phone}
                </a>
                <div className="mt-3">
                  <Link href="/booking"
                    className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-[0.15em] uppercase rounded-sm"
                    style={{ background: '#1a1410', color: '#fff' }}>
                    <Cal className="w-4 h-4" />
                    Book Appointment
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t" style={{ borderColor: '#f0e8e0' }}>
                <p className="text-xs text-center" style={{ color: '#b0a090' }}>
                  Open Daily · 10:00 AM – 7:00 PM<br />
                  <span style={{ color: '#b8976b' }}>Fri &amp; Sat until 8:00 PM</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
