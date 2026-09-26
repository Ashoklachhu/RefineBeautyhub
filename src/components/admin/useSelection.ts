'use client'

import { useCallback, useMemo, useState } from 'react'

/**
 * Row selection for the admin tables.
 *
 * The visible-id filter is applied when reading rather than by pruning state
 * in an effect: rows that disappear (deleted, filtered out, or on another
 * page) drop out of the selection automatically, so a bulk action can never
 * target something the admin cannot see.
 */
export function useSelection<T extends { id: string }>(items: T[]) {
  const [raw, setRaw] = useState<Set<string>>(new Set())

  const visibleIds = useMemo(() => items.map(i => i.id), [items])

  const selected = useMemo(() => {
    if (raw.size === 0) return raw
    const visible = new Set(visibleIds)
    return new Set([...raw].filter(id => visible.has(id)))
  }, [raw, visibleIds])

  const toggle = useCallback((id: string) => {
    setRaw(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const allSelected = visibleIds.length > 0 && selected.size === visibleIds.length

  const toggleAll = useCallback(() => {
    setRaw(() => (allSelected ? new Set<string>() : new Set(visibleIds)))
  }, [allSelected, visibleIds])

  const clear = useCallback(() => setRaw(new Set()), [])

  return {
    ids: [...selected],
    count: selected.size,
    isSelected: (id: string) => selected.has(id),
    allSelected,
    someSelected: selected.size > 0 && selected.size < visibleIds.length,
    toggle,
    toggleAll,
    clear,
  }
}
