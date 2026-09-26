import { adminGetLeads } from '@/app/actions/admin'
import { LeadsTable } from '@/components/admin/LeadsTable'

export const dynamic = 'force-dynamic'

export default async function AdminLeadsPage() {
  const { leads, count, error } = await adminGetLeads()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chatbot Leads</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
          {error ? 'Captured by the Kuro assistant' : `${count} captured by the Kuro assistant`}
        </p>
      </div>
      <LeadsTable leads={leads} error={error} />
    </div>
  )
}
