import { adminGetBookings, adminGetActiveServices, adminGetActiveStaff } from '@/app/actions/admin'
import { BookingsTable } from '@/components/admin/BookingsTable'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; branch?: string }>
}) {
  const { status: rawStatus, page: rawPage, branch: rawBranch } = await searchParams
  const page   = Number(rawPage ?? 1)
  const status = rawStatus ?? 'all'
  const branch = rawBranch ?? 'all'

  const [{ bookings, count }, services, staff] = await Promise.all([
    adminGetBookings({ status, page, pageSize: 20, branch: branch !== 'all' ? branch : undefined }),
    adminGetActiveServices(),
    adminGetActiveStaff(),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{count} total appointments</p>
        </div>
      </div>
      <BookingsTable
        bookings={bookings}
        total={count}
        page={page}
        status={status}
        branch={branch}
        services={services}
        staff={staff}
      />
    </div>
  )
}
