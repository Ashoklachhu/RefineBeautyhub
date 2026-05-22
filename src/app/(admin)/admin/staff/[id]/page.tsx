import { notFound } from 'next/navigation'
import { adminGetStaffById } from '@/app/actions/admin'
import { StaffForm } from '@/components/admin/StaffForm'

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const staff = await adminGetStaffById(id)
  if (!staff) notFound()

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Staff Member</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{staff.name}</p>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <StaffForm staff={staff} mode="edit" />
      </div>
    </div>
  )
}
