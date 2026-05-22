import { adminGetUsers } from '@/app/actions/admin'
import { UsersManager } from '@/components/admin/UsersManager'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: rawPage } = await searchParams
  const page = Number(rawPage ?? 1)
  const { users, count } = await adminGetUsers(page)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{count} registered users</p>
        </div>
      </div>
      <UsersManager users={users} total={count} page={page} />
    </div>
  )
}
