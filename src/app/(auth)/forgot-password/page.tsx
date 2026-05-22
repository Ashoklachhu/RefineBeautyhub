import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password — Refined Beauty Hub',
  description: 'Reset your Refined Beauty Hub account password.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
