'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  X, User, Mail, Phone, Calendar, Shield, ShieldCheck,
  Save, Loader2, BookOpen, DollarSign, Hash, Edit2,
} from 'lucide-react'
import { AdminBadge } from './AdminBadge'
import {
  adminUpdateUserProfile,
  adminUpdateUserRole,
  adminToggleUserActive,
  adminGetUserWithBookings,
} from '@/app/actions/admin'
import type { Profile, UserRole, BookingStatus } from '@/types/database'

const roleColor: Record<UserRole, 'gray' | 'blue' | 'gold'> = {
  client: 'gray', staff: 'blue', admin: 'gold',
}

const bookingStatusColor: Record<BookingStatus, string> = {
  pending:   'text-yellow-400',
  confirmed: 'text-emerald-400',
  completed: 'text-blue-400',
  cancelled: 'text-rose-400',
  no_show:   'text-neutral-500',
}

type BookingSnippet = {
  id: string
  reference: string
  booking_date: string
  total_amount: number
  status: BookingStatus
  service: { name: string } | null
}

interface Props {
  user:    Profile
  onClose: () => void
}

export function UserDetailPanel({ user: initial, onClose }: Props) {
  const router = useRouter()
  const [, start] = useTransition()

  const [user, setUser]         = useState(initial)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const [bookings, setBookings] = useState<BookingSnippet[]>([])
  const [bookingsLoaded, setBookingsLoaded] = useState(false)

  const [form, setForm] = useState({
    full_name: initial.full_name,
    phone:     initial.phone ?? '',
    notes:     initial.notes ?? '',
  })

  // Reload if parent changes
  useEffect(() => {
    setUser(initial)
    setForm({ full_name: initial.full_name, phone: initial.phone ?? '', notes: initial.notes ?? '' })
  }, [initial])

  // Lazy-load booking history
  const loadBookings = useCallback(async () => {
    if (bookingsLoaded || !initial.id) return
    setLoading(true)
    const result = await adminGetUserWithBookings(initial.id)
    setBookings(result.bookings as BookingSnippet[])
    setBookingsLoaded(true)
    setLoading(false)
  }, [initial.id, bookingsLoaded])

  useEffect(() => { loadBookings() }, [loadBookings])

  async function handleSaveProfile() {
    setSaving(true)
    const { error } = await adminUpdateUserProfile(user.id, {
      full_name: form.full_name,
      phone:     form.phone || undefined,
      notes:     form.notes || undefined,
    })
    if (error) toast.error(error)
    else {
      toast.success('Profile updated')
      setUser(u => ({ ...u, ...form }))
      setEditing(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleRoleChange(role: UserRole) {
    if (!confirm(`Change role to "${role}"?`)) return
    start(async () => {
      const { error } = await adminUpdateUserRole(user.id, role)
      if (error) toast.error(error)
      else { setUser(u => ({ ...u, role })); router.refresh() }
    })
  }

  async function handleToggleActive() {
    start(async () => {
      const { error } = await adminToggleUserActive(user.id, !user.is_active)
      if (error) toast.error(error)
      else { setUser(u => ({ ...u, is_active: !u.is_active })); router.refresh() }
    })
  }

  const totalSpent  = bookings
    .filter(b => b.status === 'completed')
    .reduce((s, b) => s + Number(b.total_amount), 0)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-white/10
                      shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          <h2 className="text-gray-900 dark:text-white font-semibold">User Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(e => !e)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${editing
                  ? 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white'
                  : 'bg-gold-500/10 border border-gold-500/20 text-gold-400 hover:bg-gold-500/15'}`}
            >
              <Edit2 className="w-3 h-3" />
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400
                         hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Profile card */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  : <User className="w-6 h-6 text-gray-400 dark:text-neutral-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white font-semibold text-base truncate">{user.full_name}</p>
                <p className="text-gray-500 dark:text-neutral-400 text-xs truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <AdminBadge label={user.role}                color={roleColor[user.role]} />
                  <AdminBadge label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'green' : 'red'} />
                </div>
              </div>
            </div>

            {/* Read-only info when not editing */}
            {!editing && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-white/5">
                <InfoRow icon={Mail}     label="Email"   value={user.email} />
                <InfoRow icon={Phone}    label="Phone"   value={user.phone ?? '—'} />
                <InfoRow icon={Calendar} label="Joined"  value={new Date(user.created_at).toLocaleDateString('en-NP', { month: 'long', day: 'numeric', year: 'numeric' })} />
                {user.date_of_birth && (
                  <InfoRow icon={Calendar} label="DOB" value={user.date_of_birth} />
                )}
                {user.notes && (
                  <div className="pt-1">
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500 mb-0.5">Notes</p>
                    <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">{user.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit form */}
            {editing && (
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-white/5">
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 dark:text-neutral-400">Full Name</label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2
                               text-xs text-gray-900 dark:text-neutral-200 focus:outline-none focus:border-gold-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 dark:text-neutral-400">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+977-98XXXXXXXX"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2
                               text-xs text-gray-900 dark:text-neutral-200 focus:outline-none focus:border-gold-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 dark:text-neutral-400">Internal Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Notes visible only to admin…"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2
                               text-xs text-gray-900 dark:text-neutral-200 resize-none focus:outline-none focus:border-gold-500/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/15 border border-gold-500/30
                             text-gold-400 hover:bg-gold-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            )}
          </section>

          {/* Access control */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Access Control</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] text-gray-500 dark:text-neutral-400">Role</label>
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(e.target.value as UserRole)}
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2
                             text-xs text-gray-900 dark:text-neutral-200 focus:outline-none focus:border-gold-500/50 transition-colors"
                >
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[11px] text-gray-500 dark:text-neutral-400">Account Status</label>
                <button
                  onClick={handleToggleActive}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-medium transition-colors
                    ${user.is_active
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}
                >
                  {user.is_active ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          {bookingsLoaded && (
            <section className="grid grid-cols-3 gap-3">
              <StatTile icon={BookOpen}   label="Bookings"    value={String(bookings.length)} />
              <StatTile icon={DollarSign} label="Total Spent" value={`NPR ${totalSpent.toLocaleString()}`} small />
              <StatTile icon={Hash}       label="Completed"   value={String(bookings.filter(b => b.status === 'completed').length)} />
            </section>
          )}

          {/* Booking history */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Booking History</h3>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-gray-400 dark:text-neutral-500 animate-spin" />
              </div>
            )}

            {!loading && bookings.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 text-center py-4">No bookings yet.</p>
            )}

            {!loading && bookings.length > 0 && (
              <div className="space-y-2">
                {bookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/5 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-neutral-200 truncate">{b.service?.name ?? 'Unknown Service'}</p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">{b.reference}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className={`text-[10px] font-medium capitalize ${bookingStatusColor[b.status]}`}>
                        {b.status}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                        {new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  )
}

// ── Tiny helpers ──────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
      <span className="text-[10px] text-gray-400 dark:text-neutral-500 w-12 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-700 dark:text-neutral-200 break-all">{value}</span>
    </div>
  )
}

function StatTile({ icon: Icon, label, value, small }: { icon: React.ElementType; label: string; value: string; small?: boolean }) {
  return (
    <div className="bg-gray-100 dark:bg-neutral-800/60 rounded-xl p-3 text-center">
      <Icon className="w-4 h-4 text-gold-400 mx-auto mb-1" />
      <p className={`text-gray-900 dark:text-white font-semibold ${small ? 'text-[11px]' : 'text-base'}`}>{value}</p>
      <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{label}</p>
    </div>
  )
}
