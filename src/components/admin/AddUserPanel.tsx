'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  X, User, Mail, Phone, Lock, Shield, FileText,
  Save, Loader2, Eye, EyeOff, RefreshCw, Copy, CheckCheck,
} from 'lucide-react'
import { adminCreateUser } from '@/app/actions/admin'

// ── Password generator ────────────────────────────────────────

function generatePassword(len = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ── Field wrapper ─────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export function AddUserPanel({ onClose }: Props) {
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: '',
    email:     '',
    password:  generatePassword(),
    phone:     '',
    role:      'client' as 'client' | 'staff' | 'admin',
    notes:     '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [copied,       setCopied]       = useState(false)
  const [saving,       setSaving]       = useState(false)

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function regeneratePassword() {
    set('password', generatePassword())
    setShowPassword(true)
    setCopied(false)
  }

  async function copyPassword() {
    await navigator.clipboard.writeText(form.password).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error('Full name is required'); return }
    if (!form.email.trim())     { toast.error('Email is required');     return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }

    setSaving(true)
    const { error } = await adminCreateUser({
      full_name: form.full_name.trim(),
      email:     form.email.trim().toLowerCase(),
      password:  form.password,
      phone:     form.phone.trim() || undefined,
      role:      form.role,
      notes:     form.notes.trim() || undefined,
    })
    setSaving(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success(`User "${form.full_name}" created successfully`)
      router.refresh()
      onClose()
    }
  }

  const roleOptions: { value: 'client' | 'staff' | 'admin'; label: string; desc: string }[] = [
    { value: 'client', label: 'Client',    desc: 'Can book services and enroll in courses' },
    { value: 'staff',  label: 'Staff',     desc: 'Can manage bookings and view client info' },
    { value: 'admin',  label: 'Admin',     desc: 'Full access to the admin dashboard' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-white/10
                      shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Add New User</h2>
            <p className="text-gray-500 dark:text-neutral-500 text-xs mt-0.5">Create a user account manually</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400
                       hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Personal info */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Personal Info</h3>
            </div>

            <Field label="Full Name" required>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                <input
                  required
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2.5
                             text-sm text-gray-900 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder-neutral-600
                             focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
            </Field>

            <Field label="Email Address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2.5
                             text-sm text-gray-900 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder-neutral-600
                             focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
            </Field>

            <Field label="Phone Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+977-98XXXXXXXX"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2.5
                             text-sm text-gray-900 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder-neutral-600
                             focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
            </Field>
          </section>

          {/* Password */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Password</h3>
            </div>

            <p className="text-[11px] text-gray-400 dark:text-neutral-500 leading-relaxed">
              A temporary password has been generated. Share it securely with the user — they can change it after logging in.
            </p>

            <Field label="Temporary Password" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                <input
                  required
                  minLength={8}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-24 py-2.5
                             text-sm text-gray-900 dark:text-neutral-200 font-mono
                             focus:outline-none focus:border-gold-500/50 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="p-1.5 rounded-md text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors"
                    title={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" onClick={copyPassword}
                    className="p-1.5 rounded-md text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors"
                    title="Copy password">
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" onClick={regeneratePassword}
                    className="p-1.5 rounded-md text-gray-400 dark:text-neutral-500 hover:text-gold-400 transition-colors"
                    title="Generate new password">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Field>

            {showPassword && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 text-[10px] leading-relaxed">
                  ⚠️ Copy this password before closing — it won&apos;t be shown again.
                </span>
              </div>
            )}
          </section>

          {/* Role */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Role</h3>
            </div>

            <div className="space-y-2">
              {roleOptions.map(opt => (
                <label key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${form.role === opt.value
                      ? 'bg-gold-500/10 border-gold-500/30'
                      : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 hover:bg-gray-100 dark:hover:bg-white/[0.02]'}`}>
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={form.role === opt.value}
                    onChange={() => set('role', opt.value)}
                    className="mt-0.5 accent-amber-500 flex-shrink-0"
                  />
                  <div>
                    <p className={`text-xs font-medium ${form.role === opt.value ? 'text-gold-400' : 'text-gray-700 dark:text-neutral-200'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              <h3 className="text-xs font-semibold text-gray-600 dark:text-neutral-300 uppercase tracking-wider">
                Internal Notes <span className="text-gray-400 dark:text-neutral-600 font-normal normal-case">(optional)</span>
              </h3>
            </div>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any internal notes about this user…"
              className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5
                         text-sm text-gray-900 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder-neutral-600 resize-none
                         focus:outline-none focus:border-gold-500/50 transition-colors"
            />
          </section>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                         bg-gold-500/15 border border-gold-500/30 text-gold-400
                         hover:bg-gold-500/20 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Creating…' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400
                         hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
