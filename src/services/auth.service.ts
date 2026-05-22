import { createClient } from '@/lib/supabase/client'
import { ok, fail, fromSupabaseError, Errors, type ServiceResult } from '@/lib/errors'
import type { Profile } from '@/types/database'

// ── Sign Up ───────────────────────────────────────────────────

export interface SignUpPayload {
  email:    string
  password: string
  fullName: string
  phone?:   string
}

export async function signUp(
  payload: SignUpPayload
): Promise<ServiceResult<{ message: string }>> {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email:    payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName,
        phone:     payload.phone ?? null,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) return fail(fromSupabaseError(error))
  return ok({ message: 'Check your email to confirm your account.' })
}

// ── Sign In ───────────────────────────────────────────────────

export interface SignInPayload {
  email:    string
  password: string
}

export async function signIn(
  payload: SignInPayload
): Promise<ServiceResult<{ message: string }>> {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email:    payload.email,
    password: payload.password,
  })

  if (error) return fail(fromSupabaseError({ message: 'Invalid email or password', code: error.code }))
  return ok({ message: 'Welcome back!' })
}

// ── Sign Out ──────────────────────────────────────────────────

export async function signOut(): Promise<ServiceResult<null>> {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return fail(fromSupabaseError(error))
  return ok(null)
}

// ── Forgot Password ───────────────────────────────────────────

export async function forgotPassword(
  email: string
): Promise<ServiceResult<{ message: string }>> {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) return fail(fromSupabaseError(error))
  return ok({ message: 'Password reset link sent to your email.' })
}

// ── Reset Password ────────────────────────────────────────────

export async function resetPassword(
  newPassword: string
): Promise<ServiceResult<{ message: string }>> {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return fail(fromSupabaseError(error))
  return ok({ message: 'Password updated successfully.' })
}

// ── Update Profile ────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url' | 'date_of_birth'>>
): Promise<ServiceResult<Profile>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) return fail(fromSupabaseError(error))
  if (!data)  return fail(Errors.notFound('Profile'))
  return ok(data)
}

