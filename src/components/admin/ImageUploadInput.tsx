'use client'

import { useState, useRef } from 'react'
import { Upload, Link2, X, Loader2, ImageIcon, RefreshCw } from 'lucide-react'
import { uploadImageAction } from '@/app/actions/upload'
import { toast } from 'sonner'

interface ImageUploadInputProps {
  value:       string              // current URL value
  onChange:    (url: string) => void
  folder?:     string              // Cloudinary subfolder e.g. "services" | "staff"
  label?:      string              // optional label override
  previewSize?: 'sm' | 'md' | 'lg' // sm=square thumb, md=landscape, lg=tall portrait
  className?:  string
}

export function ImageUploadInput({
  value,
  onChange,
  folder     = 'uploads',
  label      = 'Image',
  previewSize = 'md',
  className   = '',
}: ImageUploadInputProps) {
  const [tab,       setTab]       = useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const previewCls = {
    sm: 'h-20 w-20',
    md: 'h-32 w-full',
    lg: 'h-48 w-full',
  }[previewSize]

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Only image files are allowed'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('File must be under 10 MB'); return }

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    // Pass folder hint as a separate field — upload action reads it
    fd.append('folder', folder)

    const result = await uploadImageAction(fd)
    setUploading(false)

    if (result.error || !result.data) {
      toast.error(result.error ?? 'Upload failed')
    } else {
      onChange(result.data.url)
      toast.success('Image uploaded')
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 p-0.5 rounded-lg w-fit">
        {([
          { key: 'upload', icon: Upload, label: 'Upload' },
          { key: 'url',    icon: Link2,  label: 'URL'    },
        ] as const).map(({ key, icon: Icon, label: tabLabel }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all
              ${tab === key
                ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white'}`}
          >
            <Icon className="w-3 h-3" />
            {tabLabel}
          </button>
        ))}
      </div>

      {/* ── Upload tab ── */}
      {tab === 'upload' && (
        <>
          {/* Current image preview */}
          {value && !uploading && (
            <div className="relative group inline-block">
              <img
                src={value}
                alt={label}
                className={`${previewCls} rounded-xl object-cover border border-gray-200 dark:border-white/10`}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              {/* Replace overlay */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100
                           flex flex-col items-center justify-center gap-1.5 transition-opacity"
              >
                <RefreshCw className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-medium">Replace</span>
              </button>
              {/* Clear button */}
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white
                           flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Drop zone — shown when no image or uploading */}
          {(!value || uploading) && (
            <div
              onDragOver={e  => { e.preventDefault(); setDragOver(true)  }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`
                flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
                py-6 px-4 cursor-pointer transition-all
                ${uploading ? 'cursor-not-allowed opacity-60 border-gray-200 dark:border-white/10' : ''}
                ${dragOver  ? 'border-gold-400 bg-gold-500/10' : 'border-gray-200 dark:border-white/10 hover:border-gold-400/50 hover:bg-gold-500/5'}
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
                  <p className="text-xs text-gray-400 dark:text-neutral-500">Uploading to Cloudinary…</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-400 dark:text-neutral-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 dark:text-neutral-300">
                      Drop image or <span className="text-gold-500">click to browse</span>
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">
                      JPG, PNG, WEBP · max 10 MB
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </>
      )}

      {/* ── URL tab ── */}
      {tab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-white/10
                         rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-neutral-500
                         focus:outline-none focus:border-gold-500/50"
            />
            {value && (
              <button type="button" onClick={() => onChange('')}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {value && (
            <img
              src={value}
              alt="Preview"
              className="h-28 rounded-xl object-cover border border-gray-200 dark:border-white/10 w-full"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          )}
        </div>
      )}
    </div>
  )
}
