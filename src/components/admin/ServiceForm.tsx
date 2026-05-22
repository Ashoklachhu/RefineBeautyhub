'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X, Loader2 } from 'lucide-react'
import { adminCreateService, adminUpdateService } from '@/app/actions/admin'
import { ImageUploadInput } from './ImageUploadInput'
import type { Service, Category } from '@/types/database'

interface ServiceFormProps {
  service?:    Partial<Service>
  categories:  Category[]
  mode:        'create' | 'edit'
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ServiceForm({ service, categories, mode }: ServiceFormProps) {
  const router = useRouter()
  const [, start] = useTransition()

  const [form, setForm] = useState({
    category_id:       service?.category_id ?? '',
    name:              service?.name ?? '',
    slug:              service?.slug ?? '',
    description:       service?.description ?? '',
    short_description: service?.short_description ?? '',
    duration_minutes:  service?.duration_minutes ?? 60,
    price:             service?.price ?? 0,
    price_max:         service?.price_max ?? '',
    discounted_price:  service?.discounted_price ?? '' as number | '',
    image_url:         service?.image_url ?? '',
    is_featured:       service?.is_featured ?? false,
    is_popular:        service?.is_popular ?? false,
    display_order:     service?.display_order ?? 99,
  })
  const [benefits, setBenefits] = useState<string[]>(service?.benefits ?? [])
  const [newBenefit, setNewBenefit] = useState('')
  const [saving, setSaving] = useState(false)

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(p => ({ ...p, [k]: v }))
    if (k === 'name') setForm(p => ({ ...p, name: v as string, slug: slugify(v as string) }))
  }

  function addBenefit() {
    if (!newBenefit.trim()) return
    setBenefits(p => [...p, newBenefit.trim()])
    setNewBenefit('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    start(async () => {
      const payload = {
        ...form,
        price_max:        form.price_max        ? Number(form.price_max)        : undefined,
        discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
        benefits,
      }

      if (mode === 'create') {
        const { error } = await adminCreateService(payload as Parameters<typeof adminCreateService>[0])
        if (error) { toast.error(error); setSaving(false); return }
        toast.success('Service created')
        router.push('/admin/services')
        router.refresh()
      } else {
        const { error } = await adminUpdateService(service!.id!, payload)
        if (error) { toast.error(error); setSaving(false); return }
        toast.success('Service updated')
        router.push('/admin/services')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-600 dark:text-neutral-300">Service Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="admin-input w-full" placeholder="e.g. Luxury Hair Treatment" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Slug</label>
          <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
            className="admin-input w-full font-mono text-xs" placeholder="auto-generated" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Category *</label>
          <select required value={form.category_id} onChange={e => set('category_id', e.target.value)}
            className="admin-input w-full">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Duration (minutes) *</label>
          <input required type="number" min={15} step={15} value={form.duration_minutes}
            onChange={e => set('duration_minutes', Number(e.target.value))}
            className="admin-input w-full" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">
            Original Price (NPR) *
            <span className="text-gray-400 dark:text-neutral-500 font-normal ml-1">— shown as crossed-out if discount is set</span>
          </label>
          <input required type="number" min={0} value={form.price}
            onChange={e => set('price', Number(e.target.value))}
            className="admin-input w-full" />
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
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Max Price (NPR) <span className="text-gray-400 dark:text-neutral-500">optional</span></label>
          <input type="number" min={0} value={form.price_max}
            onChange={e => set('price_max', e.target.value as unknown as number)}
            className="admin-input w-full" placeholder="For price range" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Display Order</label>
          <input type="number" value={form.display_order}
            onChange={e => set('display_order', Number(e.target.value))}
            className="admin-input w-full" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Short Description</label>
        <input value={form.short_description} onChange={e => set('short_description', e.target.value)}
          className="admin-input w-full" placeholder="One-line summary shown on cards" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Full Description</label>
        <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
          className="admin-input w-full resize-none" placeholder="Detailed description..." />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Image</label>
        <ImageUploadInput
          value={form.image_url}
          onChange={url => set('image_url', url)}
          folder="services"
          previewSize="md"
        />
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-neutral-300">Benefits / Includes</label>
        <div className="flex gap-2">
          <input value={newBenefit} onChange={e => setNewBenefit(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit() } }}
            className="admin-input flex-1" placeholder="Add benefit..." />
          <button type="button" onClick={addBenefit}
            className="px-3 py-2 rounded-lg bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:text-white text-xs">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 text-xs">
                {b}
                <button type="button" onClick={() => setBenefits(p => p.filter((_, j) => j !== i))}
                  className="text-gray-400 dark:text-neutral-500 hover:text-rose-400 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        {([['is_featured', 'Featured'], ['is_popular', 'Popular']] as const).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)}
              className="w-4 h-4 rounded" />
            <span className="text-xs text-gray-600 dark:text-neutral-300">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors disabled:opacity-50">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create Service' : 'Save Changes'}
        </button>
        <a href="/admin/services"
          className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
          Cancel
        </a>
      </div>
    </form>
  )
}
