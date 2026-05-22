'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Plus, Trash2, Star, X, Loader2, ImageIcon,
  Upload, Link2, CheckCircle2, CloudUpload, Copy, Check,
} from 'lucide-react'
import { adminAddGalleryItem, adminDeleteGalleryItem, adminToggleGalleryFeatured } from '@/app/actions/admin'
import { uploadImageAction, deleteCloudinaryImage } from '@/app/actions/upload'
import type { GalleryItem } from '@/types/database'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─────────────────────────────────────────────────────────────
// Upload drop zone
// ─────────────────────────────────────────────────────────────

interface UploadState {
  file:     File
  preview:  string
  status:   'pending' | 'uploading' | 'done' | 'error'
  url?:     string
  publicId?: string
  error?:   string
}

function DropZone({
  onUploaded,
}: {
  onUploaded: (url: string, publicId: string, file: File) => void
}) {
  const [dragging,  setDragging]  = useState(false)
  const [uploads,   setUploads]   = useState<UploadState[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (arr.length === 0) { toast.error('Please select image files only'); return }

    // Add all as pending first
    const newUploads: UploadState[] = arr.map(f => ({
      file:    f,
      preview: URL.createObjectURL(f),
      status:  'pending',
    }))
    setUploads(prev => [...prev, ...newUploads])

    // Upload each in parallel
    await Promise.all(
      newUploads.map(async (u, localIdx) => {
        const idx = uploads.length + localIdx  // position in combined array

        // Set uploading
        setUploads(prev => prev.map((p, i) =>
          i === idx ? { ...p, status: 'uploading' } : p
        ))

        const fd = new FormData()
        fd.append('file', u.file)
        const result = await uploadImageAction(fd)

        if (result.error || !result.data) {
          setUploads(prev => prev.map((p, i) =>
            i === idx ? { ...p, status: 'error', error: result.error } : p
          ))
          toast.error(`Failed: ${u.file.name} — ${result.error}`)
        } else {
          setUploads(prev => prev.map((p, i) =>
            i === idx ? { ...p, status: 'done', url: result.data!.url, publicId: result.data!.publicId } : p
          ))
          onUploaded(result.data.url, result.data.publicId, u.file)
        }
      })
    )
  }, [uploads.length, onUploaded])

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        onDragOver={e  => { e.preventDefault(); setDragging(true)  }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-2xl p-10 cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-gold-400 bg-gold-500/10 scale-[1.01]'
            : 'border-gray-200 dark:border-white/10 hover:border-gold-400/50 hover:bg-gold-500/5 bg-gray-50 dark:bg-neutral-800/50'}
        `}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
          ${dragging ? 'bg-gold-500/20' : 'bg-gray-100 dark:bg-neutral-700'}`}>
          <CloudUpload className={`w-7 h-7 transition-colors ${dragging ? 'text-gold-400' : 'text-gray-400 dark:text-neutral-400'}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
            {dragging ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
            or <span className="text-gold-500 font-medium">click to browse</span> · JPG, PNG, WEBP · max 10 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {/* Upload progress list */}
      {uploads.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {uploads.map((u, i) => (
            <div key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-white/5">
              {/* Thumbnail */}
              <img src={u.preview} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-neutral-200 truncate">{u.file.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500">{formatBytes(u.file.size)}</p>
              </div>

              {/* Status */}
              {u.status === 'uploading' && (
                <Loader2 className="w-4 h-4 text-gold-400 animate-spin flex-shrink-0" />
              )}
              {u.status === 'done' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              {u.status === 'error' && (
                <span title={u.error}>
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                </span>
              )}
              {u.status === 'pending' && (
                <span className="text-[10px] text-gray-400 dark:text-neutral-500">Queued</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Add image panel (slide-in form)
// ─────────────────────────────────────────────────────────────

interface PendingImage {
  url:       string
  publicId:  string
  name:      string
  title:     string
  altText:   string
  featured:  boolean
  saving:    boolean
  saved:     boolean
}

function AddImagePanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [tab, setTab]                 = useState<'upload' | 'url'>('upload')
  const [pending, setPending]         = useState<PendingImage[]>([])
  const [urlForm, setUrlForm]         = useState({ image_url: '', title: '', alt_text: '', is_featured: false })
  const [addingUrl, setAddingUrl]     = useState(false)

  // Called by DropZone when each image finishes uploading to Cloudinary
  function handleUploaded(url: string, publicId: string, file: File) {
    setPending(prev => [
      ...prev,
      {
        url,
        publicId,
        name:     file.name,
        title:    file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        altText:  '',
        featured: false,
        saving:   false,
        saved:    false,
      },
    ])
  }

  // Save one uploaded image to the gallery DB
  async function saveItem(idx: number) {
    const item = pending[idx]
    if (!item || item.saving || item.saved) return

    setPending(prev => prev.map((p, i) => i === idx ? { ...p, saving: true } : p))
    start(async () => {
      const { error } = await adminAddGalleryItem({
        image_url:  item.url,
        title:      item.title || undefined,
        alt_text:   item.altText || undefined,
        is_featured: item.featured,
      })
      if (error) {
        toast.error(error)
        setPending(prev => prev.map((p, i) => i === idx ? { ...p, saving: false } : p))
      } else {
        setPending(prev => prev.map((p, i) => i === idx ? { ...p, saving: false, saved: true } : p))
        toast.success(`"${item.title || 'Image'}" added to gallery`)
        router.refresh()
      }
    })
  }

  // Save all pending at once
  async function saveAll() {
    const unsaved = pending.map((p, i) => ({ p, i })).filter(({ p }) => !p.saved && !p.saving)
    for (const { i } of unsaved) await saveItem(i)
  }

  // Add by URL
  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault()
    if (!urlForm.image_url) return
    setAddingUrl(true)
    start(async () => {
      const { error } = await adminAddGalleryItem({
        image_url:   urlForm.image_url,
        title:       urlForm.title    || undefined,
        alt_text:    urlForm.alt_text || undefined,
        is_featured: urlForm.is_featured,
      })
      setAddingUrl(false)
      if (error) { toast.error(error); return }
      toast.success('Image added to gallery')
      setUrlForm({ image_url: '', title: '', alt_text: '', is_featured: false })
      router.refresh()
    })
  }

  const unsavedCount = pending.filter(p => !p.saved).length

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-white dark:bg-neutral-950 border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add to Gallery</h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Upload directly to Cloudinary or paste an image URL</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-white/10 px-6 flex-shrink-0">
          {([
            { key: 'upload', label: 'Upload File', icon: Upload },
            { key: 'url',    label: 'Paste URL',   icon: Link2  },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === key
                  ? 'border-gold-400 text-gold-500 dark:text-gold-400'
                  : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Upload tab ── */}
          {tab === 'upload' && (
            <>
              <DropZone onUploaded={handleUploaded} />

              {/* Pending images — title / alt / featured fields */}
              {pending.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                      Uploaded — {pending.length} image{pending.length !== 1 ? 's' : ''}
                    </p>
                    {unsavedCount > 1 && (
                      <button onClick={saveAll}
                        className="text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors">
                        Save all ({unsavedCount})
                      </button>
                    )}
                  </div>

                  {pending.map((item, idx) => (
                    <div key={idx}
                      className={`rounded-2xl border p-4 space-y-3 transition-colors
                        ${item.saved
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-900'}`}
                    >
                      <div className="flex gap-3">
                        {/* Preview */}
                        <img src={item.url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-200 dark:border-white/10" />

                        {/* Fields */}
                        <div className="flex-1 space-y-2">
                          <input
                            value={item.title}
                            onChange={e => setPending(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
                            disabled={item.saved}
                            placeholder="Title (optional)"
                            className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-60"
                          />
                          <input
                            value={item.altText}
                            onChange={e => setPending(prev => prev.map((p, i) => i === idx ? { ...p, altText: e.target.value } : p))}
                            disabled={item.saved}
                            placeholder="Alt text (for accessibility)"
                            className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-60"
                          />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.featured}
                              disabled={item.saved}
                              onChange={e => setPending(prev => prev.map((p, i) => i === idx ? { ...p, featured: e.target.checked } : p))}
                              className="w-3.5 h-3.5 rounded accent-amber-500"
                            />
                            <span className="text-xs text-gray-500 dark:text-neutral-400">Feature on homepage</span>
                          </label>
                        </div>
                      </div>

                      {/* Save / Saved button */}
                      {item.saved ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Saved to gallery
                        </div>
                      ) : (
                        <button
                          onClick={() => saveItem(idx)}
                          disabled={item.saving}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-xs font-medium disabled:opacity-50 transition-colors"
                        >
                          {item.saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Save to Gallery
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── URL tab ── */}
          {tab === 'url' && (
            <form onSubmit={handleAddUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">Image URL *</label>
                <input
                  required
                  type="url"
                  value={urlForm.image_url}
                  onChange={e => setUrlForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50"
                />
              </div>

              {urlForm.image_url && (
                <img
                  src={urlForm.image_url}
                  alt="Preview"
                  className="h-36 rounded-xl object-cover border border-gray-200 dark:border-white/10"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">Title</label>
                  <input
                    value={urlForm.title}
                    onChange={e => setUrlForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Bridal Makeup"
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">Alt Text</label>
                  <input
                    value={urlForm.alt_text}
                    onChange={e => setUrlForm(p => ({ ...p, alt_text: e.target.value }))}
                    placeholder="Describe the image"
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urlForm.is_featured}
                  onChange={e => setUrlForm(p => ({ ...p, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-xs text-gray-600 dark:text-neutral-300">Feature on homepage</span>
              </label>

              <button
                type="submit"
                disabled={addingUrl}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {addingUrl && <Loader2 className="w-4 h-4 animate-spin" />}
                Add to Gallery
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Gallery Manager
// ─────────────────────────────────────────────────────────────

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [showAdd,   setShowAdd]   = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [lightbox,  setLightbox]  = useState<GalleryItem | null>(null)
  const [copied,    setCopied]    = useState<string | null>(null)

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url)
    setCopied(id)
    toast.success('URL copied to clipboard')
    setTimeout(() => setCopied(prev => prev === id ? null : prev), 2000)
  }

  async function handleDelete(item: GalleryItem) {
    if (!confirm('Delete this image permanently? This cannot be undone.')) return
    setDeleting(item.id)
    start(async () => {
      const { error } = await adminDeleteGalleryItem(item.id)
      if (error) { toast.error(error); setDeleting(null); return }

      // Best-effort: also delete from Cloudinary if the URL is a Cloudinary URL
      const isCloudinary = item.image_url.includes('cloudinary.com')
      if (isCloudinary) {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<public_id>.<ext>
        const match = item.image_url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/)
        if (match?.[1]) {
          await deleteCloudinaryImage(match[1])
        }
      }

      toast.success('Image deleted')
      setDeleting(null)
      router.refresh()
    })
  }

  async function handleFeature(id: string, current: boolean) {
    start(async () => {
      const { error } = await adminToggleGalleryFeatured(id, !current)
      if (error) toast.error(error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {items.length} image{items.length !== 1 ? 's' : ''} in gallery
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Images
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div
          onClick={() => setShowAdd(true)}
          className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-16 text-center cursor-pointer hover:border-gold-400/40 hover:bg-gold-500/5 transition-all group"
        >
          <ImageIcon className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3 group-hover:text-gold-400/60 transition-colors" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">No images yet</p>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">Click to upload your first image</p>
        </div>
      )}

      {/* Gallery grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 cursor-pointer"
              onClick={() => setLightbox(item)}
            >
              <img
                src={item.image_url}
                alt={item.alt_text ?? ''}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                  {/* Copy URL */}
                  <button
                    onClick={() => copyUrl(item.id, item.image_url)}
                    title="Copy image URL"
                    className={`p-1.5 rounded-lg transition-colors ${
                      copied === item.id
                        ? 'bg-emerald-500/30 text-emerald-400'
                        : 'bg-black/50 text-gray-300 hover:text-blue-400'}`}
                  >
                    {copied === item.id
                      ? <Check className="w-3.5 h-3.5" />
                      : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Feature toggle */}
                  <button
                    onClick={() => handleFeature(item.id, item.is_featured)}
                    title={item.is_featured ? 'Unfeature' : 'Feature on homepage'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.is_featured
                        ? 'bg-gold-500/30 text-gold-400'
                        : 'bg-black/50 text-gray-300 hover:text-gold-400'}`}
                  >
                    <Star className="w-3.5 h-3.5" fill={item.is_featured ? 'currentColor' : 'none'} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.id}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 disabled:opacity-50 transition-colors"
                  >
                    {deleting === item.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {item.title && (
                  <p className="text-white text-[10px] font-medium truncate">{item.title}</p>
                )}
              </div>

              {/* Featured star badge */}
              {item.is_featured && (
                <div className="absolute top-1.5 left-1.5 pointer-events-none">
                  <Star className="w-3.5 h-3.5 text-gold-400 drop-shadow" fill="currentColor" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add image panel */}
      {showAdd && <AddImagePanel onClose={() => setShowAdd(false)} />}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
            <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); copyUrl(lightbox.id, lightbox.image_url) }}
              title="Copy image URL"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${copied === lightbox.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
            >
              {copied === lightbox.id
                ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                : <><Copy className="w-3.5 h-3.5" /> Copy URL</>}
            </button>
            <button className="p-2 text-white hover:text-gray-300 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt={lightbox.alt_text ?? ''}
              className="w-full max-h-[85vh] rounded-2xl object-contain"
            />
            {(lightbox.title || lightbox.alt_text) && (
              <div className="mt-3 text-center">
                {lightbox.title   && <p className="text-white font-medium">{lightbox.title}</p>}
                {lightbox.alt_text && <p className="text-gray-400 text-sm mt-0.5">{lightbox.alt_text}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
