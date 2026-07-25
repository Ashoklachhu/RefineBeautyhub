'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Plus, Trash2, Loader2, Film, X, Eye, EyeOff,
  ArrowUp, ArrowDown, Pencil, Check, PlayCircle,
} from 'lucide-react'
import {
  adminAddVideo, adminUpdateVideo, adminDeleteVideo,
  adminToggleVideoPublished, adminMoveVideo,
} from '@/app/actions/admin'
import { MAX_GALLERY_VIDEOS, videoPosterUrl, isPlayableVideoUrl } from '@/lib/video'
import type { VideoGalleryItem } from '@/types/database'

const inputClass =
  'w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl ' +
  'px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 ' +
  'dark:placeholder:text-neutral-500 focus:outline-none focus:border-gold-500/50'

// ─────────────────────────────────────────────────────────────
// Add panel — URL only; videos are uploaded in Cloudinary first
// ─────────────────────────────────────────────────────────────

function AddVideoPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [form, setForm] = useState({ video_url: '', title: '', caption: '' })
  const [saving, setSaving] = useState(false)

  const urlLooksValid = form.video_url === '' || isPlayableVideoUrl(form.video_url.trim())
  const preview = urlLooksValid && form.video_url ? videoPosterUrl(form.video_url.trim()) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    start(async () => {
      const { error } = await adminAddVideo(form)
      setSaving(false)
      if (error) { toast.error(error); return }
      toast.success('Video added to the reels gallery')
      setForm({ video_url: '', title: '', caption: '' })
      router.refresh()
      onClose()
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-950 border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add a Reel</h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Upload the video to Cloudinary, then paste its link here
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">
              Video URL *
            </label>
            <input
              required
              autoFocus
              type="url"
              value={form.video_url}
              onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
              placeholder="https://res.cloudinary.com/dosxengut/video/upload/v123/reel.mp4"
              className={inputClass}
            />
            {!urlLooksValid && (
              <p className="text-xs text-rose-500 mt-1.5">
                This should be a direct video link — usually ending in .mp4
              </p>
            )}
          </div>

          {preview && (
            <div className="flex justify-center">
              <div className="relative w-40 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-neutral-900"
                style={{ aspectRatio: '9 / 16' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt=""
                  onError={e => { e.currentTarget.style.display = 'none' }}
                  className="w-full h-full object-cover"
                />
                <PlayCircle className="absolute inset-0 m-auto w-9 h-9 text-white/90 drop-shadow" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">
              Title
            </label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Bridal Transformation"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">
              Caption
            </label>
            <input
              value={form.caption}
              onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
              placeholder="One short line shown under the title"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.video_url || !urlLooksValid}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add to Gallery
          </button>
        </form>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// One row
// ─────────────────────────────────────────────────────────────

function VideoRow({
  video, index, total, busy, onAction,
}: {
  video:  VideoGalleryItem
  index:  number
  total:  number
  busy:   boolean
  onAction: (fn: () => Promise<{ error?: string }>, successMessage?: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ title: video.title ?? '', caption: video.caption ?? '' })

  const poster = videoPosterUrl(video.video_url, video.poster_url)

  function save() {
    onAction(() => adminUpdateVideo(video.id, draft), 'Details saved')
    setEditing(false)
  }

  return (
    <div className="flex gap-4 p-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-neutral-900">
      {/* Thumbnail */}
      <div className="relative w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800"
        style={{ aspectRatio: '9 / 16' }}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            onError={e => { e.currentTarget.style.display = 'none' }}
            className="w-full h-full object-cover"
          />
        ) : (
          <Film className="absolute inset-0 m-auto w-6 h-6 text-gray-300 dark:text-neutral-600" />
        )}
        {!video.is_published && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <EyeOff className="w-4 h-4 text-white/80" />
          </div>
        )}
        <span className="absolute top-1 left-1 px-1.5 rounded-md bg-black/60 text-white text-[10px] font-medium">
          {index + 1}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-2">
        {editing ? (
          <>
            <input
              value={draft.title}
              onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className={inputClass}
            />
            <input
              value={draft.caption}
              onChange={e => setDraft(p => ({ ...p, caption: e.target.value }))}
              placeholder="Caption"
              className={inputClass}
            />
            <div className="flex gap-2">
              <button onClick={save}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-medium">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => { setEditing(false); setDraft({ title: video.title ?? '', caption: video.caption ?? '' }) }}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-white/5">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {video.title || <span className="text-gray-400 dark:text-neutral-500 italic">Untitled</span>}
            </p>
            {video.caption && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{video.caption}</p>
            )}
            <a href={video.video_url} target="_blank" rel="noopener noreferrer"
              className="block text-[11px] text-gray-400 dark:text-neutral-500 hover:text-gold-500 truncate transition-colors">
              {video.video_url}
            </a>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => onAction(() => adminMoveVideo(video.id, 'up'))}
            disabled={busy || index === 0}
            title="Move up"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAction(() => adminMoveVideo(video.id, 'down'))}
            disabled={busy || index === total - 1}
            title="Move down"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(v => !v)}
            title="Edit title & caption"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAction(
              () => adminToggleVideoPublished(video.id, !video.is_published),
              video.is_published ? 'Hidden from the website' : 'Now live on the website'
            )}
            disabled={busy}
            title={video.is_published ? 'Hide from website' : 'Show on website'}
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50
              ${video.is_published
                ? 'text-emerald-500 hover:bg-emerald-500/10'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            {video.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              if (!confirm('Remove this video from the gallery?')) return
              onAction(() => adminDeleteVideo(video.id), 'Video removed')
            }}
            disabled={busy}
            title="Delete"
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Manager
// ─────────────────────────────────────────────────────────────

export function VideoGalleryManager({ videos }: { videos: VideoGalleryItem[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [busy, setBusy] = useState(false)

  const atLimit = videos.length >= MAX_GALLERY_VIDEOS

  function runAction(fn: () => Promise<{ error?: string }>, successMessage?: string) {
    setBusy(true)
    start(async () => {
      const { error } = await fn()
      setBusy(false)
      if (error) { toast.error(error); return }
      if (successMessage) toast.success(successMessage)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {videos.length} of {MAX_GALLERY_VIDEOS} videos
            {videos.length > 0 && ` · ${videos.filter(v => v.is_published).length} live`}
          </p>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
            The first four show on the homepage; the rest slide in from the right.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={atLimit}
          title={atLimit ? `Limit of ${MAX_GALLERY_VIDEOS} reached — delete one first` : undefined}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium disabled:opacity-40 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Empty state */}
      {videos.length === 0 ? (
        <div
          onClick={() => setShowAdd(true)}
          className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-16 text-center cursor-pointer hover:border-gold-400/40 hover:bg-gold-500/5 transition-all group"
        >
          <Film className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3 group-hover:text-gold-400/60 transition-colors" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">No videos yet</p>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
            Click to paste your first Cloudinary video link
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video, i) => (
            <VideoRow
              key={video.id}
              video={video}
              index={i}
              total={videos.length}
              busy={busy}
              onAction={runAction}
            />
          ))}
        </div>
      )}

      {showAdd && <AddVideoPanel onClose={() => setShowAdd(false)} />}
    </div>
  )
}
