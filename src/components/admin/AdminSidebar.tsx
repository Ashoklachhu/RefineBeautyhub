'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, CalendarCheck, Scissors, GraduationCap, Users,
  Image, Star, UserCog, BarChart3, Settings, X, Menu, Sparkles, BookOpen,
  MessageSquare, Package, ShoppingBag,
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard',         href: '/admin',                    icon: LayoutDashboard },
  { label: 'Bookings',          href: '/admin/bookings',           icon: CalendarCheck },
  { label: 'Enrollments',       href: '/admin/enrollments',        icon: BookOpen },
  { label: 'Inquiries',         href: '/admin/inquiries',          icon: MessageSquare },
  { label: 'Services',          href: '/admin/services',           icon: Scissors },
  { label: 'Products',          href: '/admin/products',           icon: Package },
  { label: 'Shop Orders',       href: '/admin/shop-orders',        icon: ShoppingBag },
  { label: 'Courses',           href: '/admin/courses',            icon: GraduationCap },
  { label: 'Staff',             href: '/admin/staff',              icon: UserCog },
  { label: 'Gallery',           href: '/admin/gallery',            icon: Image },
  { label: 'Testimonials',      href: '/admin/testimonials',       icon: Star },
  { label: 'Users',             href: '/admin/users',              icon: Users },
  { label: 'Analytics',         href: '/admin/analytics',          icon: BarChart3 },
  { label: 'Settings',          href: '/admin/settings',           icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const sidebar = (
    <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-white/5 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img
            src="https://res.cloudinary.com/dosxengut/image/upload/v1779471572/gallery/eoumyt4amkfqwatfnmpi.png"
            alt="Refined Beauty Hub"
            className="h-10 w-auto object-contain"
          />
          <p className="text-[10px] text-gold-400 leading-none font-medium">Admin Panel</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                ${active
                  ? 'bg-gold-500/15 text-gold-400'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-gold-400' : 'text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:group-hover:text-neutral-300'}`} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Back to site */}
      <div className="p-3 border-t border-gray-200 dark:border-white/5">
        <Link href="/" target="_blank"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
          ← View public site
        </Link>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col" style={{ width: 256 }}>
        {sidebar}
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative flex flex-col" style={{ width: 256 }}>
            {sidebar}
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
