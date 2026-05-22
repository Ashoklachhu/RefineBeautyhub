import { StaffForm } from '@/components/admin/StaffForm'

export default function NewStaffPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add Staff Member</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">Add a new team member to the salon.</p>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <StaffForm mode="create" />
      </div>
    </div>
  )
}
