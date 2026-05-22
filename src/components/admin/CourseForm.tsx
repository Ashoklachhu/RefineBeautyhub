'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X, Loader2 } from 'lucide-react'
import { adminCreateCourse, adminUpdateCourse } from '@/app/actions/admin'
import { ImageUploadInput } from './ImageUploadInput'
import type { AcademyCourse } from '@/types/database'

interface CourseFormProps {
  course?: Partial<AcademyCourse>
  mode:    'create' | 'edit'
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function CourseForm({ course, mode }: CourseFormProps) {
  const router = useRouter()
  const [, start] = useTransition()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title:             course?.title ?? '',
    slug:              course?.slug ?? '',
    category:          course?.category ?? '',
    level:             course?.level ?? 'beginner',
    format:            course?.format ?? 'in_person',
    description:       course?.description ?? '',
    short_description: course?.short_description ?? '',
    duration_text:     course?.duration_text ?? '',
    price:             course?.price ?? 0,
    discounted_price:  course?.discounted_price ?? '' as number | '',
    max_students:      course?.max_students ?? 10,
    image_url:         course?.image_url ?? '',
    instructor_name:   course?.instructor_name ?? '',
    has_certificate:   course?.has_certificate ?? false,
    is_featured:       course?.is_featured ?? false,
    next_start_date:   course?.next_start_date ?? '',
    display_order:     course?.display_order ?? 99,
  })
  const [includes, setIncludes] = useState<string[]>(course?.includes ?? [])
  const [newInclude, setNewInclude] = useState('')

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(p => {
      const next = { ...p, [k]: v }
      if (k === 'title') next.slug = slugify(v as string)
      return next
    })
  }

  function addInclude() {
    if (!newInclude.trim()) return
    setIncludes(p => [...p, newInclude.trim()])
    setNewInclude('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    start(async () => {
      const payload = {
        ...form,
        discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
        includes,
      }
      if (mode === 'create') {
        const { error } = await adminCreateCourse(payload as Parameters<typeof adminCreateCourse>[0])
        if (error) { toast.error(error); setSaving(false); return }
        toast.success('Course created')
      } else {
        const { error } = await adminUpdateCourse(course!.id!, payload)
        if (error) { toast.error(error); setSaving(false); return }
        toast.success('Course updated')
      }
      router.push('/admin/courses')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Course Title *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)}
            className="admin-input w-full" placeholder="e.g. Advanced Bridal Makeup" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Slug</label>
          <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
            className="admin-input w-full font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Category *</label>
          <input required value={form.category} onChange={e => set('category', e.target.value)}
            className="admin-input w-full" placeholder="e.g. Makeup Artistry" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Level</label>
          <select value={form.level} onChange={e => set('level', e.target.value as AcademyCourse['level'])} className="admin-input w-full">
            {['beginner','intermediate','advanced','professional'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Format</label>
          <select value={form.format} onChange={e => set('format', e.target.value as AcademyCourse['format'])} className="admin-input w-full">
            {['in_person','online','hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">
            Original Price (NPR) *
            <span className="text-gray-400 dark:text-neutral-500 font-normal ml-1">— shown crossed-out if discount is set</span>
          </label>
          <input required type="number" min={0} value={form.price}
            onChange={e => set('price', Number(e.target.value))} className="admin-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">
            Discounted Price (NPR)
            <span className="text-gray-400 dark:text-neutral-500 font-normal ml-1">optional</span>
          </label>
          <input type="number" min={0} value={form.discounted_price}
            onChange={e => set('discounted_price', e.target.value === '' ? '' : Number(e.target.value))}
            className="admin-input w-full" placeholder="Leave blank for no discount" />
          {form.discounted_price !== '' && Number(form.discounted_price) > 0 && Number(form.discounted_price) < form.price && (
            <p className="text-xs text-emerald-500">
              {Math.round((1 - Number(form.discounted_price) / form.price) * 100)}% off
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Max Students</label>
          <input type="number" min={1} value={form.max_students}
            onChange={e => set('max_students', Number(e.target.value))} className="admin-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Duration Text *</label>
          <input required value={form.duration_text} onChange={e => set('duration_text', e.target.value)}
            className="admin-input w-full" placeholder="e.g. 4 Weeks / 40 Hours" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Instructor Name</label>
          <input value={form.instructor_name} onChange={e => set('instructor_name', e.target.value)}
            className="admin-input w-full" placeholder="e.g. Priya Sharma" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Next Start Date</label>
          <input type="date" value={form.next_start_date} onChange={e => set('next_start_date', e.target.value)}
            className="admin-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Display Order</label>
          <input type="number" value={form.display_order}
            onChange={e => set('display_order', Number(e.target.value))} className="admin-input w-full" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Short Description</label>
        <input value={form.short_description} onChange={e => set('short_description', e.target.value)}
          className="admin-input w-full" placeholder="One-line summary" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Full Description</label>
        <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
          className="admin-input w-full resize-none" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Image</label>
        <ImageUploadInput
          value={form.image_url}
          onChange={url => set('image_url', url)}
          folder="courses"
          previewSize="md"
        />
      </div>

      {/* Includes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Course Includes</label>
        <div className="flex gap-2">
          <input value={newInclude} onChange={e => setNewInclude(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInclude() } }}
            className="admin-input flex-1" placeholder="e.g. Course materials, Certificate..." />
          <button type="button" onClick={addInclude}
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {includes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {includes.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 text-xs">
                {item}
                <button type="button" onClick={() => setIncludes(p => p.filter((_, j) => j !== i))}
                  className="text-gray-400 dark:text-neutral-500 hover:text-rose-400"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {([['has_certificate', 'Certificate'], ['is_featured', 'Featured']] as const).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form[k] as boolean} onChange={e => set(k, e.target.checked)}
              className="w-4 h-4 rounded" />
            <span className="text-xs text-gray-600 dark:text-neutral-300">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors disabled:opacity-50">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create Course' : 'Save Changes'}
        </button>
        <a href="/admin/courses" className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
