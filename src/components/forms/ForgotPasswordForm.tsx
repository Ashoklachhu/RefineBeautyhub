'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { forgotPassword } from '@/services/auth.service'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validations'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(values: ForgotPasswordValues) {
    const result = await forgotPassword(values.email)
    if (result.error) { toast.error(result.error.message); return }
    setSentEmail(values.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Check Your Email
        </h1>
        <p className="text-sm text-muted-foreground mb-2">
          We sent a password reset link to
        </p>
        <p className="text-sm font-medium text-foreground mb-6">{sentEmail}</p>
        <p className="text-xs text-muted-foreground mb-8">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button onClick={() => setSent(false)} className="text-gold-600 hover:text-gold-700 transition-colors underline">
            try again
          </button>
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full h-11">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@email.com" {...register('email')}
            className={errors.email ? 'border-destructive' : ''} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}
          className="w-full h-11 gold-gradient text-white border-0 hover:opacity-90 font-medium tracking-wide">
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send Reset Link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
