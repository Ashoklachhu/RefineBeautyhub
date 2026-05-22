'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X, Loader2 } from 'lucide-react'
import { adminCreateStaff, adminUpdateStaff } from '@/app/actions/admin'
import { ImageUploadInput } from './ImageUploadInput'
import { BRANCHES } from '@/constants'
import type { Staff } from '@/types/database'

interface StaffFormProps {
  staff?: Partial<Staff>
  mode:   'create' | 'edit'
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function StaffForm({ staff, mode }: StaffFormProps) {
  const router = useRouter()
  const [, start] = useTransition()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name:             staff?.name ?? '',
    slug:             staff?.slug ?? '',
    role:             staff?.role ?? '',
    bio:              staff?.bio ?? '',
    avatar_url:       staff?.avatar_url ?? '',
    experience_years: staff?.experience_years ?? 0,
    instagram_url:    staff?.instagram_url ?? '',
    branch:           staff?.branch ?? 'jadibuti',
    is_featured:      staff?.is_featured ?? false,
    display_order:    staff?.display_order ?? 99,
  })
  const [specialties, setSpecialties] = useState<string[]>(staff?.specialties ?? [])
  const [newSpec, setNewSpec] = useState('')

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(p => {
      const next = { ...p, [k]: v }
      if (k === 'name') next.slug = slugify(v as string)
      return next
    })
  }

  function addSpec() {
    if (!newSpec.trim()) return
    setSpecialties(p => [...p, newSpec.trim()])
    setNewSpec('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    start(async () => {
      if (mode === 'create') {
        const { error } = await adminCreateStaff({ ...form, specialties })
        if (error) { toast.error(error); setSaving(false); return }
        toast.success('Staff member added')
      } else {
        const { error } = await adminUpdateStaff(staff!.id!, { ...form, specialties })
        if (error) { toast.error(error); setSaving(false); return }
        toast.success('Staff updated')
      }
      router.push('/admin/staff')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="admin-input w-full" placeholder="e.g. Priya Sharma" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Slug</label>
          <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
            className="admin-input w-full font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Role / Title *</label>
          <input required value={form.role} onChange={e => set('role', e.target.value)}
            className="admin-input w-full" placeholder="e.g. Senior Hair Stylist" />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Branch *</label>
          <div className="grid grid-cols-2 gap-2">
            {BRANCHES.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => set('branch', b.id)}
                className={`flex flex-col items-start gap-0.5 py-2.5 px-3 rounded-lg border text-left transition-all
                  ${form.branch === b.id
                    ? 'border-gold-500/50 bg-gold-500/10 text-gray-900 dark:text-white'
                    : 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-white/15'}`}
              >
                <span className="text-xs font-semibold">{b.name}</span>
                <span className="text-[10px] opacity-60">{b.address}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Years of Experience</label>
          <input type="number" min={0} value={form.experience_years}
            onChange={e => set('experience_years', Number(e.target.value))} className="admin-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Display Order</label>
          <input type="number" value={form.display_order}
            onChange={e => set('display_order', Number(e.target.value))} className="admin-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Instagram URL</label>
          <input type="url" value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)}
            className="admin-input w-full" placeholder="https://instagram.com/..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Bio</label>
        <textarea rows={4} value={form.bio} onChange={e => set('bio', e.target.value)}
          className="admin-input w-full resize-none" placeholder="Brief bio..." />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Profile Photo</label>
        <ImageUploadInput
          value={form.avatar_url}
          onChange={url => set('avatar_url', url)}
          folder="staff"
          previewSize="sm"
          label="Profile Photo"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Specialties</label>
        <div className="flex gap-2">
          <input value={newSpec} onChange={e => setNewSpec(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpec() } }}
            className="admin-input flex-1" placeholder="e.g. Balayage, Bridal" />
          <button type="button" onClick={addSpec}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {specialties.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 text-xs">
                {s}
                <button type="button" onClick={() => setSpecialties(p => p.filter((_, j) => j !== i))}
                  className="text-neutral-500 hover:text-rose-400"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)}
          className="w-4 h-4 rounded" />
        <span className="text-xs text-gray-600 dark:text-neutral-300">Feature on homepage</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium disabled:opacity-50">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Add Staff Member' : 'Save Changes'}
        </button>
        <a href="/admin/staff" className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
          Cancel
        </a>
      </div>
    </form>
  )
}
