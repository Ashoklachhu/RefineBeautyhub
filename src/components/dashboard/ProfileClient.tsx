'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { User, Calendar, Clock, CheckCircle, XCircle, Loader2, Edit2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile, signOut } from '@/services/auth.service'
import { cancelBookingAction } from '@/app/actions/profile'
import { profileUpdateSchema, type ProfileUpdateValues } from '@/lib/validations'
import type { Profile, BookingWithDetails, BookingStatus } from '@/types/database'

interface ProfileClientProps {
  profile:  Profile | null
  bookings: BookingWithDetails[]
  userId:   string
}

const statusStyles: Record<BookingStatus, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  no_show:   'bg-nude-100 text-nude-600 border-nude-200',
}

const statusDot: Record<BookingStatus, string> = {
  pending:   'bg-yellow-500',
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-400',
  no_show:   'bg-nude-400',
}

export function ProfileClient({ profile, bookings, userId }: ProfileClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'bookings' | 'profile'>('bookings')
  const [editMode, setEditMode] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name:     profile?.full_name ?? '',
      phone:         profile?.phone ?? '',
      date_of_birth: profile?.date_of_birth ?? '',
    },
  })

  async function onProfileSave(values: ProfileUpdateValues) {
    const result = await updateProfile(userId, {
      full_name:     values.full_name,
      phone:         values.phone || null,
      date_of_birth: values.date_of_birth || null,
    })
    if (result.error) { toast.error(result.error.message); return }
    toast.success('Profile updated!')
    setEditMode(false)
    router.refresh()
  }

  async function handleCancel(bookingId: string) {
    setCancellingId(bookingId)
    try {
      const result = await cancelBookingAction(bookingId, userId, 'Cancelled by client')
      if (result.error) { toast.error(result.error); return }
      toast.success('Booking cancelled')
      router.refresh()
    } finally {
      setCancellingId(null)
    }
  }

  async function handleSignOut() {
    startTransition(async () => {
      await signOut()
      router.push('/')
      router.refresh()
    })
  }

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12  = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const upcomingBookings = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status))
  const pastBookings     = bookings.filter((b) => ['completed', 'cancelled', 'no_show'].includes(b.status))

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Avatar + name */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-nude-100 flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              : <User className="w-7 h-7 text-nude-400" />}
          </div>
          <p className="font-medium">{profile?.full_name ?? 'Guest'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>
          <div className="gold-divider mt-4 mb-4" />
          <p className="text-xs text-muted-foreground capitalize">{profile?.role ?? 'client'}</p>
        </div>

        {/* Nav */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {(['bookings', 'profile'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors capitalize border-b last:border-b-0 border-border/50
                ${tab === t ? 'text-gold-600 bg-gold-50/50' : 'text-foreground hover:bg-nude-50'}`}>
              {t === 'bookings' ? 'My Bookings' : 'Profile Settings'}
            </button>
          ))}
          <button onClick={handleSignOut} disabled={isPending}
            className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="lg:col-span-3">
        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="space-y-8">
            {/* Upcoming */}
            <div>
              <h2 className="text-lg font-medium mb-4">Upcoming Appointments</h2>
              {upcomingBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <a href="/booking"
                    className="inline-flex items-center gap-1 mt-3 text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors">
                    Book one now →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((b) => (
                    <div key={b.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-medium text-sm">{b.service?.name}</p>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border font-medium ${statusStyles[b.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[b.status]}`} />
                              {b.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(b.start_time)}
                            </span>
                            {b.staff && <span>{b.staff.name}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">NPR {b.total_amount.toLocaleString()}</span>
                          {['pending', 'confirmed'].includes(b.status) && (
                            <Button variant="outline" size="sm"
                              onClick={() => handleCancel(b.id)}
                              disabled={cancellingId === b.id}
                              className="text-xs h-7 border-red-200 text-red-500 hover:bg-red-50">
                              {cancellingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancel'}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-2">Ref: {b.reference}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-4">Past Appointments</h2>
                <div className="space-y-3">
                  {pastBookings.map((b) => (
                    <div key={b.id} className="rounded-xl border border-border/50 bg-card/60 p-4 opacity-75">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-medium text-sm">{b.service?.name}</p>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border font-medium ${statusStyles[b.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[b.status]}`} />
                              {b.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(b.start_time)}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">NPR {b.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Profile Settings</h2>
              {!editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSubmit(onProfileSave)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...register('full_name')}
                    className={errors.full_name ? 'border-destructive' : ''} />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmitting}
                    className="gold-gradient text-white border-0 hover:opacity-90">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="space-y-5">
                {[
                  { label: 'Full Name',     value: profile?.full_name },
                  { label: 'Email',         value: profile?.email },
                  { label: 'Phone',         value: profile?.phone || '—' },
                  { label: 'Date of Birth', value: profile?.date_of_birth || '—' },
                  { label: 'Member Since',  value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-NP', { month: 'long', year: 'numeric' }) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 last:border-b-0">
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium col-span-2">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
