'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Check, X, RotateCcw, Clock, Eye, Plus, Pencil, Globe, Footprints, Phone, ShieldCheck, MapPin, Building2 } from 'lucide-react'
import { AdminBadge } from './AdminBadge'
import { BookingDetailPanel } from './BookingDetailPanel'
import { BookingFormPanel } from './BookingFormPanel'
import { adminUpdateBookingStatus } from '@/app/actions/admin'
import { BRANCHES } from '@/constants'
import type { Booking, BookingStatus, BookingSource, Service, Staff } from '@/types/database'

type BookingRow = Booking & {
  service?: { name: string; duration_minutes: number } | null
  staff?:   { name: string } | null
  profile?: { full_name: string; email: string; phone: string | null; avatar_url: string | null } | null
}

interface BookingsTableProps {
  bookings: BookingRow[]
  total:    number
  page:     number
  status:   string
  branch?:  string
  services: Service[]
  staff:    Staff[]
}

const statusColor: Record<BookingStatus, 'yellow' | 'green' | 'blue' | 'red' | 'gray'> = {
  pending: 'yellow', confirmed: 'green', completed: 'blue', cancelled: 'red', no_show: 'gray',
}

const SOURCE_CONFIG: Record<BookingSource, { label: string; icon: React.ElementType; color: string }> = {
  online:  { label: 'Online',   icon: Globe,       color: 'text-blue-400'    },
  walk_in: { label: 'Walk-in',  icon: Footprints,  color: 'text-emerald-400' },
  phone:   { label: 'Phone',    icon: Phone,       color: 'text-purple-400'  },
  admin:   { label: 'Admin',    icon: ShieldCheck, color: 'text-gold-400'    },
}

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export function BookingsTable({ bookings, total, page, status, branch = 'all', services, staff }: BookingsTableProps) {
  const router      = useRouter()
  const [, start]   = useTransition()
  const [updating,  setUpdating]   = useState<string | null>(null)
  const [selected,  setSelected]   = useState<BookingRow | null>(null)
  const [editing,   setEditing]    = useState<BookingRow | null>(null)
  const [creating,  setCreating]   = useState(false)
  const pageSize    = 20
  const totalPages  = Math.ceil(total / pageSize)

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams({ status, branch, page: String(page), ...params })
    router.push(`/admin/bookings?${sp}`)
  }

  async function updateStatus(id: string, newStatus: BookingStatus) {
    setUpdating(id)
    start(async () => {
      const { error } = await adminUpdateBookingStatus(id, newStatus)
      if (error) toast.error(error)
      else { toast.success(`Booking ${newStatus}`); router.refresh() }
      setUpdating(null)
    })
  }

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar: filter tabs + New Booking button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-3">
            {/* Status filter */}
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => navigate({ status: s, page: '1' })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                    ${status === s
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-white/5 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'}`}>
                  {s}
                </button>
              ))}
            </div>
            {/* Branch filter */}
            <div className="flex gap-1.5 flex-wrap">
              {[{ id: 'all', name: 'All Branches' }, ...BRANCHES].map((b) => (
                <button key={b.id}
                  onClick={() => navigate({ branch: b.id, page: '1' })}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                    ${branch === b.id
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-white/5 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'}`}>
                  <MapPin className="w-3 h-3" />
                  {b.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30
                       text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/5">
                  {['Reference', 'Client', 'Service', 'Date & Time', 'Artist', 'Branch', 'Source', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-neutral-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400 dark:text-neutral-500 text-sm">
                      No bookings found.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => {
                  const clientName = b.profile?.full_name ?? b.guest_name ?? 'Guest'
                  const isUpdating = updating === b.id
                  const src = (b as BookingRow & { source?: BookingSource }).source ?? 'online'
                  const srcCfg = SOURCE_CONFIG[src]
                  const SrcIcon = srcCfg.icon
                  return (
                    <tr key={b.id}
                      className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setSelected(b)}
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelected(b)}
                          className="font-mono text-[10px] text-gold-400 hover:text-gold-300 transition-colors"
                        >
                          {b.reference}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 dark:text-white text-xs font-medium">{clientName}</p>
                        <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{b.profile?.email ?? b.guest_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-neutral-200 text-xs">{b.service?.name}</p>
                        <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{b.service?.duration_minutes} min</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-neutral-200 text-xs">
                          {new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{formatTime(b.start_time)}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-neutral-300 text-xs">{b.staff?.name ?? 'Any'}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const br = BRANCHES.find(br => br.id === b.branch)
                          return br ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 text-[10px] font-medium whitespace-nowrap">
                              <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
                              {br.name.replace(' Branch', '')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 dark:text-neutral-600">—</span>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-[10px] font-medium ${srcCfg.color}`}>
                          <SrcIcon className="w-3 h-3" />
                          {srcCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-neutral-200 text-xs font-medium">
                        NPR {Number(b.total_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge label={b.status} color={statusColor[b.status]} />
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {/* View details */}
                          <button onClick={() => setSelected(b)}
                            title="View details"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Edit */}
                          <button onClick={() => setEditing(b)}
                            title="Edit booking"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={isUpdating}
                                title="Confirm"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={isUpdating}
                                title="Cancel"
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <>
                              <button onClick={() => updateStatus(b.id, 'completed')} disabled={isUpdating}
                                title="Mark completed"
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={isUpdating}
                                title="Cancel"
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(b.id, 'no_show')} disabled={isUpdating}
                                title="No show"
                                className="p-1.5 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {b.status === 'cancelled' && (
                            <button onClick={() => updateStatus(b.id, 'pending')} disabled={isUpdating}
                              title="Restore"
                              className="p-1.5 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-white/5">
              <p className="text-xs text-gray-400 dark:text-neutral-500">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex gap-1">
                <button onClick={() => navigate({ page: String(page - 1) })} disabled={page <= 1}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => navigate({ page: String(page + 1) })} disabled={page >= totalPages}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking detail slide-over */}
      {selected && (
        <BookingDetailPanel
          booking={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Edit booking form */}
      {editing && (
        <BookingFormPanel
          services={services}
          staff={staff}
          booking={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Create booking form */}
      {creating && (
        <BookingFormPanel
          services={services}
          staff={staff}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  )
}
