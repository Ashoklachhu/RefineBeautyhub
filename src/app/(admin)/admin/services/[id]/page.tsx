import { notFound } from 'next/navigation'
import { adminGetServiceById, adminGetCategories } from '@/app/actions/admin'
import { ServiceForm } from '@/components/admin/ServiceForm'

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [service, categories] = await Promise.all([
    adminGetServiceById(id),
    adminGetCategories(),
  ])
  if (!service) notFound()

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Service</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{service.name}</p>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <ServiceForm service={service} categories={categories} mode="edit" />
      </div>
    </div>
  )
}
