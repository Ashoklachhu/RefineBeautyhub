import Link from 'next/link'
import { Plus } from 'lucide-react'
import { adminGetServices } from '@/app/actions/admin'
import { ServicesManager } from '@/components/admin/ServicesManager'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const { services } = await adminGetServices()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Services</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{services.length} services</p>
        </div>
        <Link href="/admin/services/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Service
        </Link>
      </div>
      <ServicesManager services={services} />
    </div>
  )
}
