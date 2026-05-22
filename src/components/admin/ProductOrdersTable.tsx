'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Package, ChevronDown } from 'lucide-react'
import { adminUpdateProductOrderStatus } from '@/app/actions/admin'
import { AdminBadge } from './AdminBadge'
import type { ProductOrder, ProductOrderStatus, Product } from '@/types/database'

type OrderWithProduct = ProductOrder & {
  product: Pick<Product, 'name' | 'image_url' | 'category'> | null
}

const STATUS_ORDER: ProductOrderStatus[] = ['pending', 'confirmed', 'ready', 'completed', 'cancelled']

const STATUS_COLOR: Record<ProductOrderStatus, 'gray' | 'blue' | 'gold' | 'green' | 'purple'> = {
  pending:   'gold',
  confirmed: 'blue',
  ready:     'purple',
  completed: 'green',
  cancelled: 'gray',
}

interface Props {
  orders: OrderWithProduct[]
}

export function ProductOrdersTable({ orders }: Props) {
  const router = useRouter()
  const [, start] = useTransition()
  const [updating, setUpdating] = useState<string | null>(null)

  function handleStatusChange(id: string, status: ProductOrderStatus) {
    setUpdating(id)
    start(async () => {
      const { error } = await adminUpdateProductOrderStatus(id, status)
      if (error) toast.error(error)
      else { toast.success('Status updated'); router.refresh() }
      setUpdating(null)
    })
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/5">
              {['Reference', 'Product', 'Customer', 'Qty · Total', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-neutral-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Package className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
                  <p className="text-sm text-gray-400 dark:text-neutral-500">No product orders yet.</p>
                </td>
              </tr>
            )}
            {orders.map(o => (
              <tr key={o.id}
                className={`border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors
                  ${o.status === 'cancelled' ? 'opacity-60' : ''}`}>
                {/* Reference */}
                <td className="px-4 py-3">
                  <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{o.reference}</p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                    {new Date(o.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </td>
                {/* Product */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0 flex items-center justify-center">
                      {o.product?.image_url
                        ? <img src={o.product.image_url} alt="" className="w-full h-full object-cover" />
                        : <Package className="w-4 h-4 text-gray-400 dark:text-neutral-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[180px]">
                        {o.product_name}
                      </p>
                      {o.product?.category && (
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 capitalize">{o.product.category}</p>
                      )}
                    </div>
                  </div>
                </td>
                {/* Customer */}
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{o.customer_name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500">{o.customer_email}</p>
                  {o.customer_phone && (
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500">{o.customer_phone}</p>
                  )}
                </td>
                {/* Qty + Total */}
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-900 dark:text-white font-semibold">× {o.quantity}</p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">NPR {fmt(o.total_amount)}</p>
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <AdminBadge label={o.status} color={STATUS_COLOR[o.status]} />
                    <div className="relative">
                      <select
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={e => handleStatusChange(o.id, e.target.value as ProductOrderStatus)}
                        className="appearance-none bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-neutral-300 text-[10px] rounded-lg pl-2 pr-6 py-1 cursor-pointer transition-colors disabled:opacity-50">
                        {STATUS_ORDER.map(s => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                    </div>
                  </div>
                  {o.notes && (
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500 italic mt-1 line-clamp-1 max-w-[160px]">
                      {o.notes}
                    </p>
                  )}
                </td>
                {/* Date */}
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {new Date(o.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                    {new Date(o.created_at).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
