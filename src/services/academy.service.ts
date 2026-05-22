import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ok, fail, fromSupabaseError, Errors, type ServiceResult } from '@/lib/errors'
import type { AcademyCourse, Enrollment, EnrollmentWithCourse } from '@/types/database'

export async function getAllCourses(): Promise<ServiceResult<AcademyCourse[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('academy_courses')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) return fail(fromSupabaseError(error))
  return ok(data as AcademyCourse[])
}

export async function getFeaturedCourses(): Promise<ServiceResult<AcademyCourse[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('academy_courses')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order')
    .limit(3)

  if (error) return fail(fromSupabaseError(error))
  return ok(data as AcademyCourse[])
}

export async function getCourseBySlug(slug: string): Promise<ServiceResult<AcademyCourse>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('academy_courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return fail(fromSupabaseError(error))
  if (!data)  return fail(Errors.notFound('Course'))
  return ok(data as AcademyCourse)
}

export interface EnrollInput {
  courseId:    string
  userId?:     string
  guestName?:  string
  guestEmail?: string
  guestPhone?: string
  notes?:      string
}

export async function enrollInCourse(
  input: EnrollInput
): Promise<ServiceResult<Enrollment>> {
  // Use service client so guest enrollments are never blocked by RLS
  const supabase = createServiceClient()

  // Check course capacity
  const { data: courseRaw, error: courseErr } = await supabase
    .from('academy_courses')
    .select('id, title, max_students, current_students')
    .eq('id', input.courseId)
    .single()

  if (courseErr) return fail(Errors.notFound('Course'))
  if (!courseRaw) return fail(Errors.notFound('Course'))

  const course = courseRaw as Pick<AcademyCourse, 'id' | 'title' | 'max_students' | 'current_students'>

  if (course.current_students >= course.max_students) {
    return fail(Errors.conflict(`${course.title} is fully booked. Please join the waitlist.`))
  }

  // Check for duplicate enrollment (logged-in users only)
  if (input.userId) {
    const { data: dupRaw } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', input.courseId)
      .eq('user_id', input.userId)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle()

    if (dupRaw) {
      return fail(Errors.conflict('You are already enrolled in this course.'))
    }
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      course_id:   input.courseId,
      user_id:     input.userId    ?? null,
      guest_name:  input.guestName  ?? null,
      guest_email: input.guestEmail ?? null,
      guest_phone: input.guestPhone ?? null,
      notes:       input.notes     ?? null,
      status:      'pending',
      amount_paid: 0,
    })
    .select()
    .single()

  if (error) return fail(fromSupabaseError(error))
  if (!data)  return fail(Errors.unknown())
  return ok(data as Enrollment)
}

export async function getUserEnrollments(
  userId: string
): Promise<ServiceResult<EnrollmentWithCourse[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:academy_courses!course_id(*)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) return fail(fromSupabaseError(error))
  return ok(data as EnrollmentWithCourse[])
}
