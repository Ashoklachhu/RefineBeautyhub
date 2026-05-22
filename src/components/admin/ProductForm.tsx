'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus, X, Image } from 'lucide-react'
import { adminCreateProduct, adminUpdateProduct } from '@/app/actions/admin'
import { ImageUploadInput } from './ImageUploadInput'
import { uploadImageAction } from '@/app/actions/upload'
import type { Product, ProductCategory } from '@/types/database'

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'hair',      label: 'Hair' },
  { value: 'skin',      label: 'Skin' },
  { value: 'body',      label: 'Body' },
  { value: 'nails',     label: 'Nails' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'tools',     label: 'Tools' },
  { value: 'other',     label: 'Other' },
]

const PRESET_TAGS = ['staff_pick', 'bestseller', 'new', 'limited']
const TAG_LABELS: Record<string, string> = {
  staff_pick: 'Staff Pick', bestseller: 'Bestseller', new: 'New Arrival', limited: 'Limited',
}

interface Props {
  product?: Product   // undefined = create mode
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [suitInput, setSuitInput] = useState('')

  const [form, setForm] = useState({
    name:              product?.name              ?? '',
    slug:              product?.slug              ?? '',
    short_description: product?.short_description ?? '',
    description:       product?.description       ?? '',
    expert_note:       product?.expert_note       ?? '',
    price:             product?.price             ?? 0,
    compare_at_price:  product?.compare_at_price  ?? '',
    image_url:         product?.image_url         ?? '',
    gallery_urls:      product?.gallery_urls      ?? [] as string[],
    category:          product?.category          ?? 'hair' as ProductCategory,
    tags:              product?.tags              ?? [] as string[],
    suitable_for:      product?.suitable_for      ?? [] as string[],
    ingredients:       product?.ingredients       ?? '',
    how_to_use:        product?.how_to_use        ?? '',
    is_featured:       product?.is_featured       ?? false,
    is_active:         product?.is_active         ?? true,
    in_stock:          product?.in_stock          ?? true,
    stock_count:       product?.stock_count       ?? '' as number | '',
    sort_order:        product?.sort_order        ?? 0,
  })

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  function handleNameChange(name: string) {
    setForm(p => ({ ...p, name, slug: isEdit ? p.slug : slugify(name) }))
  }

