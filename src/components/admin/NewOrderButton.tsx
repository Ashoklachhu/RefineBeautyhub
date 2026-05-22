'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ManualOrderPanel } from './ManualOrderPanel'

export function NewOrderButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        New Order
      </button>

      {open && <ManualOrderPanel onClose={() => setOpen(false)} />}
    </>
  )
}
