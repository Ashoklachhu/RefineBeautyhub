'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  X, Plus, Minus, Search, Package, ShoppingBag,
  User, Phone, Mail, StickyNote, Check, ChevronDown,
  Store, Smartphone, MessageCircle, Globe, Headphones,
  CreditCard, Banknote, Wallet, BadgeCheck, Trash2,
} from 'lucide-react'
import { adminCreateManualOrder, adminGetProducts } from '@/app/actions/admin'
import type { Product, ShopOrderSource, ShopPaymentMethod, ProductOrderStatus } from '@/types/database'

// ─── Source options ───────────────────────────────────────────
const SOURCES: { value: ShopOrderSource; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { value: 'walk_in',   label: 'Walk-in',   icon: Store,         color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { value: 'phone',     label: 'Phone',     icon: Headphones,    color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
  { value: 'instagram', label: 'Instagram', icon: Smartphone,    color: 'text-pink-500',    bg: 'bg-pink-500/10'    },
  { value: 'whatsapp',  label: 'WhatsApp',  icon: MessageCircle, color: 'text-green-500',   bg: 'bg-green-500/10'   },
  { value: 'online',    label: 'Online',    icon: Globe,         color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
  { value: 'other',     label: 'Other',     icon: ShoppingBag,   color: 'text-gray-500',    bg: 'bg-gray-500/10'    },
]

// ─── Payment methods ──────────────────────────────────────────
const PAYMENTS: { value: ShopPaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'cash',    label: 'Cash',    icon: Banknote    },
  { value: 'card',    label: 'Card',    icon: CreditCard  },
  { value: 'esewa',   label: 'eSewa',   icon: Wallet      },
  { value: 'khalti',  label: 'Khalti',  icon: Wallet      },
  { value: 'fonepay', label: 'FonePay', icon: Smartphone  },
  { value: 'credit',  label: 'Credit',  icon: BadgeCheck  },
  { value: 'other',   label: 'Other',   icon: Wallet      },
]

// ─── Status options for manual orders ─────────────────────────
const STATUSES: { value: ProductOrderStatus; label: string; desc: string }[] = [
  { value: 'confirmed', label: 'Confirmed', desc: 'Payment received, order confirmed' },
  { value: 'pending',   label: 'Pending',   desc: 'Awaiting confirmation or payment' },
  { value: 'ready',     label: 'Ready',     desc: 'Order packed and ready to hand over' },
  { value: 'completed', label: 'Completed', desc: 'Order fully handed to customer' },
]

interface CartItem {
  product:  Product
  quantity: number
}

interface Props {
  onClose: () => void
}

export function ManualOrderPanel({ onClose }: Props) {
  const router          = useRouter()
  const [, start]       = useTransition()
  const panelRef        = useRef<HTMLDivElement>(null)

  // Products
  const [products,     setProducts]     = useState<Product[]>([])
  const [loadingProds, setLoadingProds] = useState(true)
  const [productSearch, setProductSearch] = useState('')

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])

  // Form fields
  const [source,        setSource]        = useState<ShopOrderSource>('walk_in')
  const [paymentMethod, setPaymentMethod] = useState<ShopPaymentMethod | ''>('cash')
  const [orderStatus,   setOrderStatus]   = useState<ProductOrderStatus>('confirmed')
  const [custName,      setCustName]      = useState('')
  const [custEmail,     setCustEmail]     = useState('')
  const [custPhone,     setCustPhone]     = useState('')
  const [notes,         setNotes]         = useState('')

  const [step,       setStep]       = useState<'items' | 'customer' | 'confirm'>('items')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState<{ reference: string } | null>(null)

  // Load products
  useEffect(() => {
    adminGetProducts().then(data => { setProducts(data); setLoadingProds(false) })
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const filteredProducts = productSearch.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
      )
    : products.filter(p => p.is_active && p.in_stock)

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, 99)) } : i)
        .filter(i => i.quantity > 0)
    )
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }

  function setQty(productId: string, qty: number) {
    if (qty < 1) { removeFromCart(productId); return }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: Math.min(qty, 99) } : i))
  }

  async function handleSubmit() {
    if (cart.length === 0) { toast.error('Add at least one product'); return }
    if (!custName.trim()) { toast.error('Customer name is required'); return }

    setSubmitting(true)
    start(async () => {
      const { reference, error } = await adminCreateManualOrder({
        customer_name:   custName.trim(),
        customer_email:  custEmail.trim() || undefined,
        customer_phone:  custPhone.trim() || undefined,
        notes:           notes.trim() || undefined,
        source,
        payment_method:  paymentMethod || undefined,
        status:          orderStatus,
        items: cart.map(i => ({
          product_id:   i.product.id,
          product_name: i.product.name,
          image_url:    i.product.image_url,
          unit_price:   i.product.price,
          quantity:     i.quantity,
        })),
      })

      if (error) {
        toast.error(error)
        setSubmitting(false)
      } else {
        setSubmitted({ reference: reference! })
        router.refresh()
      }
    })
  }

  // ─── Success screen ─────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" />
        <div ref={panelRef} className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-neutral-900 shadow-2xl">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Created!</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-1">Reference number</p>
            <p className="text-2xl font-mono font-bold text-gold-400 mb-6">{submitted.reference}</p>
            <div className="w-full bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 text-left mb-6 space-y-1.5">
              {cart.map(i => (
                <div key={i.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-neutral-300 truncate">{i.product.name} × {i.quantity}</span>
                  <span className="font-medium text-gray-900 dark:text-white ml-4 flex-shrink-0">NPR {fmt(i.product.price * i.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-white/10 pt-2 mt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>NPR {fmt(cartTotal)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </>
    )
  }

  const sourceInfo   = SOURCES.find(s => s.value === source)!
  const SourceIcon   = sourceInfo.icon

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Panel */}
      <div ref={panelRef} className="fixed inset-y-0 right-0 z-50 w-full max-w-lg flex flex-col bg-white dark:bg-neutral-900 shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">New Manual Order</h2>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                {cart.length === 0 ? 'Add products to get started' : `${cartCount} item${cartCount !== 1 ? 's' : ''} · NPR ${fmt(cartTotal)}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step tabs ── */}
        <div className="flex border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          {(['items', 'customer', 'confirm'] as const).map((s, idx) => (
            <button
              key={s}
              onClick={() => { if (s === 'customer' && cart.length === 0) return; if (s === 'confirm' && !custName.trim()) return; setStep(s) }}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors border-b-2
                ${step === s
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0
                  ${step === s ? 'bg-gold-400 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400'}`}>
                  {idx + 1}
                </span>
                {s === 'items' ? 'Products' : s === 'customer' ? 'Customer' : 'Confirm'}
              </span>
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* STEP 1 — Products */}
          {step === 'items' && (
            <div className="flex flex-col h-full">
              {/* Source selector */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Order Source</p>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCES.map(src => {
                    const Icon   = src.icon
                    const active = source === src.value
                    return (
                      <button
                        key={src.value}
                        onClick={() => setSource(src.value)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all
                          ${active
                            ? `${src.bg} ${src.color} border-current/30`
                            : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}
                      >
                        <Icon className="w-3 h-3" />
                        {src.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Product search */}
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search products…"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="admin-input w-full pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Products grid */}
              <div className="flex-1 overflow-y-auto px-5 py-3">
                {loadingProds ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-neutral-600" />
                    <p className="text-xs text-gray-400 dark:text-neutral-500">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredProducts.map(p => {
                      const cartItem = cart.find(i => i.product.id === p.id)
                      const inCart   = !!cartItem
                      return (
                        <div
                          key={p.id}
                          className={`relative rounded-xl border transition-all overflow-hidden cursor-pointer group
                            ${inCart
                              ? 'border-gold-400/40 bg-gold-500/5'
                              : 'border-gray-200 dark:border-white/5 bg-white dark:bg-neutral-800/50 hover:border-gray-300 dark:hover:border-white/10'}`}
                          onClick={() => addToCart(p)}
                        >
                          {/* Image */}
                          <div className="w-full h-20 bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                            {p.image_url
                              ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300 dark:text-neutral-600" /></div>}
                          </div>
                          {/* Info */}
                          <div className="p-2.5">
                            <p className="text-[11px] font-medium text-gray-900 dark:text-white leading-tight truncate">{p.name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-neutral-500 capitalize mt-0.5">{p.category}</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">NPR {fmt(p.price)}</p>
                          </div>
                          {/* In cart badge */}
                          {inCart && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white">{cartItem.quantity}</span>
                            </div>
                          )}
                          {/* Out of stock overlay */}
                          {!p.in_stock && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-neutral-900/70 flex items-center justify-center">
                              <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500">Out of stock</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Cart summary strip */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-white/5 px-5 py-3 bg-gray-50/80 dark:bg-neutral-800/30 flex-shrink-0">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Cart</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3">
                    {cart.map(i => (
                      <div key={i.product.id} className="flex items-center gap-2">
                        <p className="text-xs text-gray-700 dark:text-neutral-300 flex-1 truncate">{i.product.name}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(i.product.id, -1)} className="w-5 h-5 rounded flex items-center justify-center bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <input
                            type="number"
                            min={1} max={99}
                            value={i.quantity}
                            onChange={e => setQty(i.product.id, parseInt(e.target.value) || 1)}
                            className="w-8 text-center text-xs font-medium bg-transparent text-gray-900 dark:text-white border-none outline-none"
                          />
                          <button onClick={() => updateQty(i.product.id, 1)} className="w-5 h-5 rounded flex items-center justify-center bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white w-16 text-right flex-shrink-0">
                          NPR {fmt(i.product.price * i.quantity)}
                        </p>
                        <button onClick={() => removeFromCart(i.product.id)} className="text-gray-300 dark:text-neutral-600 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Total: NPR {fmt(cartTotal)}</span>
                    <button
                      onClick={() => setStep('customer')}
                      className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Customer info */}
          {step === 'customer' && (
            <div className="px-5 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Customer Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Customer name"
                        value={custName}
                        onChange={e => setCustName(e.target.value)}
                        className="admin-input w-full pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="+977 98XXXXXXXX"
                        value={custPhone}
                        onChange={e => setCustPhone(e.target.value)}
                        className="admin-input w-full pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="customer@email.com"
                        value={custEmail}
                        onChange={e => setCustEmail(e.target.value)}
                        className="admin-input w-full pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Payment Method</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {PAYMENTS.map(pm => {
                    const Icon   = pm.icon
                    const active = paymentMethod === pm.value
                    return (
                      <button
                        key={pm.value}
                        onClick={() => setPaymentMethod(pm.value)}
                        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-[10px] font-medium transition-all
                          ${active
                            ? 'bg-gold-500/10 border-gold-400/40 text-gold-400'
                            : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-white/5 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-white/10'}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {pm.label}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPaymentMethod('')}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-[10px] font-medium transition-all
                      ${!paymentMethod
                        ? 'bg-gray-200 dark:bg-neutral-700 border-gray-300 dark:border-white/10 text-gray-600 dark:text-neutral-300'
                        : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-white/5 text-gray-400 dark:text-neutral-500 hover:border-gray-300'}`}
                  >
                    <X className="w-3.5 h-3.5" />
                    None
                  </button>
                </div>
              </div>

              {/* Order status */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Initial Status</p>
                <div className="space-y-1.5">
                  {STATUSES.map(s => (
                    <label
                      key={s.value}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all
                        ${orderStatus === s.value
                          ? 'bg-gold-500/5 border-gold-400/30'
                          : 'bg-gray-50 dark:bg-neutral-800/50 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}
                    >
                      <input type="radio" name="status" value={s.value} checked={orderStatus === s.value} onChange={() => setOrderStatus(s.value)} className="mt-0.5 accent-amber-500" />
                      <div>
                        <p className={`text-xs font-medium capitalize ${orderStatus === s.value ? 'text-gold-400' : 'text-gray-700 dark:text-neutral-300'}`}>{s.label}</p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">{s.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1">Order Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <StickyNote className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                  <textarea
                    rows={3}
                    placeholder="Any special instructions or notes…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="admin-input w-full pl-9 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={() => { if (!custName.trim()) { toast.error('Customer name required'); return } setStep('confirm') }}
                className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Review Order →
              </button>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 'confirm' && (
            <div className="px-5 py-5 space-y-4">
              {/* Source badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${sourceInfo.bg}`}>
                <SourceIcon className={`w-3.5 h-3.5 ${sourceInfo.color}`} />
                <span className={`text-xs font-semibold ${sourceInfo.color}`}>{sourceInfo.label} Order</span>
              </div>

              {/* Customer summary */}
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-4 space-y-1.5">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Customer</p>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{custName}</span>
                </div>
                {custPhone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /><span className="text-xs text-gray-600 dark:text-neutral-300">{custPhone}</span></div>}
                {custEmail && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /><span className="text-xs text-gray-600 dark:text-neutral-300">{custEmail}</span></div>}
              </div>

              {/* Order items */}
              <div className="rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-200 dark:border-white/5">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Items</p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {cart.map(i => (
                    <div key={i.product.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-700 flex-shrink-0">
                        {i.product.image_url
                          ? <img src={i.product.image_url} alt="" className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 m-auto mt-2 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{i.product.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500">NPR {fmt(i.product.price)} × {i.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">NPR {fmt(i.product.price * i.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-neutral-800/50 border-t border-gray-200 dark:border-white/5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">NPR {fmt(cartTotal)}</span>
                </div>
              </div>

              {/* Meta: payment + status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mb-1">Payment</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize">{paymentMethod || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mb-1">Status</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize">{orderStatus}</p>
                </div>
              </div>

              {notes && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-xl px-3 py-2.5">
                  <StickyNote className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 italic">{notes}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Order…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm &amp; Create Order
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
