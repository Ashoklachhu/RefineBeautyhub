'use server'

import { enrollInCourse } from '@/services/academy.service'
import { getServerUser } from '@/lib/auth/get-server-user'

export interface EnrollActionInput {
  courseId:    string
  guestName?:  string
  guestEmail?: string
  guestPhone?: string
  notes?:      string
}

export async function enrollInCourseAction(
  input: EnrollActionInput
): Promise<{ reference?: string; error?: string }> {
  const user = await getServerUser()

  const result = await enrollInCourse({
    courseId:    input.courseId,
    userId:      user?.id,
    guestName:   input.guestName,
    guestEmail:  input.guestEmail,
    guestPhone:  input.guestPhone,
    notes:       input.notes,
  })

  if (result.error) return { error: result.error.message }
  return { reference: result.data.reference }
}
