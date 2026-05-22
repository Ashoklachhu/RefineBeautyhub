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
import { signIn } from '@/services/auth.service'
import { signInSchema, type SignInValues } from '@/lib/validations'

export function LoginForm({ redirectTo = '/profile' }: { redirectTo?: string }) {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  async function onSubmit(values: SignInValues) {
    const result = await signIn(values)
    if (result.error) { toast.error(result.error.message); return }
    toast.success('Welcome back!')
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to manage your bookings and profile.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@email.com" {...register('email')}
            className={errors.email ? 'border-destructive' : ''} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-gold-600 hover:text-gold-700 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••"
              {...register('password')} className={errors.password ? 'border-destructive pr-10' : 'pr-10'} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}
          className="w-full h-11 gold-gradient text-white border-0 hover:opacity-90 font-medium tracking-wide">
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  )
}
