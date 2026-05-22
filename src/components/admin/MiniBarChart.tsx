'use client'

interface Bar { label: string; value: number }

interface MiniBarChartProps {
  data:    Bar[]
  height?: number
  color?:  string
  format?: 'number' | 'currency'
}

function fmt(v: number, format: 'number' | 'currency') {
  if (format === 'currency') return `NPR ${new Intl.NumberFormat('en-NP').format(v)}`
  return String(v)
}

export function MiniBarChart({ data, height = 120, color = 'oklch(0.83 0.12 72)', format = 'number' }: MiniBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end gap-1.5 h-full pb-5 relative">
        {data.map((bar, i) => {
          const pct = bar.value / max
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full group">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{ height: `${Math.max(pct * (height - 28), 2)}px`, backgroundColor: color, opacity: 0.8 + pct * 0.2 }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity
                  bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                  {fmt(bar.value, format)}
                </div>
              </div>
              <span className="text-[9px] text-gray-400 dark:text-neutral-500 truncate w-full text-center">{bar.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
