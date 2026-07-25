'use client'

import { MapPin, Plus, Trash2, ArrowUp, ArrowDown, Phone, Navigation, Building2 } from 'lucide-react'
import { branchIdFromName } from '@/lib/branches'
import type { BranchInfo } from '@/types/database'

interface Props {
  branches: BranchInfo[]
  onChange: (next: BranchInfo[]) => void
}

function emptyBranch(): BranchInfo {
  return { id: '', name: '', address: '', phone: '', map_url: '' }
}

export function BranchesEditor({ branches, onChange }: Props) {
  function update(index: number, patch: Partial<BranchInfo>) {
    onChange(branches.map((b, i) => {
      if (i !== index) return b
      const merged = { ...b, ...patch }
      // Keep the id in step with the name until the branch has been saved once,
      // so existing bookings never lose the branch they point at.
      if (patch.name !== undefined && !b.id) merged.id = branchIdFromName(patch.name)
      return merged
    }))
  }

  function add() {
    onChange([...branches, emptyBranch()])
  }

  function remove(index: number) {
    if (!confirm('Remove this branch? It will disappear from your contact page and footer.')) return
    onChange(branches.filter((_, i) => i !== index))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= branches.length) return
    const next = [...branches]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold-400" />
            Branches &amp; Locations
          </h3>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
            Every branch here appears on your contact page and in the website footer, in this order.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-xs font-medium transition-colors flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Branch
        </button>
      </div>

      {branches.length === 0 && (
        <div
          onClick={add}
          className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-gold-400/40 hover:bg-gold-500/5 transition-all group"
        >
          <MapPin className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto mb-2 group-hover:text-gold-400/60 transition-colors" />
          <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">No branches yet</p>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">Click to add your first location</p>
        </div>
      )}

      {branches.map((branch, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-800/50 p-4 space-y-3"
        >
          {/* Row header */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-neutral-400">
              <span className="w-5 h-5 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center text-[10px] font-semibold">
                {index + 1}
              </span>
              {branch.name?.trim() || 'New branch'}
              {index === 0 && branches.length > 1 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400">
                  Main
                </span>
              )}
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="Move up"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === branches.length - 1} title="Move down"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-colors">
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => remove(index)} title="Remove branch"
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /> Branch name
              </label>
              <input
                value={branch.name}
                onChange={e => update(index, { name: e.target.value })}
                placeholder="Jadibuti Branch"
                className="admin-input w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /> Phone
              </label>
              <input
                value={branch.phone}
                onChange={e => update(index, { phone: e.target.value })}
                placeholder="+977-1-4123456"
                className="admin-input w-full"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /> Address
              </label>
              <input
                value={branch.address}
                onChange={e => update(index, { address: e.target.value })}
                placeholder="Jadibuti, Kathmandu, Nepal"
                className="admin-input w-full"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /> Google Maps link
              </label>
              <input
                type="url"
                value={branch.map_url}
                onChange={e => update(index, { map_url: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className="admin-input w-full"
              />
              <p className="text-[10px] text-gray-400 dark:text-neutral-600">
                Open the branch in Google Maps, press Share, and paste the link here.
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
