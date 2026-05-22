import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label:   string
  value:   string | number
  icon:    LucideIcon
  trend?:  number   // percent change
  sub?:    string
  color?:  'gold' | 'green' | 'blue' | 'purple' | 'rose'
}

const colors = {
  gold:   'bg-gold-500/10 text-gold-400',
  green:  'bg-emerald-500/10 text-emerald-400',
  blue:   'bg-blue-500/10 text-blue-400',
  purple: 'bg-purple-500/10 text-purple-400',
  rose:   'bg-rose-500/10 text-rose-400',
}

export function StatCard({ label, value, icon: Icon, trend, sub, color = 'gold' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
            ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : trend < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-neutral-400">{label}</p>
      {sub && <p className="text-xs text-gray-300 dark:text-neutral-600 mt-1">{sub}</p>}
    </div>
  )
}
