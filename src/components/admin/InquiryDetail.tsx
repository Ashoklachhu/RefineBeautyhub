'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Mail, Clock, Send, Loader2, Trash2,
  MessageSquare, PhoneCall, MessageCircle, AtSign, FileText,
  AlertCircle, CheckCircle, XCircle, Flame,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  adminUpdateInquiryStatus,
  adminAddInquiryNote,
  adminDeleteInquiry,
} from '@/app/actions/admin'
import type { ContactInquiry, InquiryNote, InquiryStatus, InquiryPriority, NoteType } from '@/types/database'

// ── Config ────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: InquiryStatus; label: string; color: string; icon: typeof Clock }[] = [
  { value: 'new',         label: 'New',         color: '#60a5fa', icon: AlertCircle  },
  { value: 'in_progress', label: 'In Progress', color: '#fbbf24', icon: Clock        },
  { value: 'resolved',    label: 'Resolved',    color: '#34d399', icon: CheckCircle  },
  { value: 'closed',      label: 'Closed',      color: '#9ca3af', icon: XCircle      },
]

const PRIORITY_OPTIONS: { value: InquiryPriority; label: string; color: string }[] = [
  { value: 'low',    label: 'Low',    color: '#6b7280' },
  { value: 'normal', label: 'Normal', color: '#9ca3af' },
  { value: 'high',   label: 'High',   color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
]

const NOTE_TYPES: { value: NoteType; label: string; icon: typeof MessageSquare; color: string }[] = [
  { value: 'internal',  label: 'Internal Note', icon: FileText,       color: '#9ca3af' },
  { value: 'reply',     label: 'Email Reply',   icon: AtSign,         color: '#60a5fa' },
  { value: 'call',      label: 'Phone Call',    icon: PhoneCall,      color: '#34d399' },
  { value: 'whatsapp',  label: 'WhatsApp',      icon: MessageCircle,  color: '#25d366' },
  { value: 'email',     label: 'Email Sent',    icon: Mail,           color: '#a78bfa' },
]

const NOTE_BG: Record<NoteType, string> = {
  internal:  '#1f2937',
  reply:     '#1e3a5f',
  call:      '#0d3326',
  whatsapp:  '#0d2a1a',
  email:     '#2d1b69',
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  inquiry: ContactInquiry
  notes:   InquiryNote[]
  adminId: string
}

export function InquiryDetail({ inquiry, notes: initialNotes, adminId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes]       = useState<InquiryNote[]>(initialNotes)
  const [status, setStatusLocal] = useState<InquiryStatus>(inquiry.status)
  const [priority, setPriorityLocal] = useState<InquiryPriority>(inquiry.priority ?? 'normal')
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('internal')
  const [showDelete, setShowDelete] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes])

  function handleStatusChange(newStatus: InquiryStatus) {
    setStatusLocal(newStatus)
    startTransition(async () => {
      const { error } = await adminUpdateInquiryStatus(inquiry.id, newStatus)
      if (error) { toast.error(error); setStatusLocal(status) }
      else toast.success(`Status → ${newStatus.replace('_', ' ')}`)
    })
  }

  function handlePriorityChange(newPriority: InquiryPriority) {
    setPriorityLocal(newPriority)
    startTransition(async () => {
      const { error } = await adminUpdateInquiryStatus(inquiry.id, status, newPriority)
      if (error) { toast.error(error); setPriorityLocal(priority) }
    })
  }

  function handleAddNote() {
    if (!noteText.trim()) return
    startTransition(async () => {
      const { error } = await adminAddInquiryNote(inquiry.id, noteText.trim(), noteType, adminId)
      if (error) { toast.error(error); return }
      // Optimistically add note to UI
      const optimistic: InquiryNote = {
        id: crypto.randomUUID(), inquiry_id: inquiry.id,
        note: noteText.trim(), note_type: noteType,
        created_by: adminId, created_at: new Date().toISOString(),
      }
      setNotes(p => [...p, optimistic])
      setNoteText('')
      if (status === 'new') setStatusLocal('in_progress')
      toast.success('Note added')
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const { error } = await adminDeleteInquiry(inquiry.id)
      if (error) { toast.error(error); return }
      toast.success('Inquiry deleted')
      router.push('/admin/inquiries')
    })
  }

  const currentStatus  = STATUS_OPTIONS.find(s => s.value === status)!
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === priority)!
  const StatusIcon = currentStatus.icon

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/inquiries"
            className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{inquiry.name}</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{inquiry.subject}</p>
          </div>
        </div>
        <button onClick={() => setShowDelete(true)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-300 dark:text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">

        {/* ── LEFT — message + timeline ── */}
        <div className="space-y-5">

          {/* Original message */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-neutral-500">Original Message</p>
              <p className="text-xs text-gray-300 dark:text-neutral-600">{new Date(inquiry.created_at).toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-700 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
          </div>

          {/* Follow-up timeline */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Follow-up Timeline</p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{notes.length} {notes.length === 1 ? 'entry' : 'entries'}</p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[420px] overflow-y-auto">
              {notes.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="w-8 h-8 text-gray-300 dark:text-neutral-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-neutral-600">No follow-ups yet</p>
                  <p className="text-xs text-gray-300 dark:text-neutral-700 mt-1">Add a note below to start tracking</p>
                </div>
              ) : (
                notes.map(n => {
                  const nt = NOTE_TYPES.find(t => t.value === n.note_type) ?? NOTE_TYPES[0]
                  const NtIcon = nt.icon
                  return (
                    <div key={n.id} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: NOTE_BG[n.note_type] }}>
                          <NtIcon className="w-3.5 h-3.5" style={{ color: nt.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold" style={{ color: nt.color }}>
                              {nt.label}
                            </span>
                            <span className="text-[10px] text-gray-300 dark:text-neutral-600">{timeAgo(n.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{n.note}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Add note */}
            <div className="p-5 border-t border-gray-200 dark:border-white/5 space-y-3">
              {/* Note type selector */}
              <div className="flex gap-2 flex-wrap">
                {NOTE_TYPES.map(nt => {
                  const NtIcon = nt.icon
                  return (
                    <button key={nt.value} onClick={() => setNoteType(nt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all border
                        ${noteType === nt.value ? 'border-transparent' : 'border-gray-200 dark:border-white/5 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300'}`}
                      style={noteType === nt.value ? { background: NOTE_BG[nt.value], color: nt.color, borderColor: 'transparent' } : {}}>
                      <NtIcon className="w-3 h-3" />
                      {nt.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote() }}
                  placeholder={`Add ${NOTE_TYPES.find(t => t.value === noteType)?.label.toLowerCase()}… (Ctrl+Enter to submit)`}
                  rows={3}
                  className="flex-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 resize-none outline-none focus:border-gold-500/50 transition-colors"
                />
                <button onClick={handleAddNote} disabled={isPending || !noteText.trim()}
                  className="self-end p-3 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 disabled:opacity-40 transition-all">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — contact info + status panel ── */}
        <div className="space-y-4">

          {/* Contact card */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-neutral-500">Contact Info</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gold-400">
                  {inquiry.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{inquiry.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 capitalize">{inquiry.subject}</p>
                </div>
              </div>

              <a href={`mailto:${inquiry.email}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors group">
                <Mail className="w-4 h-4 text-gray-400 dark:text-neutral-500 group-hover:text-blue-400 transition-colors" />
                <span className="text-xs text-gray-600 dark:text-neutral-300 truncate">{inquiry.email}</span>
              </a>

              {inquiry.phone && (
                <a href={`tel:${inquiry.phone}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors group">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-neutral-500 group-hover:text-green-400 transition-colors" />
                  <span className="text-xs text-gray-600 dark:text-neutral-300">{inquiry.phone}</span>
                </a>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-3.5 h-3.5 text-gray-300 dark:text-neutral-600" />
                <span className="text-xs text-gray-300 dark:text-neutral-600">
                  Received {new Date(inquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-neutral-500">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(opt => {
                const Icon = opt.icon
                const active = status === opt.value
                return (
                  <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border
                      ${active ? 'border-transparent' : 'border-gray-200 dark:border-white/5 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 hover:border-gray-300 dark:hover:border-white/10'}`}
                    style={active ? { background: `${opt.color}20`, color: opt.color, borderColor: `${opt.color}40` } : {}}>
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-neutral-500">Priority</p>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITY_OPTIONS.map(opt => {
                const active = priority === opt.value
                return (
                  <button key={opt.value} onClick={() => handlePriorityChange(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border capitalize
                      ${active ? 'border-transparent' : 'border-gray-200 dark:border-white/5 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 hover:border-gray-300 dark:hover:border-white/10'}`}
                    style={active ? { background: `${opt.color}20`, color: opt.color, borderColor: `${opt.color}40` } : {}}>
                    {(opt.value === 'urgent' || opt.value === 'high') && <Flame className="w-3 h-3" />}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-2">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-neutral-500 mb-3">Quick Actions</p>
            <a href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}`}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 transition-colors text-xs font-semibold">
              <Mail className="w-4 h-4" />
              Reply via Email
            </a>
            {inquiry.phone && (
              <a href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors"
                style={{ background: '#0d2a1a', borderColor: '#25d36630', color: '#25d366' }}>
                <MessageCircle className="w-4 h-4" />
                Message on WhatsApp
              </a>
            )}
            <Link href="/booking"
              className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 hover:bg-gold-500/15 transition-colors text-xs font-semibold">
              <CheckCircle className="w-4 h-4" />
              Convert to Booking
            </Link>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete Inquiry?</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
              This will permanently delete the inquiry from {inquiry.name} and all follow-up notes. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors disabled:opacity-50">
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
