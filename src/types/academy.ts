export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'
export type CourseFormat = 'in-person' | 'online' | 'hybrid'

export interface Course {
  id: string
  title: string
  slug: string
  category: string
  level: CourseLevel
  format: CourseFormat
  description: string
  shortDescription: string
  duration: string
  price: number
  maxStudents: number
  currentStudents: number
  imageUrl: string
  instructor: string
  syllabus: SyllabusModule[]
  includes: string[]
  certificate: boolean
  featured: boolean
  nextStartDate: string
  createdAt: string
}

export interface SyllabusModule {
  module: number
  title: string
  topics: string[]
  duration: string
}

export interface Enrollment {
  id: string
  courseId: string
  userId: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  enrolledAt: string
  completedAt?: string
}
