import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label:       string
  value:       string | number
  prev?:       number   // raw number for % calculation
  current?:    number   // raw number for % calculation
  icon:        LucideIcon
  color?:      'gold' | 'blue' | 'green' | 'purple' | 'rose'
  format?:     'number' | 'currency'
  subtitle?:   string
}

const COLORS = {
  gold:   { icon: 'text-amber-500',   bg: 'bg-amber-500/10' },
  blue:   { icon: 'text-blue-500',    bg: 'bg-blue-500/10'  },
  green:  { icon: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  purple: { icon: 'text-violet-500',  bg: 'bg-violet-500/10' },
  rose:   { icon: 'text-rose-500',    bg: 'bg-rose-500/10'  },
}

function calcChange(current?: number, prev?: number) {
  if (current === undefined || prev === undefined) return null
  if (prev === 0) return current > 0 ? 100 : 0
  return Math.round(((current - prev) / prev) * 100)
}

export function MetricCard({ label, value, prev, current, icon: Icon, color = 'gold', subtitle }: MetricCardProps) {
  const c      = COLORS[color]
  const change = calcChange(current, prev)

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1.5">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>

      {change !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          {change > 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : change < 0 ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
          )}
          <span className={`text-xs font-medium ${
            change > 0 ? 'text-emerald-500' : change < 0 ? 'text-rose-500' : 'text-gray-400 dark:text-neutral-500'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-[10px] text-gray-400 dark:text-neutral-500">vs prev period</span>
        </div>
      )}
    </div>
  )
}
