'use client'

import { Trash2, X, Loader2 } from 'lucide-react'

interface BulkBarProps {
  count:    number
  noun:     string           // singular, e.g. "lead"
  plural?:  string           // when adding "s" is wrong, e.g. "inquiries"
  busy?:    boolean
  onClear:  () => void
  onDelete: () => void
}

/**
 * Appears only when rows are selected. Sticks to the bottom so the action
 * stays reachable however far the admin has scrolled through a long table.
 */
export function BulkBar({ count, noun, plural, busy, onClear, onDelete }: BulkBarProps) {
  if (count === 0) return null

  const label = `${count} ${count === 1 ? noun : (plural ?? `${noun}s`)}`

  return (
    <div className="sticky bottom-4 z-30 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl
                      bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10
                      shadow-xl shadow-gray-400/20 dark:shadow-black/40">
        <span className="text-xs font-medium text-gray-700 dark:text-neutral-200">
          {label} selected
        </span>

        <button
          onClick={onClear}
          disabled={busy}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                     text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-white/5
                     disabled:opacity-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear
        </button>

        <button
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium
                     bg-rose-500/15 border border-rose-500/30 text-rose-500
                     hover:bg-rose-500/25 disabled:opacity-50 transition-colors"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Delete {label}
        </button>
      </div>
    </div>
  )
}

/** Checkbox styled to match the admin tables. */
export function RowCheckbox({
  checked, indeterminate, onChange, label,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      aria-label={label}
      ref={el => { if (el) el.indeterminate = Boolean(indeterminate && !checked) }}
      onChange={onChange}
      onClick={e => e.stopPropagation()}
      className="w-4 h-4 rounded accent-gold-500 cursor-pointer flex-shrink-0"
    />
  )
}
