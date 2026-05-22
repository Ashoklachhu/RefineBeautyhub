'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { Bell, CalendarCheck, BookOpen, MessageSquare, RefreshCw, ChevronRight, Clock, ShoppingBag } from 'lucide-react'
import { getAdminNotifications } from '@/app/actions/admin'

type Notification = {
  bookings:    Array<{ id: string; reference: string; guest_name: string | null; booking_date: string; start_time: string; created_at: string; service: { name: string } | null; profile: { full_name: string } | null }>
  enrollments: Array<{ id: string; reference: string; guest_name: string | null; created_at: string; course: { title: string } | null; profile: { full_name: string } | null }>
  inquiries:   Array<{ id: string; name: string; email: string; subject: string; created_at: string }>
  shopOrders:  Array<{ id: string; reference: string; customer_name: string; customer_email: string; item_count: number; total_amount: number; created_at: string }>
  total: number
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days  > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins  > 0) return `${mins}m ago`
  return 'Just now'
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export function AdminNotificationBell() {
  const [open,  setOpen]  = useState(false)
  const [data,  setData]  = useState<Notification | null>(null)
  const [, start] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load on mount and every 60s
  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  function load() {
    start(async () => {
      const result = await getAdminNotifications()
      setData(result)
    })
  }

  const total = data?.total ?? 0

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label={`Notifications${total > 0 ? ` (${total} pending)` : ''}`}
      >
        <Bell className="w-4 h-4" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1
                           rounded-full bg-rose-500 text-white text-[9px] font-bold leading-none">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl
                        shadow-2xl shadow-gray-400/50 dark:shadow-black/50 overflow-hidden z-50 flex flex-col max-h-[80vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {total > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold">
                  {total} pending
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); load() }}
              className="p-1 rounded-md text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {!data ? (
              /* Loading skeleton */
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : total === 0 ? (
              <div className="py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-900 dark:text-white font-medium">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">No pending items right now.</p>
              </div>
            ) : (
              <div>

                {/* ── Pending Bookings ── */}
                {data.bookings.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                          Pending Bookings
                        </span>
                        <span className="px-1 rounded bg-amber-500/15 text-amber-400 text-[9px] font-bold">
                          {data.bookings.length}
                        </span>
                      </div>
                      <Link href="/admin/bookings?status=pending" onClick={() => setOpen(false)}
                        className="text-[10px] text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-0.5">
                        View all <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                    <div className="space-y-px">
                      {data.bookings.map(b => (
                        <Link
                          key={b.id}
                          href="/admin/bookings?status=pending"
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-amber-500/15 transition-colors">
                            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {b.profile?.full_name ?? b.guest_name ?? 'Guest'}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate mt-0.5">
                              {b.service?.name} · {formatDate(b.booking_date)} at {formatTime(b.start_time)}
                            </p>
                          </div>
                          <span className="text-[9px] text-gray-300 dark:text-neutral-600 flex-shrink-0 pt-0.5 flex items-center gap-0.5">
                            <Clock className="w-2 h-2" />
                            {timeAgo(b.created_at)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Pending Enrollments ── */}
                {data.enrollments.length > 0 && (
                  <div className={data.bookings.length > 0 ? 'border-t border-gray-200 dark:border-white/5' : ''}>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                          Pending Enrollments
                        </span>
                        <span className="px-1 rounded bg-blue-500/15 text-blue-400 text-[9px] font-bold">
                          {data.enrollments.length}
                        </span>
                      </div>
                      <Link href="/admin/enrollments?status=pending" onClick={() => setOpen(false)}
                        className="text-[10px] text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-0.5">
                        View all <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                    <div className="space-y-px">
                      {data.enrollments.map(e => (
                        <Link
                          key={e.id}
                          href="/admin/enrollments?status=pending"
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-500/15 transition-colors">
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {e.profile?.full_name ?? e.guest_name ?? 'Guest'}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate mt-0.5">
                              {e.course?.title ?? 'Unknown course'}
                            </p>
                          </div>
                          <span className="text-[9px] text-gray-300 dark:text-neutral-600 flex-shrink-0 pt-0.5 flex items-center gap-0.5">
                            <Clock className="w-2 h-2" />
                            {timeAgo(e.created_at)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── New Inquiries ── */}
                {data.inquiries.length > 0 && (
                  <div className={(data.bookings.length > 0 || data.enrollments.length > 0) ? 'border-t border-gray-200 dark:border-white/5' : ''}>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                          New Inquiries
                        </span>
                        <span className="px-1 rounded bg-purple-500/15 text-purple-400 text-[9px] font-bold">
                          {data.inquiries.length}
                        </span>
                      </div>
                      <Link href="/admin/inquiries?status=new" onClick={() => setOpen(false)}
                        className="text-[10px] text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-0.5">
                        View all <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                    <div className="space-y-px">
                      {data.inquiries.map(q => (
                        <Link
                          key={q.id}
                          href="/admin/inquiries"
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-purple-500/15 transition-colors">
                            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{q.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate mt-0.5">{q.subject}</p>
                          </div>
                          <span className="text-[9px] text-gray-300 dark:text-neutral-600 flex-shrink-0 pt-0.5 flex items-center gap-0.5">
                            <Clock className="w-2 h-2" />
                            {timeAgo(q.created_at)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Pending Shop Orders ── */}
                {data.shopOrders?.length > 0 && (
                  <div className={(data.bookings.length > 0 || data.enrollments.length > 0 || data.inquiries.length > 0) ? 'border-t border-gray-200 dark:border-white/5' : ''}>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3 text-violet-400" />
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                          Pending Orders
                        </span>
                        <span className="px-1 rounded bg-violet-500/15 text-violet-400 text-[9px] font-bold">
                          {data.shopOrders.length}
                        </span>
                      </div>
                      <Link href="/admin/shop-orders?status=pending" onClick={() => setOpen(false)}
                        className="text-[10px] text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-0.5">
                        View all <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                    <div className="space-y-px">
                      {data.shopOrders.map(o => (
                        <Link
                          key={o.id}
                          href="/admin/shop-orders?status=pending"
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-violet-500/15 transition-colors">
                            <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {o.customer_name}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate mt-0.5">
                              {o.reference} · {o.item_count} item{o.item_count !== 1 ? 's' : ''} · NPR {new Intl.NumberFormat('en-NP').format(o.total_amount)}
                            </p>
                          </div>
                          <span className="text-[9px] text-gray-300 dark:text-neutral-600 flex-shrink-0 pt-0.5 flex items-center gap-0.5">
                            <Clock className="w-2 h-2" />
                            {timeAgo(o.created_at)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-white/5 flex-shrink-0">
            <Link
              href="/admin/bookings"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Go to Bookings Dashboard
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
