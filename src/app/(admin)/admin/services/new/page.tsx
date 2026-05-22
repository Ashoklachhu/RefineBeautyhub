import { adminGetCategories } from '@/app/actions/admin'
import { ServiceForm } from '@/components/admin/ServiceForm'

export default async function NewServicePage() {
  const categories = await adminGetCategories()
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">New Service</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">Add a new treatment to the menu.</p>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <ServiceForm categories={categories} mode="create" />
      </div>
    </div>
  )
}
