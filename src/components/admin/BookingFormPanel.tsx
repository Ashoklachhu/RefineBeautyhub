'use client'

import { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  X, Search, User, Calendar, Clock, DollarSign, FileText,
  Loader2, ChevronDown, Globe, Footprints, Phone, ShieldCheck,
} from 'lucide-react'
import {
  adminSearchUsers,
  adminCreateBooking,
  adminUpdateBooking,
} from '@/app/actions/admin'
import { BRANCHES } from '@/constants'
import type { Service, Staff, Booking, BookingSource, Profile } from '@/types/database'

// ── Types ─────────────────────────────────────────────────────

type BookingRow = Booking & {
  service?: { name: string; duration_minutes: number } | null
  staff?:   { name: string } | null
  profile?: { full_name: string; email: string; phone: string | null; avatar_url: string | null } | null
}

interface BookingFormPanelProps {
  services: Service[]
  staff:    Staff[]
  booking?: BookingRow | null   // if set → edit mode
  onClose:  () => void
}

// ── Source config ─────────────────────────────────────────────

const SOURCE_OPTIONS: { value: BookingSource; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'admin',   label: 'Admin',    icon: ShieldCheck, color: 'text-gold-400'    },
  { value: 'walk_in', label: 'Walk-in',  icon: Footprints,  color: 'text-emerald-400' },
  { value: 'phone',   label: 'Phone',    icon: Phone,       color: 'text-purple-400'  },
  { value: 'online',  label: 'Online',   icon: Globe,       color: 'text-blue-400'    },
]

// ── User search dropdown ───────────────────────────────────────

