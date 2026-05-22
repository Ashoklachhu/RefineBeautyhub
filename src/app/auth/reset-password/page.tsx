import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set New Password — Refined Beauty Hub',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none mb-10">
          <span className="text-xl font-light tracking-[0.12em] uppercase"
            style={{ fontFamily: 'var(--font-cormorant)' }}>Refined</span>
          <span className="text-xs font-semibold tracking-[0.3em] text-gold-500 uppercase">Beauty Hub</span>
        </Link>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
