'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { signUp } from '@/services/auth.service'
import { signUpSchema, type SignUpValues } from '@/lib/validations'

interface RegisterFormProps {
  prefill?: {
    fullName?: string
    email?:    string
    phone?:    string
  }
}

export function RegisterForm({ prefill }: RegisterFormProps) {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: prefill?.fullName ?? '',
      email:    prefill?.email    ?? '',
      phone:    prefill?.phone    ?? '',
    },
  })

  async function onSubmit(values: SignUpValues) {
    const result = await signUp({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone || undefined,
    })
    if (result.error) { toast.error(result.error.message); return }
    toast.success('Account created! Please check your email to confirm.')
    router.push('/login?registered=true')
  }

  const fromBooking = !!(prefill?.fullName || prefill?.email)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Create Account
        </h1>
        <p className="text-sm text-muted-foreground">Join us for a luxury beauty experience.</p>
      </div>

      {/* Pre-fill notice — shown when coming from a guest booking */}
      {fromBooking && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-gold-50 border border-gold-200">
          <span className="text-lg mt-0.5">🎉</span>
          <div>
            <p className="text-xs font-semibold text-gold-800">Your booking details are pre-filled!</p>
            <p className="text-[11px] text-gold-700 mt-0.5">Just set a password and you&apos;re done. Your booking is already saved.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="Jane Doe" {...register('fullName')}
            className={errors.fullName ? 'border-destructive' : ''} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@email.com" {...register('email')}
            className={errors.email ? 'border-destructive' : ''} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="phone" type="tel" placeholder="+977 98XXXXXXXX" {...register('phone')}
            className={errors.phone ? 'border-destructive' : ''} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
              {...register('password')} className={errors.password ? 'border-destructive pr-10' : 'pr-10'} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
              {...register('confirmPassword')} className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}
          className="w-full h-11 gold-gradient text-white border-0 hover:opacity-90 font-medium tracking-wide">
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="/privacy" className="text-gold-600 hover:text-gold-700 transition-colors">Privacy Policy</Link>
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
