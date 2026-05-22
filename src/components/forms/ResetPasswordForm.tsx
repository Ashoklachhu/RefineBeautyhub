'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, CheckCircle, Lock } from 'lucide-react'
import { resetPassword } from '@/services/auth.service'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass,        setShowPass]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [done,            setDone]            = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await resetPassword(password)
    setLoading(false)

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    setDone(true)
    toast.success('Password updated successfully!')
    setTimeout(() => router.push('/login'), 2500)
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Password Updated
        </h1>
        <p className="text-sm text-muted-foreground">
          Your password has been changed. Redirecting you to sign in…
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Set New Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full h-10 pl-9 pr-10 rounded-md border border-input bg-background text-sm
                         focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0
                         placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4].map(i => {
                const strength = Math.min(Math.floor(password.length / 3), 4)
                const color = strength >= 3 ? 'bg-emerald-500' : strength >= 2 ? 'bg-amber-400' : 'bg-rose-400'
                return (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? color : 'bg-muted'}`} />
                )
              })}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat new password"
              className={`w-full h-10 pl-9 pr-10 rounded-md border bg-background text-sm
                          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0
                          placeholder:text-muted-foreground transition-colors
                          ${confirmPassword && confirmPassword !== password
                            ? 'border-destructive'
                            : 'border-input'}`}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-md gold-gradient text-white font-medium tracking-wide
                     hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
