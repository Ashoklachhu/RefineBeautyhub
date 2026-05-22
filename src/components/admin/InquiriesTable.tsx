'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle, XCircle, Flame } from 'lucide-react'
import type { ContactInquiry, InquiryStatus, InquiryPriority } from '@/types/database'

// ── Config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InquiryStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  new:         { label: 'New',         color: '#60a5fa', bg: '#1e3a5f', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: '#fbbf24', bg: '#3d2e0a', icon: Clock },
  resolved:    { label: 'Resolved',    color: '#34d399', bg: '#0d3326', icon: CheckCircle },
  closed:      { label: 'Closed',      color: '#9ca3af', bg: '#1f2937', icon: XCircle },
}

const PRIORITY_CONFIG: Record<InquiryPriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: '#6b7280' },
  normal: { label: 'Normal', color: '#9ca3af' },
  high:   { label: 'High',   color: '#f59e0b' },
  urgent: { label: 'Urgent', color: '#ef4444' },
}

const STATUS_TABS = [
  { value: 'all',         label: 'All' },
  { value: 'new',         label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
]

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60)   return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400)return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  inquiries: ContactInquiry[]
  total:     number
  page:      number
  status:    string
  priority:  string
}

export function InquiriesTable({ inquiries, total, page, status, priority }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const totalPages = Math.ceil(total / 25)

  function nav(params: Record<string, string>) {
    const sp = new URLSearchParams({ status, priority, page: String(page), ...params })
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex gap-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-xl p-1 overflow-x-auto">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => nav({ status: t.value, page: '1' })}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all
              ${status === t.value ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300'}`}>
            {t.label}
          </button>
        ))}
        {/* Priority filter */}
        <div className="ml-auto flex-shrink-0 pl-2">
          <select value={priority} onChange={e => nav({ priority: e.target.value, page: '1' })}
            className="bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-neutral-300 text-xs rounded-lg px-3 py-2 outline-none">
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-neutral-700 mb-3" />
            <p className="text-gray-500 dark:text-neutral-400 text-sm">No inquiries found</p>
            <p className="text-gray-300 dark:text-neutral-600 text-xs mt-1">New submissions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {/* Header */}
            <div className="grid grid-cols-[1fr_160px_100px_90px_80px] gap-4 px-5 py-3 text-[10px] font-semibold tracking-wider text-gray-400 dark:text-neutral-500 uppercase">
              <span>Contact</span>
              <span>Subject</span>
              <span>Status</span>
              <span>Priority</span>
              <span className="text-right">Time</span>
            </div>

            {inquiries.map(inq => {
              const st = STATUS_CONFIG[inq.status]
              const pr = PRIORITY_CONFIG[inq.priority ?? 'normal']
              const StIcon = st.icon
              return (
                <Link key={inq.id} href={`/admin/inquiries/${inq.id}`}
                  className="grid grid-cols-[1fr_160px_100px_90px_80px] gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  {/* Contact */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {inq.status === 'new' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-gold-400 transition-colors">
                        {inq.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-neutral-500 truncate mt-0.5">{inq.email}</p>
                    {inq.phone && <p className="text-xs text-gray-300 dark:text-neutral-600 mt-0.5">{inq.phone}</p>}
                  </div>

                  {/* Subject */}
                  <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{inq.subject}</p>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md w-fit"
                    style={{ background: st.bg }}>
                    <StIcon className="w-3 h-3" style={{ color: st.color }} />
                    <span className="text-[10px] font-semibold" style={{ color: st.color }}>{st.label}</span>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-1">
                    {(inq.priority === 'urgent' || inq.priority === 'high') && (
                      <Flame className="w-3 h-3" style={{ color: pr.color }} />
                    )}
                    <span className="text-xs font-medium capitalize" style={{ color: pr.color }}>
                      {inq.priority ?? 'normal'}
                    </span>
                  </div>

                  {/* Time */}
                  <p className="text-xs text-gray-300 dark:text-neutral-600 text-right">{timeAgo(inq.created_at)}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-neutral-500">
            Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => nav({ page: String(page - 1) })}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= totalPages} onClick={() => nav({ page: String(page + 1) })}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
