'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Check, X, RotateCcw, Eye, Plus, Pencil, Globe, Footprints, Phone, ShieldCheck } from 'lucide-react'
import { AdminBadge } from './AdminBadge'
import { EnrollmentDetailPanel } from './EnrollmentDetailPanel'
import { EnrollmentFormPanel } from './EnrollmentFormPanel'
import { adminUpdateEnrollmentStatus } from '@/app/actions/admin'
import type { Enrollment, EnrollmentStatus, BookingSource, AcademyCourse } from '@/types/database'

type EnrollmentRow = Enrollment & {
  course:  {
    title: string; category: string; price: number
    level: string; format: string; duration_text: string
    image_url: string | null
  } | null
  profile: { full_name: string; email: string; phone: string | null; avatar_url: string | null } | null
}

interface EnrollmentsTableProps {
  enrollments: EnrollmentRow[]
  total:       number
  page:        number
  status:      string
  courses:     AcademyCourse[]
}

const statusColor: Record<EnrollmentStatus, 'yellow' | 'green' | 'blue' | 'red'> = {
  pending: 'yellow', confirmed: 'green', completed: 'blue', cancelled: 'red',
}

const SOURCE_CONFIG: Record<BookingSource, { label: string; icon: React.ElementType; color: string }> = {
  online:  { label: 'Online',   icon: Globe,       color: 'text-blue-400'    },
  walk_in: { label: 'Walk-in',  icon: Footprints,  color: 'text-emerald-400' },
  phone:   { label: 'Phone',    icon: Phone,       color: 'text-purple-400'  },
  admin:   { label: 'Admin',    icon: ShieldCheck, color: 'text-gold-400'    },
}

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export function EnrollmentsTable({ enrollments, total, page, status, courses }: EnrollmentsTableProps) {
  const router     = useRouter()
  const [, start]  = useTransition()
  const [updating, setUpdating]   = useState<string | null>(null)
  const [selected, setSelected]   = useState<EnrollmentRow | null>(null)
  const [editing,  setEditing]    = useState<EnrollmentRow | null>(null)
  const [creating, setCreating]   = useState(false)
  const pageSize   = 20
  const totalPages = Math.ceil(total / pageSize)

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams({ status, page: String(page), ...params })
    router.push(`/admin/enrollments?${sp}`)
  }

  async function updateStatus(id: string, newStatus: EnrollmentStatus) {
    setUpdating(id)
    start(async () => {
      const { error } = await adminUpdateEnrollmentStatus(id, newStatus)
      if (error) toast.error(error)
      else { toast.success(`Enrollment ${newStatus}`); router.refresh() }
      setUpdating(null)
    })
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
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
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30
                       text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Enrollment
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/5">
                  {['Reference', 'Student', 'Course', 'Source', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-neutral-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-neutral-500 text-sm">
                      No enrollments found.
                    </td>
                  </tr>
                )}
                {enrollments.map((e) => {
                  const studentName  = e.profile?.full_name ?? e.guest_name  ?? 'Guest'
                  const studentEmail = e.profile?.email     ?? e.guest_email ?? '—'
                  const isUpdating   = updating === e.id
                  const src = (e as EnrollmentRow & { source?: BookingSource }).source ?? 'online'
                  const srcCfg = SOURCE_CONFIG[src]
                  const SrcIcon = srcCfg.icon
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setSelected(e)}
                    >
                      <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                        <button
                          onClick={() => setSelected(e)}
                          className="font-mono text-[10px] text-gold-400 hover:text-gold-300 transition-colors"
                        >
                          {e.reference}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 dark:text-white text-xs font-medium">{studentName}</p>
                        <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{studentEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-neutral-200 text-xs line-clamp-1">{e.course?.title ?? '—'}</p>
                        <p className="text-gray-400 dark:text-neutral-500 text-[10px] capitalize">{e.course?.category ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-[10px] font-medium ${srcCfg.color}`}>
                          <SrcIcon className="w-3 h-3" />
                          {srcCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-neutral-200 text-xs font-medium">
                        NPR {Number(e.amount_paid).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge label={e.status} color={statusColor[e.status]} />
                      </td>
                      <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {/* View details */}
                          <button onClick={() => setSelected(e)}
                            title="View details"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Edit */}
                          <button onClick={() => setEditing(e)}
                            title="Edit enrollment"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {e.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(e.id, 'confirmed')} disabled={isUpdating}
                                title="Confirm enrollment"
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(e.id, 'cancelled')} disabled={isUpdating}
                                title="Cancel"
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {e.status === 'confirmed' && (
                            <>
                              <button onClick={() => updateStatus(e.id, 'completed')} disabled={isUpdating}
                                title="Mark completed"
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => updateStatus(e.id, 'cancelled')} disabled={isUpdating}
                                title="Cancel"
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {e.status === 'cancelled' && (
                            <button onClick={() => updateStatus(e.id, 'pending')} disabled={isUpdating}
                              title="Restore to pending"
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

      {/* Enrollment detail slide-over */}
      {selected && (
        <EnrollmentDetailPanel
          enrollment={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Edit enrollment form */}
      {editing && (
        <EnrollmentFormPanel
          courses={courses}
          enrollment={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Create enrollment form */}
      {creating && (
        <EnrollmentFormPanel
          courses={courses}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  )
}
