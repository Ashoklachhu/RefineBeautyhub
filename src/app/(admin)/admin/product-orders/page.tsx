import { adminGetProductOrders } from '@/app/actions/admin'
import { ProductOrdersTable } from '@/components/admin/ProductOrdersTable'
import type { ProductOrderStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function ProductOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const orders = await adminGetProductOrders(status as ProductOrderStatus | undefined)

  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Product Reservations</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
          {orders.length} total · {pendingCount} pending confirmation
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'] as const).map(s => {
          const active = (s === 'all' && !status) || s === status
          return (
            <a key={s} href={s === 'all' ? '/admin/product-orders' : `/admin/product-orders?status=${s}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                active
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
              }`}>
              {s === 'all' ? 'All Orders' : s}
            </a>
          )
        })}
      </div>

      <ProductOrdersTable orders={orders} />
    </div>
  )
}
