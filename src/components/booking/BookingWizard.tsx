'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Clock, Check, ChevronRight, ChevronLeft, Loader2, Calendar,
  User, Sparkles, Phone, Mail, FileText, Star, MapPin, UserCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRANCHES } from '@/constants'
import type { ServiceWithCategory, Staff } from '@/types'
import type { TimeSlotResult } from '@/services/booking.service'
import type { Profile } from '@/types/database'
import {
  fetchStaffAction,
  fetchSlotsAction,
  createBookingAction,
} from '@/app/actions/booking'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface BookingWizardProps {
  services:          ServiceWithCategory[]
  initialServiceId?: string
  userProfile?:      Profile | null
}

interface BookingState {
  branch:      string
  serviceId:   string
  staffId:     string
  date:        string
  time:        string
  guestName:   string
  guestEmail:  string
  guestPhone:  string
  notes:       string
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const STEPS = ['Branch', 'Service', 'Artist', 'Date & Time', 'Details', 'Confirm']

// ─────────────────────────────────────────────────────────────
// Mini custom calendar
// ─────────────────────────────────────────────────────────────

function MiniCalendar({
  selected,
  onSelect,
  minDate,
  maxDate,
}: {
  selected: string
  onSelect: (ymd: string) => void
  minDate:  Date
  maxDate:  Date
}) {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const selDate = selected ? new Date(selected + 'T00:00:00') : null

  // Start viewing current month (or selected month)
  const [view, setView] = useState(() => {
    const d = selDate ?? todayDate
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const { year, month } = view

  // First day of this month grid (pad from Sunday)
  const firstDay   = new Date(year, month, 1)
  const startOffset = firstDay.getDay()           // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build grid: null = blank padding cell
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad tail to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  function canPrev() {
    const prev = new Date(year, month - 1, 1)
    return prev <= new Date(minDate.getFullYear(), minDate.getMonth(), 1)
      ? false
      : true
  }
  function canNext() {
    const next = new Date(year, month + 1, 1)
    return next > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
      ? false
      : true
  }

  function cellState(day: number): 'past' | 'today' | 'selected' | 'future' | 'out-of-range' {
    const d = new Date(year, month, day)
    d.setHours(0, 0, 0, 0)
    if (d < minDate) return 'past'
    if (d > maxDate) return 'out-of-range'
    if (selDate && toYMD(d) === toYMD(selDate)) return 'selected'
    if (toYMD(d) === toYMD(todayDate)) return 'today'
    return 'future'
  }

  return (
    <div className="select-none">
      {/* Month / nav row */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => canPrev() && setView({ year, month: month === 0 ? 11 : month - 1, ...( month === 0 ? { year: year - 1 } : {}) })}
          disabled={!canPrev()}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                     hover:bg-nude-100 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{MONTHS[month]}</p>
          <p className="text-xs text-muted-foreground">{year}</p>
        </div>

        <button
          type="button"
          onClick={() => canNext() && setView({ year, month: month === 11 ? 0 : month + 1, ...( month === 11 ? { year: year + 1 } : {}) })}
          disabled={!canNext()}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground
                     hover:bg-nude-100 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`pad-${idx}`} />
          const state = cellState(day)
          const ymd   = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          return (
            <button
              type="button"
              key={ymd}
              onClick={() => (state !== 'past' && state !== 'out-of-range') && onSelect(ymd)}
              disabled={state === 'past' || state === 'out-of-range'}
              className={`
                mx-auto w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center
                ${state === 'selected'
                  ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-md shadow-gold-500/30 scale-110'
                  : state === 'today'
                    ? 'border-2 border-gold-400 text-gold-600 hover:bg-gold-50'
                    : state === 'future'
                      ? 'text-foreground hover:bg-nude-100 hover:text-foreground'
                      : 'text-muted-foreground/30 cursor-not-allowed'}
              `}
            >
              {day}
              {state === 'today' && (
                <span className="sr-only">(Today)</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-3 h-3 rounded-full border-2 border-gold-400" />
          Today
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gold-400 to-gold-600" />
          Selected
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Time slot picker
// ─────────────────────────────────────────────────────────────

type SlotGroup = { label: string; icon: string; slots: TimeSlotResult[] }

function groupSlots(slots: TimeSlotResult[]): SlotGroup[] {
  const morning:   TimeSlotResult[] = []
  const afternoon: TimeSlotResult[] = []
  const evening:   TimeSlotResult[] = []

  for (const s of slots) {
    const h = parseInt(s.slot_time.split(':')[0], 10)
    if (h < 12)      morning.push(s)
    else if (h < 17) afternoon.push(s)
    else             evening.push(s)
  }

  const groups: SlotGroup[] = []
  if (morning.length)   groups.push({ label: 'Morning',   icon: '🌅', slots: morning })
  if (afternoon.length) groups.push({ label: 'Afternoon', icon: '☀️', slots: afternoon })
  if (evening.length)   groups.push({ label: 'Evening',   icon: '🌆', slots: evening })
  return groups
}

function TimeSlotPicker({
  slots,
  selected,
  onSelect,
  loading,
}: {
  slots:    TimeSlotResult[]
  selected: string
  onSelect: (t: string) => void
  loading:  boolean
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(g => (
          <div key={g}>
            <div className="h-3 w-20 bg-muted rounded animate-pulse mb-3" />
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const available = slots.filter(s => s.is_available)
  if (slots.length > 0 && available.length === 0) {
    return (
      <div className="text-center py-8 rounded-2xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No available slots for this date.</p>
        <p className="text-xs text-muted-foreground mt-1">Try selecting another date.</p>
      </div>
    )
  }

  const groups = groupSlots(slots)
  const availableCount = available.length

  return (
    <div className="space-y-5">
      {/* Summary */}
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{availableCount}</span> slot{availableCount !== 1 ? 's' : ''} available
      </p>

      {groups.map(group => (
        <div key={group.label}>
          {/* Group header */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-sm">{group.icon}</span>
            <span className="text-xs font-semibold text-foreground">{group.label}</span>
            <span className="text-xs text-muted-foreground">
              ({group.slots.filter(s => s.is_available).length} available)
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Slot pills */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {group.slots.map(s => {
              const isSelected = selected === s.slot_time
              const isAvail    = s.is_available
              return (
                <button
                  key={s.slot_time}
                  type="button"
                  onClick={() => isAvail && onSelect(s.slot_time)}
                  disabled={!isAvail}
                  title={!isAvail ? 'Not available' : undefined}
                  className={`
                    relative h-10 rounded-xl text-xs font-semibold transition-all duration-150
                    flex items-center justify-center
                    ${isSelected
                      ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-lg shadow-gold-500/25 scale-105 border-transparent'
                      : isAvail
                        ? 'border border-border bg-background hover:border-gold-400/60 hover:bg-gold-50/50 hover:text-gold-700 text-foreground'
                        : 'border border-border/50 bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through'}
                  `}
                >
                  {fmt12(s.slot_time)}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                      <Check className="w-2 h-2 text-gold-600" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Step progress bar
// ─────────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                ${i < step
                  ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-md shadow-gold-500/20'
                  : i === step
                    ? 'bg-white border-2 border-gold-500 text-gold-600 shadow-sm'
                    : 'bg-nude-100 text-nude-400 border border-nude-200'}
              `}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-[10px] font-medium tracking-wide transition-colors ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${i < step ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-nude-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Confirm summary row
// ─────────────────────────────────────────────────────────────

function SummaryRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gold-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main wizard
// ─────────────────────────────────────────────────────────────

export function BookingWizard({ services, initialServiceId, userProfile }: BookingWizardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Is the visitor logged in with a profile?
  const isLoggedIn = !!userProfile

  const [step, setStep] = useState(0)
  const [state, setState] = useState<BookingState>({
    branch:     '',
    serviceId:  initialServiceId ?? '',
    staffId:    '',
    date:       '',
    time:       '',
    // Pre-fill contact details from profile if logged in
    guestName:  userProfile?.full_name  ?? '',
    guestEmail: userProfile?.email      ?? '',
    guestPhone: userProfile?.phone      ?? '',
    notes:      '',
  })

  const [staff,        setStaff]        = useState<Staff[]>([])
  const [slots,        setSlots]        = useState<TimeSlotResult[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const selectedService = services.find(s => s.id === state.serviceId)
  const selectedStaff   = staff.find(s => s.id === state.staffId)

  // Date bounds
  const today   = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const maxDate = useMemo(() => new Date(Date.now() + 60 * 86400_000), [])

  function update<K extends keyof BookingState>(key: K, value: BookingState[K]) {
    setState(prev => ({ ...prev, [key]: value }))
  }

  function goToStep1(branchId: string) {
    update('branch', branchId)
    // If service already pre-selected (from service page), skip to artist step
    if (initialServiceId) {
      setLoadingStaff(true)
      fetchStaffAction(branchId).then(list => { setStaff(list); setLoadingStaff(false) })
      setStep(2)
    } else {
      setStep(1)
    }
  }

  async function goToStep2(serviceId: string) {
    update('serviceId', serviceId)
    setLoadingStaff(true)
    try {
      const list = await fetchStaffAction(state.branch)
      setStaff(list)
    } finally {
      setLoadingStaff(false)
    }
    setStep(2)
  }

  function goToStep3(staffId: string) {
    update('staffId', staffId)
    setStep(3)
  }

  async function handleDateSelect(ymd: string) {
    update('date', ymd)
    update('time', '')
    if (!selectedService) return
    setLoadingSlots(true)
    try {
      const available = await fetchSlotsAction(state.staffId, ymd, selectedService.duration_minutes)
      setSlots(available)
    } finally {
      setLoadingSlots(false)
    }
    // No step change here — user picks time on same step
  }

  function handleTimeSelect(time: string) {
    update('time', time)
  }

  async function submitBooking() {
    if (!selectedService) return
    startTransition(async () => {
      const result = await createBookingAction(
        {
          branch:      state.branch,
          serviceId:   state.serviceId,
          staffId:     state.staffId || undefined,
          bookingDate: state.date,
          startTime:   state.time,
          guestName:   state.guestName  || undefined,
          guestEmail:  state.guestEmail || undefined,
          guestPhone:  state.guestPhone || undefined,
          notes:       state.notes      || undefined,
        },
        selectedService.duration_minutes,
        selectedService.price
      )
      if (result.error) { toast.error(result.error); return }
      router.push(`/booking/confirmation/${result.reference}`)
    })
  }

  // Formatted selected date for display
  const formattedDate = state.date
    ? new Date(state.date + 'T00:00:00').toLocaleDateString('en-NP', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <div className="max-w-2xl mx-auto">
      <StepBar step={step} />

      {/* ──────────── Step 0: Branch ──────────── */}
      {step === 0 && (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Choose Your Branch
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Select which location you&apos;d like to visit.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {BRANCHES.map(b => (
              <button
                key={b.id}
                onClick={() => goToStep1(b.id)}
                className={`text-left p-6 rounded-2xl border transition-all duration-200 group
                  ${state.branch === b.id
                    ? 'border-gold-500 bg-gold-50/60 shadow-md shadow-gold-500/10'
                    : 'border-border bg-card hover:border-gold-400/50 hover:shadow-md hover:shadow-gold-500/5'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-gold-500" />
                </div>
                <p className="font-semibold text-foreground text-base mb-1">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.address}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-gold-600 font-medium group-hover:gap-2 transition-all">
                  Select <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ──────────── Step 1: Service ──────────── */}
      {step === 1 && (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Choose a Service
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Select the treatment you&apos;d like to book.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map(s => (
              <button
                key={s.id}
                onClick={() => goToStep2(s.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 group
                  ${state.serviceId === s.id
                    ? 'border-gold-500 bg-gold-50/60 shadow-md shadow-gold-500/10'
                    : 'border-border bg-card hover:border-gold-400/50 hover:shadow-md hover:shadow-gold-500/5'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="font-semibold text-foreground text-sm leading-snug">{s.name}</p>
                  {s.is_popular && (
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-600 text-[10px] font-semibold">
                      Popular
                    </span>
                  )}
                </div>
                {s.short_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{s.short_description}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {s.duration_minutes} min
                  </span>
                  {s.discounted_price ? (
                    <span className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="flex items-baseline gap-1">
                        <span className="font-semibold text-foreground">NPR {s.discounted_price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground line-through">NPR {s.price.toLocaleString()}</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        {Math.round((1 - s.discounted_price / s.price) * 100)}% OFF
                      </span>
                    </span>
                  ) : (
                    <span className="font-semibold text-foreground">NPR {s.price.toLocaleString()}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ──────────── Step 2: Artist ──────────── */}
      {step === 2 && (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Choose Your Artist
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Prefer someone specific, or let us match you.</p>
          </div>

          {loadingStaff ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-6 h-6 animate-spin text-gold-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading artists…</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Any artist option */}
              <button
                onClick={() => goToStep3('')}
                className="w-full text-left p-4 rounded-2xl border border-dashed border-border hover:border-gold-400 hover:bg-gold-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-nude-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Any Available Artist</p>
                    <p className="text-xs text-muted-foreground mt-0.5">We&apos;ll match you with the best available</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-gold-500 transition-colors" />
                </div>
              </button>

              {/* Individual artists */}
              {staff.map(s => (
                <button
                  key={s.id}
                  onClick={() => goToStep3(s.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group
                    ${state.staffId === s.id
                      ? 'border-gold-500 bg-gold-50/60 shadow-md shadow-gold-500/10'
                      : 'border-border bg-card hover:border-gold-400/50 hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-nude-100 flex-shrink-0 ring-2 ring-transparent group-hover:ring-gold-300 transition-all">
                      {s.avatar_url
                        ? <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-base font-semibold text-nude-500">
                            {s.name.charAt(0)}
                          </div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: Math.min(5, s.experience_years) }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-0.5">{s.experience_years}y exp</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold-500 transition-colors" />
                  </div>
                  {s.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pl-[60px]">
                      {s.specialties.slice(0, 3).map(sp => (
                        <span key={sp} className="px-2 py-0.5 rounded-full bg-nude-100 text-nude-600 text-[10px]">{sp}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => setStep(1)} className="mt-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-3 h-3" /> Back to services
          </button>
        </div>
      )}

      {/* ──────────── Step 3: Date & Time ──────────── */}
      {step === 3 && (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Pick a Date & Time
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedService?.name}
              {selectedStaff && <> · {selectedStaff.name}</>}
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
            {/* Calendar column */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-semibold text-foreground">Select Date</span>
              </div>
              <MiniCalendar
                selected={state.date}
                onSelect={handleDateSelect}
                minDate={today}
                maxDate={maxDate}
              />
            </div>

            {/* Time slots column */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-gold-500" />
                <span className="text-sm font-semibold text-foreground">Select Time</span>
                {state.date && (
                  <span className="ml-auto text-[11px] text-muted-foreground font-medium">{formattedDate}</span>
                )}
              </div>

              {!state.date ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-nude-100 flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-nude-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pick a date first</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Available slots will appear here</p>
                </div>
              ) : (
                <TimeSlotPicker
                  slots={slots}
                  selected={state.time}
                  onSelect={handleTimeSelect}
                  loading={loadingSlots}
                />
              )}
            </div>
          </div>

          {/* Proceed CTA */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
            <Button
              onClick={() => setStep(4)}
              disabled={!state.date || !state.time}
              className="gold-gradient text-white border-0 hover:opacity-90 disabled:opacity-40"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Selected summary chip */}
          {state.date && state.time && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20">
                <Check className="w-3.5 h-3.5 text-gold-500" />
                <span className="text-xs font-medium text-gold-700">
                  {formattedDate} at {fmt12(state.time)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────── Step 4: Details ──────────── */}
      {step === 4 && (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Your Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoggedIn ? 'Confirm your contact details for this booking.' : 'No account needed — just fill in your details below.'}
            </p>
          </div>

          {/* Signed-in banner */}
          {isLoggedIn && (
            <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <UserCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-800">Signed in as {userProfile!.full_name || userProfile!.email}</p>
                <p className="text-[11px] text-emerald-600">Your profile details are pre-filled. You can edit them if needed.</p>
              </div>
            </div>
          )}

          {/* Guest soft nudge — only for guests */}
          {!isLoggedIn && (
            <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-nude-50 border border-nude-200">
              <UserCircle2 className="w-4 h-4 text-nude-500 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Have an account?{' '}
                <a href={`/login?redirect=/booking`} className="text-gold-600 hover:text-gold-700 font-medium transition-colors">Sign in</a>
                {' '}to book faster with your saved details.
              </p>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider" htmlFor="guestName">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="guestName"
                  value={state.guestName}
                  onChange={e => update('guestName', e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400
                             placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider" htmlFor="guestEmail">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="guestEmail"
                  type="email"
                  value={state.guestEmail}
                  onChange={e => update('guestEmail', e.target.value)}
                  placeholder="you@email.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400
                             placeholder:text-muted-foreground transition-all"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Your confirmation will be sent here.</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider" htmlFor="guestPhone">
                Phone Number <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="guestPhone"
                  type="tel"
                  value={state.guestPhone}
                  onChange={e => update('guestPhone', e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400
                             placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider" htmlFor="notes">
                Special Requests <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <textarea
                  id="notes"
                  value={state.notes}
                  onChange={e => update('notes', e.target.value)}
                  rows={3}
                  placeholder="Any allergies, preferences, or special requests…"
                  className="w-full pl-10 pr-4 pt-2.5 pb-2.5 rounded-xl border border-input bg-background text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400
                             placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
            <Button
              onClick={() => setStep(5)}
              disabled={!state.guestName || !state.guestEmail}
              className="gold-gradient text-white border-0 hover:opacity-90 disabled:opacity-40"
            >
              Review Booking
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ──────────── Step 5: Confirm ──────────── */}
      {step === 5 && (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-light text-foreground" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Confirm Your Booking
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Review everything before we lock it in.</p>
          </div>

          {/* Summary card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            {/* Gold header strip */}
            <div className="h-1.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />

            <div className="p-6 divide-y divide-border/50">
              <SummaryRow icon={MapPin} label="Branch">
                <p className="font-semibold text-foreground">
                  {BRANCHES.find(b => b.id === state.branch)?.name ?? state.branch}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {BRANCHES.find(b => b.id === state.branch)?.address}
                </p>
              </SummaryRow>

              <SummaryRow icon={Sparkles} label="Service">
                <p className="font-semibold text-foreground">{selectedService?.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedService?.duration_minutes} min ·{' '}
                  {selectedService?.discounted_price ? (
                    <>
                      <span className="font-medium text-foreground">NPR {selectedService.discounted_price.toLocaleString()}</span>
                      <span className="line-through ml-1">NPR {selectedService.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="font-medium text-foreground">NPR {selectedService?.price.toLocaleString()}</span>
                  )}
                </p>
              </SummaryRow>

              {selectedStaff && (
                <SummaryRow icon={User} label="Artist">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-nude-100 flex-shrink-0">
                      {selectedStaff.avatar_url
                        ? <img src={selectedStaff.avatar_url} alt={selectedStaff.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xs font-medium text-nude-500">{selectedStaff.name.charAt(0)}</div>}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedStaff.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedStaff.role}</p>
                    </div>
                  </div>
                </SummaryRow>
              )}

              <SummaryRow icon={Calendar} label="Date & Time">
                <p className="font-semibold text-foreground">{formattedDate}</p>
                <p className="text-sm text-muted-foreground mt-0.5">at {fmt12(state.time)}</p>
              </SummaryRow>

              <SummaryRow icon={User} label="Contact">
                <p className="font-semibold text-foreground">{state.guestName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{state.guestEmail}</p>
                {state.guestPhone && <p className="text-sm text-muted-foreground">{state.guestPhone}</p>}
              </SummaryRow>

              {state.notes && (
                <SummaryRow icon={FileText} label="Notes">
                  <p className="text-sm text-foreground">{state.notes}</p>
                </SummaryRow>
              )}
            </div>

            {/* Total footer */}
            <div className="px-6 py-4 bg-gold-50/50 border-t border-gold-200/50 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              {selectedService?.discounted_price ? (
                <span className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold text-foreground">NPR {selectedService.discounted_price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground line-through">NPR {selectedService.price.toLocaleString()}</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                    {Math.round((1 - selectedService.discounted_price / selectedService.price) * 100)}% OFF
                  </span>
                </span>
              ) : (
                <span className="text-lg font-semibold text-foreground">NPR {selectedService?.price.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Policy note */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            By confirming, you agree to our cancellation policy. A confirmation email will be sent to <span className="font-medium text-foreground">{state.guestEmail}</span>.
          </p>

          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setStep(4)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-3 h-3" /> Edit Details
            </button>
            <Button
              onClick={submitBooking}
              disabled={isPending}
              className="gold-gradient text-white border-0 hover:opacity-90 px-8 h-11 text-sm font-semibold"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Confirming…</>
                : <>Confirm Booking <Check className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
