'use server'

import { submitContactInquiry } from '@/services/contact.service'

export async function submitContactAction(values: {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}): Promise<{ success: boolean; message: string }> {
  if (!values.name || !values.email || !values.subject || !values.message) {
    return { success: false, message: 'Please fill in all required fields.' }
  }

  const result = await submitContactInquiry({
    name:    values.name,
    email:   values.email,
    phone:   values.phone || null,
    subject: values.subject,
    message: values.message,
  })

  if (result.error) {
    return { success: false, message: result.error.message ?? 'Something went wrong. Please try again.' }
  }

  return { success: true, message: result.data?.message ?? 'Your message has been sent.' }
}
