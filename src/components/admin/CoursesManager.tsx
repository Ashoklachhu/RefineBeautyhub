'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Edit2, Trash2, Users, Award, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { adminDeleteCourse, adminUpdateCourse } from '@/app/actions/admin'
import { AdminBadge } from './AdminBadge'
import type { AcademyCourse, CourseLevel } from '@/types/database'

const levelColor: Record<CourseLevel, 'green' | 'blue' | 'purple' | 'gold'> = {
  beginner: 'green', intermediate: 'blue', advanced: 'purple', professional: 'gold',
}

export function CoursesManager({ courses }: { courses: AcademyCourse[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Archive "${title}"?`)) return
    setDeleting(id)
    start(async () => {
      const { error } = await adminDeleteCourse(id)
      if (error) toast.error(error)
      else { toast.success('Course archived'); router.refresh() }
      setDeleting(null)
    })
  }

  async function handleToggle(id: string, current: boolean) {
    start(async () => {
      const { error } = await adminUpdateCourse(id, { is_active: !current })
      if (error) toast.error(error)
      else { router.refresh() }
    })
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/5">
              {['Course', 'Category', 'Level', 'Price', 'Students', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-neutral-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-neutral-500 text-sm">No courses yet.</td></tr>
            )}
            {courses.map((c) => (
              <tr key={c.id} className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${!c.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                      {c.image_url
                        ? <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-4 h-4 text-gray-300 dark:text-neutral-600" /></div>}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white text-xs font-medium">{c.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-gray-400 dark:text-neutral-500 text-[10px]">{c.duration_text}</p>
                        {c.has_certificate && <Award className="w-3 h-3 text-gold-400" />}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-neutral-300 text-xs capitalize">{c.category}</td>
                <td className="px-4 py-3">
                  <AdminBadge label={c.level} color={levelColor[c.level]} />
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-neutral-200 text-xs font-medium">NPR {c.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-neutral-300 text-xs">
                    <Users className="w-3 h-3 text-gray-400 dark:text-neutral-500" />
                    {c.current_students}/{c.max_students}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(c.id, c.is_active)}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      {c.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <Link href={`/admin/courses/${c.id}`}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => handleDelete(c.id, c.title)} disabled={deleting === c.id}
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
