import { CalendarCheck, DollarSign, Users, MessageSquare, GraduationCap } from 'lucide-react'
import { getAdminStats } from '@/app/actions/admin'
import { StatCard } from '@/components/admin/StatCard'
import { MiniBarChart } from '@/components/admin/MiniBarChart'
import { AdminBadge } from '@/components/admin/AdminBadge'
import type { BookingStatus } from '@/types/database'

const statusColor: Record<BookingStatus, 'yellow' | 'green' | 'blue' | 'red' | 'gray'> = {
  pending:   'yellow',
  confirmed: 'green',
  completed: 'blue',
  cancelled: 'red',
  no_show:   'gray',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  const totalRev = new Intl.NumberFormat('en-NP').format(stats.totalRevenue)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">Welcome back — here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Bookings"    value={stats.totalBookings}    icon={CalendarCheck}  color="gold"   sub={`${stats.pendingBookings} pending`} />
        <StatCard label="Total Revenue"     value={`NPR ${totalRev}`}      icon={DollarSign}     color="green"  />
        <StatCard label="Enrollments"       value={stats.totalEnrollments} icon={GraduationCap}  color="blue"   sub={`${stats.pendingEnrollments} pending`} />
        <StatCard label="New Inquiries"     value={stats.newInquiries}     icon={MessageSquare}  color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400">Last 6 months</p>
            </div>
            <span className="text-xs text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20">
              NPR {totalRev} total
            </span>
          </div>
          <MiniBarChart
            data={stats.monthlyRevenue.map(m => ({ label: m.month, value: m.revenue }))}
            height={140}
            format="currency"
          />
        </div>

        {/* Booking status donut */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Booking Status</h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-5">All time breakdown</p>
          <div className="space-y-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => {
              const total = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0) || 1
              const pct   = Math.round((count / total) * 100)
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-gray-600 dark:text-neutral-300">{status}</span>
                    <span className="text-gray-400 dark:text-neutral-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-neutral-800">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${pct}%`,
                      backgroundColor: status === 'confirmed' ? '#34d399' : status === 'completed' ? '#60a5fa' : status === 'pending' ? '#fbbf24' : '#f87171',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bookings by month bar */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Bookings Volume</h2>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">Appointments per month</p>
        <MiniBarChart
          data={stats.monthlyRevenue.map(m => ({ label: m.month, value: m.bookings }))}
          height={100}
          color="oklch(0.65 0.15 250)"
        />
      </div>

      {/* Recent bookings */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          <a href="/admin/bookings" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5">
                {['Client', 'Service', 'Date', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 dark:text-neutral-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b: Record<string, unknown>) => {
                const booking = b as {
                  id: string; reference: string; guest_name: string | null
                  booking_date: string; total_amount: number; status: BookingStatus
                  service: { name: string } | null
                  profile: { full_name: string; email: string } | null
                }
                const clientName = booking.profile?.full_name ?? booking.guest_name ?? 'Guest'
                return (
                  <tr key={booking.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-gray-900 dark:text-white text-xs font-medium">{clientName}</p>
                      <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{booking.reference}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-neutral-300 text-xs">{booking.service?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-neutral-300 text-xs">
                      {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-neutral-300 text-xs">
                      NPR {Number(booking.total_amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <AdminBadge label={booking.status} color={statusColor[booking.status]} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
