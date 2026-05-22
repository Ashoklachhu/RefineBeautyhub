type Color = 'yellow' | 'green' | 'blue' | 'red' | 'gray' | 'gold' | 'purple'

const styles: Record<Color, string> = {
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  red:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
  gray:   'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  gold:   'bg-gold-500/10 text-gold-400 border-gold-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const dot: Record<Color, string> = {
  yellow: 'bg-yellow-400', green: 'bg-emerald-400', blue: 'bg-blue-400',
  red: 'bg-rose-400', gray: 'bg-neutral-400', gold: 'bg-gold-400', purple: 'bg-purple-400',
}

interface AdminBadgeProps {
  label: string
  color: Color
  withDot?: boolean
}

export function AdminBadge({ label, color, withDot = true }: AdminBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[color]}`}>
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${dot[color]}`} />}
      {label}
    </span>
  )
}
