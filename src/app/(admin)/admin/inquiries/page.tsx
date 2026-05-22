import Link from 'next/link'
import { adminGetInquiries } from '@/app/actions/admin'
import { InquiriesTable } from '@/components/admin/InquiriesTable'

export const dynamic = 'force-dynamic'

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; page?: string }>
}) {
  const { status = 'all', priority = 'all', page: rawPage } = await searchParams
  const page = Number(rawPage ?? 1)

  const { inquiries, count } = await adminGetInquiries({ status, priority, page, pageSize: 25 })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Inquiries</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{count} total · mini-CRM for all contact submissions</p>
        </div>
      </div>
      <InquiriesTable inquiries={inquiries} total={count} page={page} status={status} priority={priority} />
    </div>
  )
}
