import { CourseForm } from '@/components/admin/CourseForm'

export default function NewCoursePage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">New Course</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">Create a new academy course.</p>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <CourseForm mode="create" />
      </div>
    </div>
  )
}
