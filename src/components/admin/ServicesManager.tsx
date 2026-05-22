'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Edit2, Trash2, Clock, Star, Sparkles, Eye, EyeOff } from 'lucide-react'
import { adminDeleteService, adminUpdateService } from '@/app/actions/admin'
import type { Service } from '@/types/database'

type ServiceRow = Service & { category?: { name: string } | null }

export function ServicesManager({ services }: { services: ServiceRow[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Archive "${name}"? It will be hidden from the public site.`)) return
    setDeleting(id)
    start(async () => {
      const { error } = await adminDeleteService(id)
      if (error) toast.error(error)
      else { toast.success('Service archived'); router.refresh() }
      setDeleting(null)
    })
  }

  async function handleToggle(id: string, current: boolean) {
    start(async () => {
      const { error } = await adminUpdateService(id, { is_active: !current })
      if (error) toast.error(error)
      else { toast.success(current ? 'Service hidden' : 'Service visible'); router.refresh() }
    })
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/5">
              {['Service', 'Category', 'Duration', 'Price', 'Flags', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-neutral-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-neutral-500 text-sm">No services yet.</td></tr>
            )}
            {services.map((s) => (
              <tr key={s.id} className={`border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${!s.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                      {s.image_url
                        ? <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-4 h-4 text-gray-300 dark:text-neutral-600" /></div>}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white text-xs font-medium">{s.name}</p>
                      <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{s.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300 text-xs">{s.category?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-neutral-300 text-xs">
                    <Clock className="w-3 h-3 text-gray-400 dark:text-neutral-500" />{s.duration_minutes} min
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-neutral-200 text-xs font-medium">
                  NPR {s.price.toLocaleString()}
                  {s.price_max && <span className="text-gray-400 dark:text-neutral-500"> – {s.price_max.toLocaleString()}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {s.is_popular  && <span className="px-1.5 py-0.5 rounded text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20">Popular</span>}
                    {s.is_featured && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">Featured</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(s.id, s.is_active)}
                      title={s.is_active ? 'Hide' : 'Show'}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      {s.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <Link href={`/admin/services/${s.id}`}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => handleDelete(s.id, s.name)} disabled={deleting === s.id}
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
  )
}
