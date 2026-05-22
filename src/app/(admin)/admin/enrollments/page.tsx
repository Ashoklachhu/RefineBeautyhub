import { adminGetEnrollments, adminGetActiveCourses } from '@/app/actions/admin'
import { EnrollmentsTable } from '@/components/admin/EnrollmentsTable'

export const dynamic = 'force-dynamic'

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status: rawStatus, page: rawPage } = await searchParams
  const page   = Number(rawPage ?? 1)
  const status = rawStatus ?? 'all'

  const [{ enrollments, count }, courses] = await Promise.all([
    adminGetEnrollments({ status, page, pageSize: 20 }),
    adminGetActiveCourses(),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Enrollments</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{count} total enrollment{count !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <EnrollmentsTable
        enrollments={enrollments}
        total={count}
        page={page}
        status={status}
        courses={courses}
      />
    </div>
  )
}
