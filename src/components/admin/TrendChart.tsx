'use client'

import { useState, useRef } from 'react'

export interface TrendSeries {
  label:   string
  color:   string
  data:    number[]
  format?: 'number' | 'currency'
}

interface TrendChartProps {
  labels:  string[]
  series:  TrendSeries[]
  height?: number
}

function fmtVal(v: number, format?: 'number' | 'currency'): string {
  if (format === 'currency') {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 100_000)   return `${(v / 100_000).toFixed(1)}L`
    if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`
    return `${v}`
  }
  return String(v)
}

function fmtFull(v: number, format?: 'number' | 'currency'): string {
  if (format === 'currency') return `NPR ${new Intl.NumberFormat('en-NP').format(v)}`
  return new Intl.NumberFormat('en-NP').format(v)
}

export function TrendChart({ labels, series, height = 220 }: TrendChartProps) {
  const svgRef   = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const W = 600
  const H = height
  const P = { top: 16, right: 16, bottom: 34, left: 46 }
  const cW = W - P.left - P.right
  const cH = H - P.top  - P.bottom

  const n = labels.length
  if (n === 0 || series.length === 0) return (
    <div style={{ height }} className="flex items-center justify-center">
      <p className="text-xs text-gray-400 dark:text-neutral-500">No data for this period</p>
    </div>
  )

  const allVals = series.flatMap(s => s.data)
  const maxVal  = Math.max(...allVals, 1)
  const yMax    = maxVal * 1.12  // 12% headroom

  const xPos = (i: number) => P.left + (n === 1 ? cW / 2 : (i / (n - 1)) * cW)
  const yPos = (v: number) => P.top  + cH - (v / yMax) * cH

  // Y-axis ticks (5 levels)
  const TICKS = 4
  const yTicks = Array.from({ length: TICKS + 1 }, (_, i) => (yMax / TICKS) * i)

  // X-axis: show at most 9 labels
  const labelEvery = Math.max(1, Math.ceil(n / 9))

  function buildLine(data: number[]) {
    if (n === 1) return `M ${xPos(0)} ${yPos(data[0])}`
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(v).toFixed(1)}`).join(' ')
  }

  function buildArea(data: number[]) {
    const bottom = (P.top + cH).toFixed(1)
    const line   = buildLine(data)
    if (n === 1) return `${line} L ${xPos(0).toFixed(1)} ${bottom} Z`
    return `${line} L ${xPos(n - 1).toFixed(1)} ${bottom} L ${xPos(0).toFixed(1)} ${bottom} Z`
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || n < 2) return
    const relX  = ((e.clientX - rect.left) / rect.width) * W - P.left
    const idx   = Math.round((relX / cW) * (n - 1))
    setHover(Math.max(0, Math.min(idx, n - 1)))
  }

  // Tooltip positioning: keep it from clipping edges
  const hoverPct = hover !== null ? (xPos(hover) / W) * 100 : 50
  const tooltipLeft = Math.min(Math.max(hoverPct, 12), 78)

  return (
    <div className="relative select-none" onMouseLeave={() => setHover(null)}>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">{s.label}</span>
          </div>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full text-gray-400 dark:text-neutral-500"
        onMouseMove={handleMouseMove}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines + Y labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={P.left} x2={W - P.right}
              y1={yPos(tick).toFixed(1)} y2={yPos(tick).toFixed(1)}
              stroke="currentColor" strokeOpacity={i === 0 ? 0 : 0.08} strokeWidth={1}
            />
            {i > 0 && (
              <text
                x={P.left - 7} y={yPos(tick)}
                textAnchor="end" dominantBaseline="middle"
                fontSize={9} fill="currentColor" opacity={0.55}
              >
                {fmtVal(Math.round(tick), series[0]?.format)}
              </text>
            )}
          </g>
        ))}

        {/* Bottom axis line */}
        <line
          x1={P.left} x2={W - P.right}
          y1={P.top + cH} y2={P.top + cH}
          stroke="currentColor" strokeOpacity={0.12} strokeWidth={1}
        />

        {/* X labels */}
        {labels.map((lbl, i) => (
          i % labelEvery === 0 && (
            <text
              key={i}
              x={xPos(i)} y={H - P.bottom + 15}
              textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.5}
            >
              {lbl}
            </text>
          )
        ))}

        {/* Area fills */}
        {series.map((s, si) => (
          <path key={`area-${si}`} d={buildArea(s.data)} fill={`url(#grad-${si})`} />
        ))}

        {/* Lines */}
        {series.map((s, si) => (
          <path
            key={`line-${si}`}
            d={buildLine(s.data)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Hover crosshair */}
        {hover !== null && (
          <line
            x1={xPos(hover)} x2={xPos(hover)}
            y1={P.top} y2={P.top + cH}
            stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="3,3"
          />
        )}

        {/* Hover dots */}
        {hover !== null && series.map((s, si) => (
          <circle
            key={`dot-${si}`}
            cx={xPos(hover!)} cy={yPos(s.data[hover!])}
            r={4.5} fill={s.color} stroke="white" strokeWidth={2}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="absolute top-8 pointer-events-none z-10 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl px-3 py-2.5 min-w-[140px]"
          style={{ left: `${tooltipLeft}%`, transform: 'translateX(-50%)' }}
        >
          <p className="text-[11px] font-semibold text-gray-900 dark:text-white mb-1.5">
            {labels[hover]}
          </p>
          {series.map((s, si) => (
            <div key={si} className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 truncate">{s.label}</span>
              <span className="text-[10px] font-semibold text-gray-900 dark:text-white ml-auto pl-2 whitespace-nowrap">
                {fmtFull(s.data[hover!], s.format)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
