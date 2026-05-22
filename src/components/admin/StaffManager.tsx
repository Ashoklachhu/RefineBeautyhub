'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Edit2, Trash2, Star, Eye, EyeOff, User } from 'lucide-react'
import { adminDeleteStaff, adminUpdateStaff } from '@/app/actions/admin'
import type { Staff } from '@/types/database'

export function StaffManager({ staff }: { staff: Staff[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Archive "${name}"?`)) return
    setDeleting(id)
    start(async () => {
      const { error } = await adminDeleteStaff(id)
      if (error) toast.error(error)
      else { toast.success('Staff archived'); router.refresh() }
      setDeleting(null)
    })
  }

  async function handleToggle(id: string, field: 'is_active' | 'is_featured', current: boolean) {
    start(async () => {
      const { error } = await adminUpdateStaff(id, { [field]: !current })
      if (error) toast.error(error)
      else router.refresh()
    })
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.length === 0 && (
        <div className="col-span-full text-center py-16 text-gray-400 dark:text-neutral-500 text-sm">No staff members yet.</div>
      )}
      {staff.map((s) => (
        <div key={s.id} className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 ${!s.is_active ? 'opacity-50' : ''}`}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
              {s.avatar_url
                ? <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><User className="w-5 h-5 text-gray-300 dark:text-neutral-600" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white font-medium text-sm truncate">{s.name}</p>
              <p className="text-gray-500 dark:text-neutral-400 text-xs">{s.role}</p>
              <p className="text-gray-300 dark:text-neutral-600 text-[10px] mt-0.5">{s.experience_years}y experience</p>
            </div>
            {s.is_featured && <Star className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />}
          </div>
          {s.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {s.specialties.slice(0, 3).map((sp, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">{sp}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => handleToggle(s.id, 'is_featured', s.is_featured)}
              title={s.is_featured ? 'Unfeature' : 'Feature'}
              className={`p-1.5 rounded-lg transition-colors ${s.is_featured ? 'bg-gold-500/15 text-gold-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:text-gold-400'}`}>
              <Star className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleToggle(s.id, 'is_active', s.is_active)}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {s.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <Link href={`/admin/staff/${s.id}`}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => handleDelete(s.id, s.name)} disabled={deleting === s.id}
              className="ml-auto p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
