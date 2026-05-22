import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth/get-server-user'
import { getUserBookings } from '@/services/booking.service'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from '@/components/dashboard/ProfileClient'
import type { Profile } from '@/types/database'

export const metadata: Metadata = {
  title: 'My Profile — Refined Beauty Hub',
}

export default async function ProfilePage() {
  const user = await getServerUser()
  if (!user) redirect('/login?redirectTo=/profile')

  const supabase = await createClient()
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  const bookingsResult = await getUserBookings(user.id)
  const bookings = bookingsResult.data ?? []

  return (
    <div className="section-py">
      <div className="luxury-container">
        <div className="mb-8">
          <h1 className="text-3xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and view your bookings.
          </p>
        </div>
        <ProfileClient profile={profile} bookings={bookings} userId={user.id} />
      </div>
    </div>
  )
}
