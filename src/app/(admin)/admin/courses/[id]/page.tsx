import { notFound } from 'next/navigation'
import { adminGetCourseById } from '@/app/actions/admin'
import { CourseForm } from '@/components/admin/CourseForm'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await adminGetCourseById(id)
  if (!course) notFound()

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Course</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{course.title}</p>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <CourseForm course={course} mode="edit" />
      </div>
    </div>
  )
}
