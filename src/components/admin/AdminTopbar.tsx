'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut, Sun, Moon } from 'lucide-react'
import { signOut } from '@/services/auth.service'
import { AdminNotificationBell } from './AdminNotificationBell'
import { useAdminTheme } from './AdminThemeProvider'

interface AdminTopbarProps {
  user: { name: string; avatar: string | null | undefined }
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const router = useRouter()
  const { theme, toggle } = useAdminTheme()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  // First name only for compact display
  const firstName = user.name.split(' ')[0]
  const initials  = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="flex-shrink-0 h-16 bg-white/90 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-white/5
                       flex items-center justify-between px-4 sm:px-6 gap-4">
      {/* Left — mobile menu spacer (sidebar toggle handled by sidebar itself on mobile) */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Site link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          View site
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button onClick={toggle} title="Toggle theme"
          className="p-1.5 rounded-lg text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Notifications */}
        <AdminNotificationBell />

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-2" />

        {/* Admin user */}
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 overflow-hidden
                          flex items-center justify-center flex-shrink-0">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-[11px] font-semibold text-gold-400">{initials}</span>}
          </div>

          {/* Name + role */}
          <div className="hidden sm:block leading-none">
            <p className="text-xs font-medium text-gray-900 dark:text-white">{firstName}</p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">Administrator</p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-gray-400 dark:text-neutral-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
