import Link from 'next/link'
import { Plus } from 'lucide-react'
import { adminGetCourses } from '@/app/actions/admin'
import { CoursesManager } from '@/components/admin/CoursesManager'

export const dynamic = 'force-dynamic'

export default async function AdminCoursesPage() {
  const { courses } = await adminGetCourses()
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{courses.length} courses</p>
        </div>
        <Link href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>
      <CoursesManager courses={courses} />
    </div>
  )
}
