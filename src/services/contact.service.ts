import { createClient } from '@/lib/supabase/server'
import { ok, fail, fromSupabaseError, type ServiceResult } from '@/lib/errors'
import type { ContactInquiryInsert } from '@/types/database'

export async function submitContactInquiry(
  input: ContactInquiryInsert
): Promise<ServiceResult<{ message: string }>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_inquiries')
    .insert(input)

  if (error) return fail(fromSupabaseError(error))
  return ok({ message: 'Your message has been sent. We will get back to you shortly.' })
}
