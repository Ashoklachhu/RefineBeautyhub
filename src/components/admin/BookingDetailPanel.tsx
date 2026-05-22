'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  X, User, Mail, Phone, CalendarCheck, Clock, Scissors,
  UserCog, DollarSign, FileText, Save, Loader2, CheckCircle2,
  XCircle, AlertCircle, Info, MapPin,
} from 'lucide-react'
import { AdminBadge } from './AdminBadge'
import { adminUpdateBookingStatus, adminUpdateBookingNotes } from '@/app/actions/admin'
import { BRANCHES } from '@/constants'
import type { Booking, BookingStatus, BookingSource } from '@/types/database'

type BookingRow = Booking & {
  service?: { name: string; duration_minutes: number } | null
  staff?:   { name: string } | null
  profile?: { full_name: string; email: string; phone: string | null; avatar_url: string | null } | null
}

const statusColor: Record<BookingStatus, 'yellow' | 'green' | 'blue' | 'red' | 'gray'> = {
  pending: 'yellow', confirmed: 'green', completed: 'blue', cancelled: 'red', no_show: 'gray',
}

function fmt(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

interface Props {
  booking: BookingRow
  onClose: () => void
}

export function BookingDetailPanel({ booking: initial, onClose }: Props) {
  const router = useRouter()
  const [, start] = useTransition()

  const [booking, setBooking] = useState(initial)
  const [staffNotes, setStaffNotes]   = useState(initial.staff_notes ?? '')
  const [clientNotes, setClientNotes] = useState(initial.notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Keep local copy in sync if parent re-renders
  useEffect(() => { setBooking(initial) }, [initial])

  const clientName  = booking.profile?.full_name ?? booking.guest_name ?? 'Guest'
  const clientEmail = booking.profile?.email     ?? booking.guest_email ?? '—'
  const clientPhone = booking.profile?.phone     ?? booking.guest_phone ?? '—'
  const isGuest     = !booking.user_id

  async function handleStatusChange(newStatus: BookingStatus) {
    setUpdatingStatus(true)
    start(async () => {
      const { error } = await adminUpdateBookingStatus(booking.id, newStatus)
      if (error) toast.error(error)
      else {
        toast.success(`Booking ${newStatus}`)
        setBooking(b => ({ ...b, status: newStatus }))
        router.refresh()
      }
      setUpdatingStatus(false)
    })
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    const { error } = await adminUpdateBookingNotes(booking.id, {
      staff_notes: staffNotes,
      notes:       clientNotes,
    })
    if (error) toast.error(error)
    else { toast.success('Notes saved'); router.refresh() }
    setSavingNotes(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-white/10
                      shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          <div>
            <p className="font-mono text-xs text-gray-500 dark:text-neutral-400">{booking.reference}</p>
            <h2 className="text-gray-900 dark:text-white font-semibold mt-0.5">Booking Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <AdminBadge label={booking.status} color={statusColor[booking.status]} />
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400
                         hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Client info */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                Client Information
              </h3>
              {isGuest && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 text-[10px]">
                  Guest
                </span>
              )}
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                {booking.profile?.avatar_url
                  ? <img src={booking.profile.avatar_url} alt={clientName} className="w-full h-full object-cover" />
                  : <User className="w-4 h-4 text-gray-400 dark:text-neutral-500" />}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">{clientName}</p>
                {isGuest
                  ? <p className="text-gray-400 dark:text-neutral-500 text-[10px]">Guest booking (no account)</p>
                  : <p className="text-gray-400 dark:text-neutral-500 text-[10px]">Registered member</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <InfoRow icon={Mail}  label="Email" value={clientEmail} />
              <InfoRow icon={Phone} label="Phone" value={clientPhone} />
            </div>
          </section>

          {/* Booking info */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Appointment</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InfoRow icon={Scissors}   label="Service"  value={booking.service?.name ?? '—'} />
              <InfoRow icon={UserCog}    label="Artist"   value={booking.staff?.name ?? 'Any available'} />
              <InfoRow icon={CalendarCheck} label="Date" value={new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-NP', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} />
              <InfoRow icon={Clock}      label="Time"     value={`${fmtTime(booking.start_time)} – ${fmtTime(booking.end_time)}`} />
              <InfoRow icon={Clock}      label="Duration" value={booking.service?.duration_minutes ? `${booking.service.duration_minutes} min` : '—'} />
              <InfoRow icon={DollarSign} label="Amount"   value={`NPR ${Number(booking.total_amount).toLocaleString()}`} />
              <InfoRow icon={Info}       label="Source"   value={
                ({ online: 'Online (website)', walk_in: 'Walk-in', phone: 'Phone', admin: 'Admin (manual)' } as Record<BookingSource, string>)[
                  ((booking as Booking & { source?: BookingSource }).source ?? 'online')
                ]
              } />
              <InfoRow icon={MapPin} label="Branch" value={
                BRANCHES.find(b => b.id === booking.branch)?.name ?? booking.branch ?? '—'
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
              <TimelineRow icon={Info}         color="text-neutral-400" label="Booked"    value={fmt(booking.created_at)} />
              {booking.confirmed_at  && <TimelineRow icon={CheckCircle2} color="text-emerald-400" label="Confirmed"  value={fmt(booking.confirmed_at)} />}
              {booking.completed_at  && <TimelineRow icon={CheckCircle2} color="text-blue-400"    label="Completed"  value={fmt(booking.completed_at)} />}
              {booking.cancelled_at  && <TimelineRow icon={XCircle}      color="text-rose-400"    label="Cancelled"  value={fmt(booking.cancelled_at)} />}
              {booking.cancellation_reason && (
                <p className="text-[11px] text-gray-400 dark:text-neutral-500 pl-6">Reason: {booking.cancellation_reason}</p>
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
              {booking.status === 'pending' && (
                <>
                  <ActionButton label="Confirm"  color="emerald" onClick={() => handleStatusChange('confirmed')}  loading={updatingStatus} />
                  <ActionButton label="Cancel"   color="rose"    onClick={() => handleStatusChange('cancelled')}  loading={updatingStatus} />
                </>
              )}
              {booking.status === 'confirmed' && (
                <>
                  <ActionButton label="Complete" color="blue"    onClick={() => handleStatusChange('completed')}  loading={updatingStatus} />
                  <ActionButton label="No Show"  color="gray"    onClick={() => handleStatusChange('no_show')}    loading={updatingStatus} />
                  <ActionButton label="Cancel"   color="rose"    onClick={() => handleStatusChange('cancelled')}  loading={updatingStatus} />
                </>
              )}
              {(booking.status === 'cancelled' || booking.status === 'no_show') && (
                <ActionButton label="Restore to Pending" color="gold" onClick={() => handleStatusChange('pending')} loading={updatingStatus} />
              )}
              {booking.status === 'completed' && (
                <p className="text-xs text-gray-400 dark:text-neutral-500 italic">This booking is completed.</p>
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Notes</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-500 dark:text-neutral-400">Client Notes (from booking form)</label>
              <textarea
                rows={2}
                value={clientNotes}
                onChange={e => setClientNotes(e.target.value)}
                placeholder="No client notes…"
                className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2
                           text-xs text-gray-700 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-600 resize-none
                           focus:outline-none focus:border-gold-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-500 dark:text-neutral-400">Staff / Admin Notes (internal)</label>
              <textarea
                rows={3}
                value={staffNotes}
                onChange={e => setStaffNotes(e.target.value)}
                placeholder="Add internal notes visible only to staff…"
                className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2
                           text-xs text-gray-700 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-600 resize-none
                           focus:outline-none focus:border-gold-500/50 transition-colors"
              />
            </div>

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

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 dark:text-neutral-500">{label}</p>
        <p className="text-xs text-gray-700 dark:text-neutral-200 break-all">{value}</p>
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
      <span className="text-xs text-gray-500 dark:text-neutral-400 w-20 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-700 dark:text-neutral-200">{value}</span>
    </div>
  )
}

function ActionButton({
  label, color, onClick, loading,
}: { label: string; color: string; onClick: () => void; loading: boolean }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20',
    blue:    'bg-blue-500/10    text-blue-400    hover:bg-blue-500/20    border-blue-500/20',
    rose:    'bg-rose-500/10    text-rose-400    hover:bg-rose-500/20    border-rose-500/20',
    gray:    'bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-neutral-600 border-gray-300 dark:border-white/5',
    gold:    'bg-gold-500/10   text-gold-400    hover:bg-gold-500/20    border-gold-500/20',
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${colorMap[color] ?? colorMap.gray}`}
    >
      {label}
    </button>
  )
}
