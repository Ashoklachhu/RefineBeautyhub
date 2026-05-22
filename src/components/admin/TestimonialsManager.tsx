'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, Check, Eye, EyeOff, Trash2, Plus, X, Loader2 } from 'lucide-react'
import { adminUpdateTestimonial, adminCreateTestimonial, adminDeleteTestimonial } from '@/app/actions/admin'
import { AdminBadge } from './AdminBadge'
import type { Testimonial } from '@/types/database'

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [form, setForm] = useState({
    client_name: '', rating: 5, review: '', service_label: '', client_image_url: '', is_verified: true,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    start(async () => {
      const { error } = await adminCreateTestimonial(form)
      if (error) toast.error(error)
      else {
        toast.success('Testimonial added')
        setForm({ client_name: '', rating: 5, review: '', service_label: '', client_image_url: '', is_verified: true })
        setShowForm(false)
        router.refresh()
      }
      setSaving(false)
    })
  }

  async function toggle(id: string, field: 'is_published' | 'is_featured', current: boolean) {
    start(async () => {
      const { error } = await adminUpdateTestimonial(id, { [field]: !current })
      if (error) toast.error(error)
      else router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial permanently?')) return
    setDeleting(id)
    start(async () => {
      const { error } = await adminDeleteTestimonial(id)
      if (error) toast.error(error)
      else { toast.success('Deleted'); router.refresh() }
      setDeleting(null)
    })
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(p => !p)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors">
        <Plus className="w-4 h-4" /> Add Testimonial
      </button>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Testimonial</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400 dark:text-neutral-500" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input required value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))}
                className="admin-input w-full" placeholder="Client Name *" />
              <input required value={form.service_label} onChange={e => setForm(p => ({ ...p, service_label: e.target.value }))}
                className="admin-input w-full" placeholder="Service (e.g. Hair Coloring) *" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600 dark:text-neutral-300">Rating:</label>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(p => ({ ...p, rating: n }))}
                  className={`p-0.5 ${n <= form.rating ? 'text-gold-400' : 'text-gray-300 dark:text-neutral-600'}`}>
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
            <textarea required rows={3} value={form.review} onChange={e => setForm(p => ({ ...p, review: e.target.value }))}
              className="admin-input w-full resize-none" placeholder="Review text *" />
            <input type="url" value={form.client_image_url} onChange={e => setForm(p => ({ ...p, client_image_url: e.target.value }))}
              className="admin-input w-full" placeholder="Client photo URL (optional)" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_verified} onChange={e => setForm(p => ({ ...p, is_verified: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-xs text-gray-600 dark:text-neutral-300">Mark as verified</span>
            </label>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 text-sm font-medium disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Add Review
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {testimonials.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center text-gray-400 dark:text-neutral-500 text-sm">
            No testimonials yet.
          </div>
        )}
        {testimonials.map((t) => (
          <div key={t.id} className={`bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-4 ${!t.is_published ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-gray-900 dark:text-white text-sm font-medium">{t.client_name}</p>
                  <span className="text-gray-400 dark:text-neutral-500 text-xs">·</span>
                  <p className="text-gray-500 dark:text-neutral-400 text-xs">{t.service_label}</p>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= t.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-300 dark:text-neutral-600'}`} />
                    ))}
                  </div>
                  <div className="flex gap-1.5 ml-auto">
                    {t.is_verified && <AdminBadge label="Verified" color="green" />}
                    {t.is_featured && <AdminBadge label="Featured" color="gold" />}
                    {t.is_published ? <AdminBadge label="Published" color="blue" /> : <AdminBadge label="Draft" color="gray" />}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-neutral-300 text-xs leading-relaxed line-clamp-2">{t.review}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
              <button onClick={() => toggle(t.id, 'is_published', t.is_published)}
                title={t.is_published ? 'Unpublish' : 'Publish'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${t.is_published ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'}`}>
                {t.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {t.is_published ? 'Published' : 'Publish'}
              </button>
              <button onClick={() => toggle(t.id, 'is_featured', t.is_featured)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${t.is_featured ? 'bg-gold-500/10 text-gold-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gold-400'}`}>
                <Star className="w-3.5 h-3.5" /> Feature
              </button>
              <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                className="ml-auto p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
