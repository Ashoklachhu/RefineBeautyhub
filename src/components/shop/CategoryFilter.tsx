'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Scissors, Sparkles, Heart, Gem, Wind, Wrench, Grid3X3, Droplets } from 'lucide-react'

const CATEGORIES = [
  { value: 'all',       label: 'All Products', Icon: Grid3X3 },
  { value: 'hair',      label: 'Hair',          Icon: Scissors },
  { value: 'skin',      label: 'Skin',          Icon: Sparkles },
  { value: 'body',      label: 'Body',          Icon: Heart },
  { value: 'nails',     label: 'Nails',         Icon: Gem },
  { value: 'fragrance', label: 'Fragrance',     Icon: Wind },
  { value: 'tools',     label: 'Tools',         Icon: Wrench },
  { value: 'other',     label: 'Other',         Icon: Droplets },
] as const

interface Props {
  current: string
}

export function CategoryFilter({ current }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function select(value: string) {
    const sp = new URLSearchParams(params.toString())
    if (value === 'all') sp.delete('category')
    else sp.set('category', value)
    router.push(`/shop?${sp.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(({ value, label, Icon }) => {
        const active = current === value || (value === 'all' && !current)
        return (
          <button
            key={value}
            onClick={() => select(value)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={active ? {
              background: '#1a1410',
              color: '#fff',
              border: '1px solid #1a1410',
            } : {
              background: '#fff',
              color: '#7a6a5e',
              border: '1px solid #e8ddd4',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.borderColor = '#b8976b'
                e.currentTarget.style.color = '#1a1410'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.borderColor = '#e8ddd4'
                e.currentTarget.style.color = '#7a6a5e'
              }
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
