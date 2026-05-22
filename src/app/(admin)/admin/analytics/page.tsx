import { getAnalyticsReport } from '@/app/actions/admin'
import { AnalyticsFilters }   from '@/components/admin/AnalyticsFilters'
import { TrendChart }          from '@/components/admin/TrendChart'
import { MetricCard }          from '@/components/admin/MetricCard'
import {
  DollarSign, CalendarCheck, ShoppingBag, GraduationCap,
  Users, MessageSquare, Scissors, TrendingUp,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

function todayISO()      { return new Date().toISOString().slice(0, 10) }
function daysAgoISO(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10)
}

const fmt  = (n: number) => new Intl.NumberFormat('en-NP').format(Math.round(n))
const fmtK = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 100_000)   return `${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(Math.round(n))
}

const STATUS_COLORS: Record<string, string> = {
  pending:   '#fbbf24',
  confirmed: '#60a5fa',
  completed: '#34d399',
  cancelled: '#f87171',
  ready:     '#a78bfa',
  new:       '#60a5fa',
  resolved:  '#34d399',
  closed:    '#9ca3af',
  active:    '#34d399',
  enrolled:  '#60a5fa',
  graduated: '#a78bfa',
  withdrawn: '#f87171',
}

function StatusBreakdown({
  title, statuses, total,
}: { title: string; statuses: Record<string, number>; total: number }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {Object.keys(statuses).length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-neutral-500">No data for this period.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(statuses)
            .sort(([, a], [, b]) => b - a)
            .map(([status, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const color = STATUS_COLORS[status] ?? '#9ca3af'
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize text-gray-600 dark:text-neutral-300">{status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{count}</span>
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500 w-7 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const { from: rawFrom, to: rawTo } = await searchParams

  const to   = rawTo   || todayISO()
  const from = rawFrom || daysAgoISO(29)

  const r = await getAnalyticsReport(from, to)

  const periodLabel = r.period.days === 1
    ? `${from}`
    : `${from} → ${to} (${r.period.days} days)`

  // Build chart data arrays
  const labels           = r.chartData.map(d => d.label)
  const bookingRevSeries = r.chartData.map(d => d.bookingRevenue)
  const shopRevSeries    = r.chartData.map(d => d.shopRevenue)
  const bookingCntSeries = r.chartData.map(d => d.bookingCount)
  const shopCntSeries    = r.chartData.map(d => d.shopCount)
  const enrollCntSeries  = r.chartData.map(d => d.enrollmentCount)
  const usersSeries      = r.chartData.map(d => d.newUsers)

  const totalBkStatuses = Object.values(r.bookingStatuses).reduce((a, b) => a + b, 0)
  const totalSoStatuses = Object.values(r.shopStatuses).reduce((a, b) => a + b, 0)
  const totalEnStatuses = Object.values(r.enrollmentStatuses).reduce((a, b) => a + b, 0)
  const totalIqStatuses = Object.values(r.inquiryStatuses).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{periodLabel}</p>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters currentFrom={from} currentTo={to} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`NPR ${fmtK(r.totalRevenue)}`}
          subtitle={`NPR ${fmt(r.totalRevenue)}`}
          current={r.totalRevenue}
          prev={r.prevRevenue}
          icon={DollarSign}
          color="gold"
        />
        <MetricCard
          label="Bookings"
          value={r.totalBookings}
          current={r.totalBookings}
          prev={r.prevBookings}
          icon={CalendarCheck}
          color="blue"
          subtitle={`NPR ${fmtK(r.totalBookingRevenue)} revenue`}
        />
        <MetricCard
          label="Shop Orders"
          value={r.totalShopOrders}
          current={r.totalShopOrders}
          prev={r.prevShopOrders}
          icon={ShoppingBag}
          color="purple"
          subtitle={`NPR ${fmtK(r.totalShopRevenue)} revenue`}
        />
        <MetricCard
          label="Enrollments"
          value={r.totalEnrollments}
          current={r.totalEnrollments}
          prev={r.prevEnrollments}
          icon={GraduationCap}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="New Users"
          value={r.totalNewUsers}
          current={r.totalNewUsers}
          prev={r.prevNewUsers}
          icon={Users}
          color="green"
        />
        <MetricCard
          label="Inquiries"
          value={r.totalInquiries}
          icon={MessageSquare}
          color="blue"
        />
        <MetricCard
          label="Booking Revenue"
          value={`NPR ${fmtK(r.totalBookingRevenue)}`}
          current={r.totalBookingRevenue}
          prev={r.prevBookingRevenue}
          icon={TrendingUp}
          color="gold"
        />
        <MetricCard
          label="Shop Revenue"
          value={`NPR ${fmtK(r.totalShopRevenue)}`}
          current={r.totalShopRevenue}
          prev={r.prevShopRevenue}
          icon={ShoppingBag}
          color="purple"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Booking + shop revenue over time (NPR)
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              NPR {fmt(r.totalRevenue)}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500">total this period</p>
          </div>
        </div>
        <div className="mt-4">
          <TrendChart
            labels={labels}
            height={220}
            series={[
              { label: 'Booking Revenue', color: 'oklch(0.78 0.13 72)',  data: bookingRevSeries, format: 'currency' },
              { label: 'Shop Revenue',    color: 'oklch(0.65 0.15 290)', data: shopRevSeries,    format: 'currency' },
            ]}
          />
        </div>
      </div>

      {/* Volume Trend Chart */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
        <div className="mb-1">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Activity Volume</h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
            Bookings, shop orders, and enrollments over time
          </p>
        </div>
        <div className="mt-4">
          <TrendChart
            labels={labels}
            height={200}
            series={[
              { label: 'Bookings',    color: 'oklch(0.65 0.15 250)', data: bookingCntSeries },
              { label: 'Shop Orders', color: 'oklch(0.65 0.15 290)', data: shopCntSeries    },
              { label: 'Enrollments', color: 'oklch(0.65 0.18 350)', data: enrollCntSeries  },
            ]}
          />
        </div>
      </div>

      {/* User Growth + Top Services */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Top Services */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Services</h3>
            <span className="ml-auto text-[10px] text-gray-400 dark:text-neutral-500">by completed revenue</span>
          </div>
          {r.topServices.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-neutral-500">No completed bookings this period.</p>
          ) : (
            <div className="space-y-2">
              {r.topServices.map((svc, i) => {
                const maxRev = r.topServices[0].revenue || 1
                const pct = Math.round((svc.revenue / maxRev) * 100)
                return (
                  <div key={svc.name} className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 dark:text-neutral-500 w-4 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-gray-700 dark:text-neutral-200 truncate">{svc.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-[10px] text-gray-400 dark:text-neutral-500">{svc.count}×</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            NPR {fmtK(svc.revenue)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gold-400/70 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* New Users trend */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Registrations</h3>
            <span className="ml-auto">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{r.totalNewUsers}</span>
              <span className="text-xs text-gray-400 dark:text-neutral-500 ml-1">users</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">User sign-ups over the period</p>
          <TrendChart
            labels={labels}
            height={160}
            series={[
              { label: 'New Users', color: 'oklch(0.65 0.18 160)', data: usersSeries },
            ]}
          />
        </div>
      </div>

      {/* Status Breakdowns */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatusBreakdown title="Booking Statuses"     statuses={r.bookingStatuses}    total={totalBkStatuses} />
        <StatusBreakdown title="Shop Order Statuses"  statuses={r.shopStatuses}       total={totalSoStatuses} />
        <StatusBreakdown title="Enrollment Statuses"  statuses={r.enrollmentStatuses} total={totalEnStatuses} />
        <StatusBreakdown title="Inquiry Statuses"     statuses={r.inquiryStatuses}    total={totalIqStatuses} />
      </div>

    </div>
  )
}