function UserSearch({
  onSelect,
  initialName,
}: {
  onSelect: (u: Profile | null) => void
  initialName?: string
}) {
  const [query,   setQuery]   = useState(initialName ?? '')
  const [results, setResults] = useState<Profile[]>([])
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Profile | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleInput(v: string) {
    setQuery(v)
    if (selected) { setSelected(null); onSelect(null) }
    if (timer.current) clearTimeout(timer.current)
    if (v.length < 2) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      const data = await adminSearchUsers(v)
      setResults(data)
      setOpen(true)
      setLoading(false)
    }, 300)
  }

  function pick(u: Profile) {
    setSelected(u)
    setQuery(u.full_name)
    setOpen(false)
    onSelect(u)
  }

  function clear() {
    setSelected(null)
    setQuery('')
    setResults([])
    onSelect(null)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-900 dark:text-white
                     placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50"
        />
        {(loading) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 animate-spin" />
        )}
        {selected && !loading && (
          <button onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
          {results.map(u => (
            <button key={u.id} onClick={() => pick(u)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/5 text-left transition-colors">
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-500 dark:text-neutral-400 text-xs flex-shrink-0">
                {u.avatar_url
                  ? <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover rounded-full" />
                  : u.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{u.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-3 text-sm text-gray-500 dark:text-neutral-400">
          No users found. Booking will be created as guest.
        </div>
      )}
    </div>
  )
}

// ── Main Panel ────────────────────────────────────────────────

export function BookingFormPanel({ services, staff, booking, onClose }: BookingFormPanelProps) {
  const router     = useRouter()
  const [, start]  = useTransition()
  const isEdit     = !!booking

  // Form state
  const [selectedUser,  setSelectedUser]  = useState<Profile | null>(null)
  const [guestName,     setGuestName]     = useState(booking?.guest_name  ?? '')
  const [guestEmail,    setGuestEmail]    = useState(booking?.guest_email ?? '')
  const [guestPhone,    setGuestPhone]    = useState(booking?.guest_phone ?? '')
  const [useGuest,      setUseGuest]      = useState(!booking?.user_id && !!(booking?.guest_name))
  const [serviceId,     setServiceId]     = useState(booking?.service_id ?? '')
  const [staffId,       setStaffId]       = useState(booking?.staff_id   ?? '')
  const [date,          setDate]          = useState(booking?.booking_date ?? '')
  const [startTime,     setStartTime]     = useState(booking?.start_time  ?? '')
  const [amount,        setAmount]        = useState(booking ? String(booking.total_amount) : '')
  const [source,        setSource]        = useState<BookingSource>(
    (booking as (BookingRow & { source?: BookingSource }) | undefined)?.source ?? 'admin'
  )
  const [branch,        setBranch]        = useState(booking?.branch ?? 'jadibuti')
  const [notes,         setNotes]         = useState(booking?.notes ?? '')
  const [staffNotes,    setStaffNotes]    = useState(booking?.staff_notes ?? '')
  const [saving,        setSaving]        = useState(false)

  // Auto-fill amount from service
  const selectedService = services.find(s => s.id === serviceId)

  function handleServiceChange(id: string) {
    setServiceId(id)
    const svc = services.find(s => s.id === id)
    if (svc && !amount) setAmount(String(svc.price))
  }

  // Compute end time from start + service duration
  function computeEndTime(start: string, mins: number): string {
    if (!start) return ''
    const [h, m] = start.split(':').map(Number)
    const total = h * 60 + m + mins
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!serviceId)     { toast.error('Please select a service');    return }
    if (!date)          { toast.error('Please select a date');        return }
    if (!startTime)     { toast.error('Please select a start time');  return }
    if (!amount || isNaN(Number(amount))) { toast.error('Please enter a valid amount'); return }

    const endTime = computeEndTime(startTime, selectedService?.duration_minutes ?? 60)

    // Client info
    let userId: string | null = null
    let gName:  string | null = null
    let gEmail: string | null = null
    let gPhone: string | null = null

    if (!useGuest && selectedUser) {
      userId = selectedUser.id
    } else {
      if (!guestName.trim())  { toast.error('Please enter guest name');  return }
      if (!guestEmail.trim()) { toast.error('Please enter guest email'); return }
      gName  = guestName.trim()
      gEmail = guestEmail.trim()
      gPhone = guestPhone.trim() || null
    }

    setSaving(true)
    start(async () => {
      if (isEdit && booking) {
        const { error } = await adminUpdateBooking(booking.id, {
          branch,
          service_id:   serviceId,
          staff_id:     staffId || null,
          booking_date: date,
          start_time:   startTime,
          end_time:     endTime,
          total_amount: Number(amount),
          source,
          notes:        notes || null,
          staff_notes:  staffNotes || null,
        })
        setSaving(false)
        if (error) { toast.error(error); return }
        toast.success('Booking updated')
        router.refresh()
        onClose()
      } else {
        const { error } = await adminCreateBooking({
          user_id:      userId,
          guest_name:   gName,
          guest_email:  gEmail,
          guest_phone:  gPhone,
          branch,
          service_id:   serviceId,
          staff_id:     staffId || null,
          booking_date: date,
          start_time:   startTime,
          end_time:     endTime,
          total_amount: Number(amount),
          source,
          notes:        notes || null,
          staff_notes:  staffNotes || null,
        })
        setSaving(false)
        if (error) { toast.error(error); return }
        toast.success('Booking created successfully')
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-slate-50 dark:bg-neutral-950 border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Booking' : 'New Booking'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              {isEdit ? `Editing ${booking?.reference}` : 'Manually create a booking'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* ── Branch ── */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Branch</label>
              <div className="grid grid-cols-2 gap-2">
                {BRANCHES.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => { setBranch(b.id); setStaffId('') }}
                    className={`flex flex-col items-start gap-0.5 py-2.5 px-3 rounded-lg border text-left transition-all
                      ${branch === b.id
                        ? 'border-gold-500/50 bg-gold-500/10 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-white/15'}`}
                  >
                    <span className="text-xs font-semibold">{b.name}</span>
                    <span className="text-[10px] opacity-60">{b.address}</span>
                  </button>
                ))}
              </div>
            </div>


            {/* ── Source ── */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Booking Source</label>
              <div className="grid grid-cols-4 gap-2">
                {SOURCE_OPTIONS.map(opt => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSource(opt.value)}
                      className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all
                        ${source === opt.value
                          ? 'border-gold-500/50 bg-gold-500/10 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-white/15'}`}
                    >
                      <Icon className={`w-4 h-4 ${source === opt.value ? opt.color : ''}`} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Client ── */}
            {!isEdit && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Client</label>
                  <button
                    type="button"
                    onClick={() => setUseGuest(v => !v)}
                    className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    {useGuest ? 'Search registered user' : 'Enter as guest'}
                  </button>
                </div>

                {!useGuest ? (
                  <UserSearch
                    onSelect={setSelectedUser}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input value={guestName} onChange={e => setGuestName(e.target.value)}
                        placeholder="Guest name *"
                        className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50" />
                    </div>
                    <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                      type="email" placeholder="Guest email *"
                      className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50" />
                    <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                      type="tel" placeholder="Phone (optional)"
                      className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50" />
                  </div>
                )}
              </div>
            )}

            {/* ── Service ── */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Service *</label>
              <div className="relative">
                <select
                  value={serviceId}
                  onChange={e => handleServiceChange(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white
                             appearance-none cursor-pointer focus:outline-none focus:border-gold-500/50"
                >
                  <option value="">Select a service…</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} · NPR {s.price.toLocaleString()} · {s.duration_minutes}min
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
            </div>

            {/* ── Staff ── */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Artist / Staff</label>
              <div className="relative">
                <select
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white
                             appearance-none cursor-pointer focus:outline-none focus:border-gold-500/50"
                >
                  <option value="">Any available</option>
                  {staff.filter(s => !branch || s.branch === branch).map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
              {branch && staff.filter(s => s.branch === branch).length === 0 && (
                <p className="text-[11px] text-amber-500 mt-1">No staff assigned to this branch yet.</p>
              )}
            </div>

            {/* ── Date & Time ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white
                               focus:outline-none focus:border-gold-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Start Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white
                               focus:outline-none focus:border-gold-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* End time preview */}
            {startTime && selectedService && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 -mt-2">
                Ends at {computeEndTime(startTime, selectedService.duration_minutes).replace(':', ':')} ({selectedService.duration_minutes} min)
              </p>
            )}

            {/* ── Amount ── */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Amount (NPR) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white
                             placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50"
                />
              </div>
            </div>

            {/* ── Notes ── */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Client Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special requests from the client…"
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">Staff Notes</label>
              <textarea
                value={staffNotes}
                onChange={e => setStaffNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes visible to staff…"
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50 resize-none"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-neutral-300 text-sm font-medium
                         hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400
                         text-sm font-medium hover:bg-gold-500/20 transition-colors flex items-center justify-center gap-2
                         disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
