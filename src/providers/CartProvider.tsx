'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Product } from '@/types/database'

// ── Types ─────────────────────────────────────────────────────

export interface CartItem {
  product:  Product
  quantity: number
}

interface CartContextType {
  items:        CartItem[]
  addItem:      (product: Product, qty?: number) => void
  removeItem:   (productId: string) => void
  updateQty:    (productId: string, qty: number) => void
  clearCart:    () => void
  count:        number   // total units
  total:        number   // total price
  isOpen:       boolean
  openCart:     () => void
  closeCart:    () => void
}

// ── Context ───────────────────────────────────────────────────

const CartContext = createContext<CartContextType>({
  items:      [],
  addItem:    () => {},
  removeItem: () => {},
  updateQty:  () => {},
  clearCart:  () => {},
  count:      0,
  total:      0,
  isOpen:     false,
  openCart:   () => {},
  closeCart:  () => {},
})

export function useCart() { return useContext(CartContext) }

// ── Provider ──────────────────────────────────────────────────

const STORAGE_KEY = 'rbh-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items,  setItems]  = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, 20) }
            : i
        )
      }
      return [...prev, { product, quantity: Math.min(qty, 20) }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId))
    } else {
      setItems(prev =>
        prev.map(i => i.product.id === productId ? { ...i, quantity: Math.min(qty, 20) } : i)
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      count, total,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}