  function toggleTag(tag: string) {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
    }))
  }

  function addCustomTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '_')
    if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t] }))
    setTagInput('')
  }

  function addSuitable() {
    const s = suitInput.trim()
    if (s && !form.suitable_for.includes(s)) setForm(p => ({ ...p, suitable_for: [...p.suitable_for, s] }))
    setSuitInput('')
  }

  function addGalleryUrl(url: string) {
    if (url && !form.gallery_urls.includes(url))
      setForm(p => ({ ...p, gallery_urls: [...p.gallery_urls, url] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.slug.trim()) { toast.error('Slug is required'); return }
    if (form.price <= 0)   { toast.error('Price must be greater than 0'); return }

    setSaving(true)
    const payload = {
      ...form,
      compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
      stock_count:      form.stock_count === '' ? null : Number(form.stock_count),
      price:            Number(form.price),
      sort_order:       Number(form.sort_order),
    }

    if (isEdit) {
      const { error } = await adminUpdateProduct(product.id, payload)
      if (error) { toast.error(error); setSaving(false); return }
      toast.success('Product updated')
    } else {
      const { error } = await adminCreateProduct(payload)
      if (error) { toast.error(error); setSaving(false); return }
      toast.success('Product created')
    }

    router.push('/admin/products')
    router.refresh()
  }

  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5'
  const inputCls = 'admin-input w-full'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* ── Basic info ─────────────────────────────────────── */}
      <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Product Name *</label>
            <input required value={form.name} onChange={e => handleNameChange(e.target.value)}
              className={inputCls} placeholder="e.g. Kerastase Nutritive Serum" />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input required value={form.slug} onChange={e => set('slug', e.target.value)}
              className={inputCls} placeholder="kerastase-nutritive-serum" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Short Description</label>
          <input value={form.short_description} onChange={e => set('short_description', e.target.value)}
            className={inputCls} placeholder="One-line summary shown in product cards" />
        </div>

        <div>
          <label className={labelCls}>Full Description</label>
          <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
            className={`${inputCls} resize-none`} placeholder="Detailed product description…" />
        </div>

        <div>
          <label className={labelCls}>Expert Note <span className="text-gray-400 dark:text-neutral-600 font-normal">(shown as curator&apos;s recommendation)</span></label>
          <textarea rows={2} value={form.expert_note} onChange={e => set('expert_note', e.target.value)}
            className={`${inputCls} resize-none italic`}
            placeholder="Why our team loves this product…" />
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pricing</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Price (NPR) *</label>
            <input required type="number" min="0" step="0.01" value={form.price}
              onChange={e => set('price', parseFloat(e.target.value) || 0)}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Compare-at Price</label>
            <input type="number" min="0" step="0.01" value={form.compare_at_price}
              onChange={e => set('compare_at_price', e.target.value === '' ? '' : parseFloat(e.target.value))}
              className={inputCls} placeholder="Original / RRP" />
          </div>
          <div>
            <label className={labelCls}>Sort Order</label>
            <input type="number" value={form.sort_order}
              onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
              className={inputCls} />
          </div>
        </div>
      </section>

      {/* ── Category & Tags ────────────────────────────────── */}
      <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Category & Tags</h3>

        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value as ProductCategory)}
            className={inputCls}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Product Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_TAGS.map(tag => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  form.tags.includes(tag)
                    ? 'bg-gold-500/20 border border-gold-500/40 text-gold-400'
                    : 'bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-neutral-400'
                }`}>
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
              className={`${inputCls} flex-1`} placeholder="Custom tag (press Enter)" />
            <button type="button" onClick={addCustomTag}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-xs transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.tags.filter(t => !PRESET_TAGS.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.filter(t => !PRESET_TAGS.includes(t)).map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                  {tag}
                  <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t2 => t2 !== tag) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Suitable For</label>
          <div className="flex gap-2 mb-2">
            <input value={suitInput} onChange={e => setSuitInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSuitable() } }}
              className={`${inputCls} flex-1`} placeholder="e.g. dry hair (press Enter)" />
            <button type="button" onClick={addSuitable}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-xs transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.suitable_for.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.suitable_for.map(s => (
                <span key={s} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border border-gray-200 dark:border-white/10 text-gray-600 dark:text-neutral-300">
                  {s}
                  <button type="button" onClick={() => setForm(p => ({ ...p, suitable_for: p.suitable_for.filter(x => x !== s) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Images ─────────────────────────────────────────── */}
      <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Images</h3>

        <div>
          <label className={labelCls}>Main Image</label>
          <ImageUploadInput
            value={form.image_url}
            onChange={url => set('image_url', url)}
            folder="products"
            previewSize="md"
          />
        </div>

        <div>
          <label className={labelCls}>Gallery Images</label>
          <GalleryInputs urls={form.gallery_urls}
            onChange={urls => set('gallery_urls', urls)}
            onAdd={addGalleryUrl}
          />
        </div>
      </section>

      {/* ── Details ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Product Details</h3>
        <div>
          <label className={labelCls}>Ingredients</label>
          <textarea rows={3} value={form.ingredients} onChange={e => set('ingredients', e.target.value)}
            className={`${inputCls} resize-none`} placeholder="Full ingredient list…" />
        </div>
        <div>
          <label className={labelCls}>How to Use</label>
          <textarea rows={3} value={form.how_to_use} onChange={e => set('how_to_use', e.target.value)}
            className={`${inputCls} resize-none`} placeholder="Application instructions…" />
        </div>
        <div>
          <label className={labelCls}>Stock Count <span className="text-gray-400 dark:text-neutral-600 font-normal">(leave blank for unlimited)</span></label>
          <input type="number" min="0" value={form.stock_count}
            onChange={e => set('stock_count', e.target.value === '' ? '' : parseInt(e.target.value))}
            className={inputCls} placeholder="Unlimited" />
        </div>
      </section>

      {/* ── Visibility ─────────────────────────────────────── */}
      <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Visibility & Status</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {([
            ['is_active',   'Active (visible on shop)'],
            ['is_featured', 'Featured (shown in hero)'],
            ['in_stock',    'In Stock'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)}
                className="w-4 h-4 rounded accent-amber-600" />
              <span className="text-sm text-gray-600 dark:text-neutral-300">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors disabled:opacity-50">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Gallery input helper ──────────────────────────────────────

function GalleryInputs({
  urls, onChange, onAdd,
}: { urls: string[]; onChange: (urls: string[]) => void; onAdd: (url: string) => void }) {
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'products')
      const { data, error } = await uploadImageAction(fd)
      if (error || !data) {
        const { toast } = await import('sonner')
        toast.error(error ?? 'Upload failed')
      } else {
        onAdd(data.url)
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {urls.map((url, i) => (
        <div key={i} className="flex gap-2 items-center">
          <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-white/10 flex-shrink-0"
            onError={e => (e.currentTarget.style.display = 'none')} />
          <input value={url} onChange={e => onChange(urls.map((u, j) => j === i ? e.target.value : u))}
            className="admin-input flex-1 text-xs" placeholder="https://…" />
          <button type="button" onClick={() => onChange(urls.filter((_, j) => j !== i))}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* URL input row */}
      <div className="flex gap-2">
        <input type="url" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(input); setInput('') } }}
          className="admin-input flex-1" placeholder="Paste image URL (press Enter)" />
        <button type="button"
          onClick={() => { onAdd(input); setInput('') }}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-xs transition-colors">
          <Image className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Upload button row */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-white/10 text-gray-500 dark:text-neutral-400 hover:border-gold-500/50 hover:text-gold-400 text-xs transition-colors disabled:opacity-50 w-full justify-center"
        >
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
            : <><Plus className="w-3.5 h-3.5" /> Upload from device</>
          }
        </button>
      </div>
    </div>
  )
}
