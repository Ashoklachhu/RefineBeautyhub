'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, Package,
  CheckCircle2, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { adminDeleteProduct, adminUpdateProduct } from '@/app/actions/admin'
import { AdminBadge } from './AdminBadge'
import type { Product } from '@/types/database'

const CATEGORY_COLORS: Record<string, 'gray' | 'blue' | 'gold' | 'green' | 'purple'> = {
  hair:      'gold',
  skin:      'green',
  body:      'blue',
  nails:     'purple',
  fragrance: 'gold',
  tools:     'gray',
  other:     'gray',
}

interface Props {
  products: Product[]
}

export function ProductsManager({ products }: Props) {
  const router = useRouter()
  const [, start] = useTransition()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" permanently?`)) return
    setDeleting(id)
    start(async () => {
      const { error } = await adminDeleteProduct(id)
      if (error) toast.error(error)
      else { toast.success('Product deleted'); router.refresh() }
      setDeleting(null)
    })
  }

  async function toggle(id: string, field: 'is_active' | 'is_featured' | 'in_stock', current: boolean) {
    start(async () => {
      const { error } = await adminUpdateProduct(id, { [field]: !current })
      if (error) toast.error(error)
      else router.refresh()
    })
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5">
                {['Product', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <Package className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
                    <p className="text-sm text-gray-400 dark:text-neutral-500">No products yet. Add your first product.</p>
                  </td>
                </tr>
              )}
              {products.map(p => (
                <tr key={p.id}
                  className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0 flex items-center justify-center">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 text-gray-400 dark:text-neutral-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{p.name}</p>
                        {p.expert_note && (
                          <p className="text-[10px] text-gray-400 dark:text-neutral-500 line-clamp-1 italic max-w-[220px]">
                            {p.expert_note}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3">
                    <AdminBadge label={p.category} color={CATEGORY_COLORS[p.category] ?? 'gray'} />
                  </td>
                  {/* Price */}
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">NPR {fmt(p.price)}</p>
                    {p.compare_at_price && (
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500 line-through">
                        NPR {fmt(p.compare_at_price)}
                      </p>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <AdminBadge label={p.is_active ? 'Active' : 'Inactive'} color={p.is_active ? 'green' : 'gray'} />
                      {p.is_featured && <AdminBadge label="Featured" color="gold" />}
                      {!p.in_stock && <AdminBadge label="Out of stock" color="gray" />}
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Edit */}
                      <Link href={`/admin/products/${p.id}`}
                        title="Edit"
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      {/* Toggle active */}
                      <button onClick={() => toggle(p.id, 'is_active', p.is_active)}
                        title={p.is_active ? 'Hide' : 'Show'}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                        {p.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      {/* Toggle featured */}
                      <button onClick={() => toggle(p.id, 'is_featured', p.is_featured)}
                        title={p.is_featured ? 'Unfeature' : 'Feature'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.is_featured
                            ? 'bg-gold-500/15 text-gold-400 hover:bg-gold-500/25'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gold-400'
                        }`}>
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      {/* Toggle stock */}
                      <button onClick={() => toggle(p.id, 'in_stock', p.in_stock)}
                        title={p.in_stock ? 'Mark out of stock' : 'Mark in stock'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.in_stock
                            ? 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}>
                        {p.in_stock
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <XCircle className="w-3.5 h-3.5" />}
                      </button>
                      {/* Delete */}
                      <button onClick={() => handleDelete(p.id, p.name)}
                        disabled={deleting === p.id}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
