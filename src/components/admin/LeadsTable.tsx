'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  MessageSquare, Phone, Mail, Trash2, Loader2, ChevronDown, ChevronUp,
  Bot, Sparkles, Check,
} from 'lucide-react'
import { adminUpdateLeadStatus, adminUpdateLeadNotes, adminDeleteLead } from '@/app/actions/admin'
import type { KuroLead, KuroLeadStatus } from '@/types/database'

const STATUSES: { value: KuroLeadStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'new',       label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed',    label: 'Closed' },
]

const STATUS_STYLE: Record<KuroLeadStatus, string> = {
  new:       'bg-amber-500/15 text-amber-500 border-amber-500/30',
  contacted: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  converted: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  closed:    'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)    return 'just now'
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null
  const tone = score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-gray-400'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${tone}`} title="Kuro lead score">
      <Sparkles className="w-3 h-3" />
      {score}
    </span>
  )
}

function LeadRow({ lead, busy, onAction }: {
  lead: KuroLead
  busy: boolean
  onAction: (fn: () => Promise<{ error?: string }>, msg?: string) => void
}) {
  const [open, setOpen]   = useState(false)
  const [notes, setNotes] = useState(lead.notes ?? '')

  const detailEntries = Object.entries(lead.details ?? {})

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900">
      {/* Summary */}
      <div className="flex items-start gap-4 p-4">
        <div className="w-9 h-9 rounded-full bg-gold-500/15 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-gold-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {lead.name?.trim() || 'Unnamed lead'}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLE[lead.status]}`}>
              {lead.status}
            </span>
            <ScoreBadge score={lead.score} />
            <span className="text-[11px] text-gray-400 dark:text-neutral-500">{timeAgo(lead.received_at)}</span>
          </div>

          {lead.interest && (
            <p className="text-xs text-gray-600 dark:text-neutral-300 mt-1">{lead.interest}</p>
          )}

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {lead.phone && (
              <a href={`tel:${lead.phone.replace(/[^+0-9]/g, '')}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400 hover:text-gold-500 transition-colors">
                <Phone className="w-3 h-3" /> {lead.phone}
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400 hover:text-gold-500 transition-colors">
                <Mail className="w-3 h-3" /> {lead.email}
              </a>
            )}
          </div>
        </div>

        <button onClick={() => setOpen(v => !v)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Detail */}
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-100 dark:border-white/5">
          {lead.message && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-1">Message</p>
              <p className="text-sm text-gray-700 dark:text-neutral-200 leading-relaxed">{lead.message}</p>
            </div>
          )}

          {detailEntries.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-1.5">
                Collected by the chatbot
              </p>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {detailEntries.map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <dt className="text-gray-400 dark:text-neutral-500 capitalize">{k.replace(/[_-]/g, ' ')}:</dt>
                    <dd className="text-gray-700 dark:text-neutral-200 font-medium">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Follow-up status */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-1.5">Follow-up</p>
            <div className="flex gap-1.5 flex-wrap">
              {(['new', 'contacted', 'converted', 'closed'] as KuroLeadStatus[]).map(s => (
                <button
                  key={s}
                  disabled={busy || lead.status === s}
                  onClick={() => onAction(() => adminUpdateLeadStatus(lead.id, s), `Marked ${s}`)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors disabled:opacity-100
                    ${lead.status === s
                      ? STATUS_STYLE[s]
                      : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-1.5">Notes</p>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add a private note about this lead…"
              className="admin-input w-full resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <button
                disabled={busy || notes === (lead.notes ?? '')}
                onClick={() => onAction(() => adminUpdateLeadNotes(lead.id, notes), 'Note saved')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-medium disabled:opacity-40 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Save note
              </button>

              <button
                disabled={busy}
                onClick={() => {
                  if (!confirm('Delete this lead permanently?')) return
                  onAction(() => adminDeleteLead(lead.id), 'Lead deleted')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-300 dark:text-neutral-600">
            Kuro ref {lead.resource_id}{lead.channel ? ` · ${lead.channel}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export function LeadsTable({ leads, error }: { leads: KuroLead[]; error?: string }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<KuroLeadStatus | 'all'>('all')

  function runAction(fn: () => Promise<{ error?: string }>, msg?: string) {
    setBusy(true)
    start(async () => {
      const { error: actionError } = await fn()
      setBusy(false)
      if (actionError) { toast.error(actionError); return }
      if (msg) toast.success(msg)
      router.refresh()
    })
  }

  const visible = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Leads storage is not set up yet</p>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1.5">
          Run migration <code className="font-mono">018_kuro_leads.sql</code> in the Supabase SQL editor,
          then reload this page.
        </p>
        <p className="text-[11px] text-gray-400 dark:text-neutral-600 mt-2 font-mono">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-xl p-1">
        {STATUSES.map(s => {
          const count = s.value === 'all' ? leads.length : leads.filter(l => l.status === s.value).length
          return (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
                ${filter === s.value
                  ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300'}`}>
              {s.label} {count > 0 && <span className="opacity-60">({count})</span>}
            </button>
          )
        })}
      </div>

      {busy && (
        <p className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
        </p>
      )}

      {visible.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-16 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
            {leads.length === 0 ? 'No chatbot leads yet' : `No ${filter} leads`}
          </p>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
            Leads captured by the Kuro widget appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(lead => (
            <LeadRow key={lead.id} lead={lead} busy={busy} onAction={runAction} />
          ))}
        </div>
      )}
    </div>
  )
}
