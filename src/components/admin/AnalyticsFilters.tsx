'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { CalendarRange, ChevronDown } from 'lucide-react'

interface Preset {
  label: string
  from:  string
  to:    string
  key:   string
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoISO(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function yearStartISO() {
  return `${new Date().getFullYear()}-01-01`
}

function getPresets(): Preset[] {
  const today = todayISO()
  return [
    { key: 'today', label: 'Today',     from: today,           to: today },
    { key: '7d',    label: '7 Days',    from: daysAgoISO(6),   to: today },
    { key: '30d',   label: '30 Days',   from: daysAgoISO(29),  to: today },
    { key: '90d',   label: '90 Days',   from: daysAgoISO(89),  to: today },
    { key: 'year',  label: 'This Year', from: yearStartISO(),  to: today },
  ]
}

interface Props {
  currentFrom: string
  currentTo:   string
}

export function AnalyticsFilters({ currentFrom, currentTo }: Props) {
  const router     = useRouter()
  const pathname   = usePathname()
  const [, start]  = useTransition()
  const [showCustom, setShowCustom] = useState(false)
  const [customFrom, setCustomFrom] = useState(currentFrom)
  const [customTo,   setCustomTo]   = useState(currentTo)

  const presets = getPresets()

  function isPresetActive(p: Preset) {
    return p.from === currentFrom && p.to === currentTo
  }

  const anyPresetActive = presets.some(isPresetActive)

  function navigate(from: string, to: string) {
    start(() => {
      router.push(`${pathname}?from=${from}&to=${to}`)
    })
  }

  function applyCustom() {
    if (customFrom && customTo && customFrom <= customTo) {
      navigate(customFrom, customTo)
      setShowCustom(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset pills */}
      {presets.map(p => (
        <button
          key={p.key}
          onClick={() => navigate(p.from, p.to)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isPresetActive(p)
              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
              : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-white/5 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/10'
          }`}
        >
          {p.label}
        </button>
      ))}

      {/* Custom range toggle */}
      <div className="relative">
        <button
          onClick={() => setShowCustom(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            !anyPresetActive
              ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
              : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-white/5 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CalendarRange className="w-3 h-3" />
          Custom
          <ChevronDown className={`w-3 h-3 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
        </button>

        {showCustom && (
          <div className="absolute top-full mt-2 left-0 z-20 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-4 min-w-[280px]">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Custom Date Range</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-neutral-500 mb-1">From</label>
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || todayISO()}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="admin-input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-neutral-500 mb-1">To</label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={todayISO()}
                  onChange={e => setCustomTo(e.target.value)}
                  className="admin-input w-full text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyCustom}
                disabled={!customFrom || !customTo || customFrom > customTo}
                className="flex-1 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCustom(false)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current range label (when custom is active) */}
      {!anyPresetActive && (
        <span className="text-xs text-gray-400 dark:text-neutral-500">
          {currentFrom} → {currentTo}
        </span>
      )}
    </div>
  )
}
