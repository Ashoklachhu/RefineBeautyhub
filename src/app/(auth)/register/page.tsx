import type { Metadata } from 'next'
import { RegisterForm } from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account — Refined Beauty Hub',
  description: 'Create your account to start booking luxury beauty services.',
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; email?: string; phone?: string }>
}) {
  const { name, email, phone } = await searchParams
  return <RegisterForm prefill={{ fullName: name, email, phone }} />
}
