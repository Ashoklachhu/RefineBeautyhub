'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  X, User, Mail, Phone, GraduationCap, DollarSign,
  FileText, Save, Loader2, CheckCircle2, XCircle,
  Info, Tag, Clock, RotateCcw, Check, AlertCircle,
} from 'lucide-react'
import { AdminBadge } from './AdminBadge'
import { adminUpdateEnrollmentStatus, adminUpdateEnrollmentNotes } from '@/app/actions/admin'
import type { Enrollment, EnrollmentStatus, BookingSource } from '@/types/database'

type EnrollmentRow = Enrollment & {
  course:  {
    title: string; category: string; price: number
    level: string; format: string; duration_text: string
    image_url: string | null
  } | null
  profile: { full_name: string; email: string; phone: string | null; avatar_url: string | null } | null
}

const statusColor: Record<EnrollmentStatus, 'yellow' | 'green' | 'blue' | 'red'> = {
  pending: 'yellow', confirmed: 'green', completed: 'blue', cancelled: 'red',
}

function fmt(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface Props {
  enrollment: EnrollmentRow
  onClose:    () => void
}

export function EnrollmentDetailPanel({ enrollment: initial, onClose }: Props) {
  const router = useRouter()
  const [, start] = useTransition()

  const [enrollment, setEnrollment] = useState(initial)
  const [notes, setNotes]           = useState(initial.notes ?? '')
  const [savingNotes, setSavingNotes]       = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    setEnrollment(initial)
    setNotes(initial.notes ?? '')
  }, [initial])

  const studentName  = enrollment.profile?.full_name ?? enrollment.guest_name  ?? 'Guest'
  const studentEmail = enrollment.profile?.email     ?? enrollment.guest_email ?? '—'
  const studentPhone = enrollment.profile?.phone     ?? enrollment.guest_phone ?? '—'
  const isGuest      = !enrollment.user_id

  async function handleStatusChange(newStatus: EnrollmentStatus) {
    setUpdatingStatus(true)
    start(async () => {
      const { error } = await adminUpdateEnrollmentStatus(enrollment.id, newStatus)
      if (error) toast.error(error)
      else {
        toast.success(`Enrollment ${newStatus}`)
        setEnrollment(e => ({ ...e, status: newStatus }))
        router.refresh()
      }
      setUpdatingStatus(false)
    })
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    const { error } = await adminUpdateEnrollmentNotes(enrollment.id, { notes })
    if (error) toast.error(error)
    else { toast.success('Notes saved'); router.refresh() }
    setSavingNotes(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-white/10
                      shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          <div>
            <p className="font-mono text-xs text-gray-500 dark:text-neutral-400">{enrollment.reference}</p>
            <h2 className="text-gray-900 dark:text-white font-semibold mt-0.5">Enrollment Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <AdminBadge label={enrollment.status} color={statusColor[enrollment.status]} />
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400
                         hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Student info */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                Student Information
              </h3>
              {isGuest && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 text-[10px]">
                  Guest
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                {enrollment.profile?.avatar_url
                  ? <img src={enrollment.profile.avatar_url} alt={studentName} className="w-full h-full object-cover" />
                  : <User className="w-4 h-4 text-gray-400 dark:text-neutral-500" />}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">{studentName}</p>
                <p className="text-gray-400 dark:text-neutral-500 text-[10px]">
                  {isGuest ? 'Guest enrollment (no account)' : 'Registered member'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <InfoRow icon={Mail}  label="Email" value={studentEmail} />
              <InfoRow icon={Phone} label="Phone" value={studentPhone} />
            </div>
          </section>

          {/* Course info */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Course</h3>
            </div>

            {/* Course card */}
            <div className="flex items-start gap-3">
              {enrollment.course?.image_url ? (
                <img
                  src={enrollment.course.image_url}
                  alt={enrollment.course.title}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200 dark:border-white/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-gray-400 dark:text-neutral-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white text-sm font-medium leading-snug">
                  {enrollment.course?.title ?? '—'}
                </p>
                <p className="text-gray-500 dark:text-neutral-400 text-xs capitalize mt-0.5">
                  {enrollment.course?.category ?? '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <InfoRow icon={Tag}          label="Level"    value={enrollment.course?.level ?? '—'} capitalize />
              <InfoRow icon={Tag}          label="Format"   value={enrollment.course?.format?.replace('_', ' ') ?? '—'} capitalize />
              <InfoRow icon={Clock}        label="Duration" value={enrollment.course?.duration_text ?? '—'} />
              <InfoRow icon={DollarSign}   label="Paid"     value={`NPR ${Number(enrollment.amount_paid).toLocaleString()}`} />
              <InfoRow icon={Info}         label="Source"   value={
                ({ online: 'Online (website)', walk_in: 'Walk-in', phone: 'Phone', admin: 'Admin (manual)' } as Record<BookingSource, string>)[
                  ((enrollment as Enrollment & { source?: BookingSource }).source ?? 'online')
                ]
              } />
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Timeline</h3>
            </div>
            <div className="space-y-2">
              <TimelineRow icon={Info}         color="text-neutral-400"  label="Enrolled"   value={fmt(enrollment.enrolled_at ?? enrollment.created_at)} />
              {enrollment.confirmed_at && (
                <TimelineRow icon={CheckCircle2} color="text-emerald-400" label="Confirmed"  value={fmt(enrollment.confirmed_at)} />
              )}
              {enrollment.completed_at && (
                <TimelineRow icon={CheckCircle2} color="text-blue-400"    label="Completed"  value={fmt(enrollment.completed_at)} />
              )}
              {enrollment.status === 'cancelled' && (
                <TimelineRow icon={XCircle}      color="text-rose-400"    label="Cancelled"  value="—" />
              )}
            </div>
          </section>

          {/* Status actions */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Change Status</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {enrollment.status === 'pending' && (
                <>
                  <ActionBtn label="Confirm"  color="emerald" onClick={() => handleStatusChange('confirmed')}  loading={updatingStatus} />
                  <ActionBtn label="Cancel"   color="rose"    onClick={() => handleStatusChange('cancelled')}  loading={updatingStatus} />
                </>
              )}
              {enrollment.status === 'confirmed' && (
                <>
                  <ActionBtn label="Complete" color="blue"  onClick={() => handleStatusChange('completed')}  loading={updatingStatus} />
                  <ActionBtn label="Cancel"   color="rose"  onClick={() => handleStatusChange('cancelled')}  loading={updatingStatus} />
                </>
              )}
              {enrollment.status === 'cancelled' && (
                <ActionBtn label="Restore to Pending" color="gold" onClick={() => handleStatusChange('pending')} loading={updatingStatus} />
              )}
              {enrollment.status === 'completed' && (
                <p className="text-xs text-gray-400 dark:text-neutral-500 italic">This enrollment is completed.</p>
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Notes</h3>
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal notes about this enrollment…"
              className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2
                         text-xs text-gray-700 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-600 resize-none
                         focus:outline-none focus:border-gold-500/50 transition-colors"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/15 border border-gold-500/30
                         text-gold-400 hover:bg-gold-500/20 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Notes
            </button>
          </section>

        </div>
      </div>
    </>
  )
}

// ── Small helpers ─────────────────────────────────────────────

function InfoRow({
  icon: Icon, label, value, capitalize,
}: { icon: React.ElementType; label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-neutral-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-neutral-500">{label}</p>
        <p className={`text-xs text-neutral-200 break-all ${capitalize ? 'capitalize' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

function TimelineRow({
  icon: Icon, color, label, value,
}: { icon: React.ElementType; color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
      <span className="text-xs text-neutral-400 w-20 flex-shrink-0">{label}</span>
      <span className="text-xs text-neutral-200">{value}</span>
    </div>
  )
}

function ActionBtn({
  label, color, onClick, loading,
}: { label: string; color: string; onClick: () => void; loading: boolean }) {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20',
    blue:    'bg-blue-500/10    text-blue-400    hover:bg-blue-500/20    border-blue-500/20',
    rose:    'bg-rose-500/10    text-rose-400    hover:bg-rose-500/20    border-rose-500/20',
    gold:    'bg-gold-500/10    text-gold-400    hover:bg-gold-500/20    border-gold-500/20',
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50
        ${styles[color] ?? styles.gold}`}
    >
      {label}
    </button>
  )
}
