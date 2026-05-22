import type { Metadata } from 'next'
import { LoginForm } from '@/components/forms/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — Refined Beauty Hub',
  description: 'Sign in to manage your bookings and profile.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; registered?: string; error?: string }>
}) {
  const { redirectTo, registered, error } = await searchParams

  return (
    <div>
      {registered && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
          Account created! Check your email to confirm, then sign in.
        </div>
      )}
      {error === 'auth_callback_failed' && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          The confirmation link has expired or is invalid. Please try again.
        </div>
      )}
      <LoginForm redirectTo={redirectTo ?? '/profile'} />
    </div>
  )
}
