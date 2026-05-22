'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Minus, Plus, Trash2, ShoppingBag, ArrowRight,
  ArrowLeft, Loader2, CheckCircle2, Package, Sparkles,
} from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { createShopOrder } from '@/app/actions/shop'
import Link from 'next/link'

type View = 'cart' | 'checkout' | 'success'

// ── Helpers ───────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)

// ── Main Component ────────────────────────────────────────────

export function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, count, total, isOpen, closeCart } = useCart()

  const [view,    setView]    = useState<View>('cart')
  const [saving,  setSaving]  = useState(false)
  const [ref,     setRef]     = useState('')

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })

  function handleClose() {
    closeCart()
    // Reset to cart view on close (keep success visible until user dismisses)
    if (view !== 'success') setView('cart')
  }

  function handleSuccessClose() {
    clearCart()
    closeCart()
    setView('cart')
    setForm({ name: '', email: '', phone: '', notes: '' })
    setRef('')
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setSaving(true)

    const { reference, error } = await createShopOrder({
      customer_name:  form.name,
      customer_email: form.email,
      customer_phone: form.phone || undefined,
      notes:          form.notes || undefined,
      items: items.map(i => ({
        product_id:   i.product.id,
        product_name: i.product.name,
        image_url:    i.product.image_url,
        unit_price:   i.product.price,
        quantity:     i.quantity,
      })),
    })

    setSaving(false)
    if (error) { alert('Something went wrong. Please try again.'); return }
    setRef(reference ?? '')
    setView('success')
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    border: '1px solid #e8ddd4',
    color: '#1a1410',
    transition: 'border-color 0.15s',
  } as React.CSSProperties

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = '#b8976b')
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = '#e8ddd4')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={view === 'success' ? handleSuccessClose : handleClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col shadow-2xl"
            style={{ background: '#fdfaf7', borderLeft: '1px solid #e8ddd4' }}
          >
            <AnimatePresence mode="wait">

              {/* ══ CART VIEW ══════════════════════════════════ */}
              {view === 'cart' && (
                <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col h-full">

                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
                    style={{ borderColor: '#e8ddd4' }}>
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4" style={{ color: '#b8976b' }} />
                      <span className="text-sm font-semibold tracking-wide" style={{ color: '#1a1410' }}>
                        Your Selection
                      </span>
                      {count > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: '#f0e8e0', color: '#7a6a5e' }}>
                          {count} item{count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button onClick={handleClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
                      style={{ color: '#9a8070' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Items */}
                  <div className="flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: '#f5ede3' }}>
                          <Package className="w-7 h-7" style={{ color: '#c8b89a' }} />
                        </div>
                        <div>
                          <p className="text-base font-light mb-1"
                            style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                            Your selection is empty
                          </p>
                          <p className="text-sm" style={{ color: '#9a8070' }}>
                            Add products from our curated edit
                          </p>
                        </div>
                        <Link href="/shop" onClick={handleClose}
                          className="text-xs font-semibold uppercase tracking-wider underline-offset-4 hover:underline"
                          style={{ color: '#b8976b' }}>
                          Browse the shop
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: '#f0e8e0' }}>
                        {items.map(item => (
                          <CartItemRow
                            key={item.product.id}
                            item={item}
                            onQtyChange={q => updateQty(item.product.id, q)}
                            onRemove={() => removeItem(item.product.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {items.length > 0 && (
                    <div className="border-t px-6 py-5 space-y-4 flex-shrink-0"
                      style={{ borderColor: '#e8ddd4', background: '#fff' }}>
                      {/* Subtotal */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: '#7a6a5e' }}>Subtotal</span>
                        <span className="text-lg font-semibold" style={{ color: '#1a1410' }}>
                          NPR {fmt(total)}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#b0a090' }}>
                        Delivery and final amount confirmed when we reach out to you.
                      </p>
                      {/* Checkout CTA */}
                      <button
                        onClick={() => setView('checkout')}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wide"
                        style={{ background: '#1a1410', color: '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#2d2419')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1a1410')}>
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <Link href="/shop" onClick={handleClose}
                        className="block text-center text-xs font-medium transition-colors"
                        style={{ color: '#b0a090' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#7a6a5e')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#b0a090')}>
                        Continue shopping
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ══ CHECKOUT VIEW ══════════════════════════════ */}
              {view === 'checkout' && (
                <motion.div key="checkout" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }} className="flex flex-col h-full">

                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
                    style={{ borderColor: '#e8ddd4' }}>
                    <div className="flex items-center gap-2.5">
                      <button onClick={() => setView('cart')}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
                        style={{ color: '#9a8070' }}>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold tracking-wide" style={{ color: '#1a1410' }}>
                        Your Details
                      </span>
                    </div>
                    <button onClick={handleClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
                      style={{ color: '#9a8070' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto flex flex-col">
                    <div className="flex-1 px-6 py-5 space-y-5">

                      {/* Order summary */}
                      <div className="rounded-xl p-4 space-y-2" style={{ background: '#fff', border: '1px solid #e8ddd4' }}>
                        <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#b0a090' }}>
                          Order Summary · {count} item{count !== 1 ? 's' : ''}
                        </p>
                        {items.map(item => (
                          <div key={item.product.id} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                                {item.product.image_url
                                  ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: '#c8b89a' }}>
                                      {item.product.name[0]}
                                    </div>}
                              </div>
                              <div>
                                <p className="text-xs font-medium leading-snug" style={{ color: '#1a1410' }}>
                                  {item.product.name}
                                </p>
                                <p className="text-[10px]" style={{ color: '#9a8070' }}>× {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#b8976b' }}>
                              NPR {fmt(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 mt-2 border-t flex items-center justify-between"
                          style={{ borderColor: '#f0e8e0' }}>
                          <span className="text-xs font-semibold" style={{ color: '#1a1410' }}>Total</span>
                          <span className="text-base font-semibold" style={{ color: '#1a1410' }}>
                            NPR {fmt(total)}
                          </span>
                        </div>
                      </div>

                      {/* Contact fields */}
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: '#b0a090' }}>Your Contact Details</p>

                        <div>
                          <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>
                            Full Name <span style={{ color: '#e05252' }}>*</span>
                          </label>
                          <input
                            required value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Your name"
                            style={inputStyle}
                            onFocus={focusInput} onBlur={blurInput}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>
                            Email <span style={{ color: '#e05252' }}>*</span>
                          </label>
                          <input
                            required type="email" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="you@email.com"
                            style={inputStyle}
                            onFocus={focusInput} onBlur={blurInput}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>Phone</label>
                          <input
                            type="tel" value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="+977-98XXXXXXXX"
                            style={inputStyle}
                            onFocus={focusInput} onBlur={blurInput}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>Note for us <span className="font-normal">(optional)</span></label>
                          <textarea
                            rows={3} value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Delivery preferences, questions…"
                            style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
                            onFocus={focusInput} onBlur={blurInput}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-8 pt-2 flex-shrink-0 border-t" style={{ borderColor: '#e8ddd4' }}>
                      <button
                        type="submit" disabled={saving}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wide transition-opacity disabled:opacity-60 mt-4"
                        style={{ background: '#1a1410', color: '#fff' }}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                        {saving ? 'Placing order…' : 'Place Order'}
                      </button>
                      <p className="text-center text-xs mt-3" style={{ color: '#b0a090' }}>
                        We&apos;ll confirm within 24 hours via email or WhatsApp
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ══ SUCCESS VIEW ═══════════════════════════════ */}
              {view === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col h-full items-center justify-center px-8 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{ background: '#f0faf5', border: '1px solid #a7f3d0' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: '#10b981' }} />
                  </div>

                  <h3 className="text-2xl font-light mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                    Order Received
                  </h3>
                  <p className="text-sm mb-1" style={{ color: '#7a6a5e' }}>
                    Thank you for your selection
                  </p>
                  <p className="text-sm mb-5" style={{ color: '#7a6a5e' }}>
                    We received your order for <strong style={{ color: '#1a1410' }}>{count} item{count !== 1 ? 's' : ''}</strong>.
                  </p>

                  {ref && (
                    <div className="px-6 py-4 rounded-xl mb-5" style={{ background: '#fdf6ee', border: '1px solid #e8ddd4' }}>
                      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#b0a090' }}>Order Reference</p>
                      <p className="text-xl font-semibold font-mono" style={{ color: '#b8976b' }}>{ref}</p>
                    </div>
                  )}

                  {/* Order summary in success */}
                  <div className="w-full rounded-xl p-4 mb-6 space-y-2 text-left"
                    style={{ background: '#fff', border: '1px solid #f0e8e0' }}>
                    {items.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between text-xs">
                        <span style={{ color: '#5a4a3e' }}>{item.product.name} × {item.quantity}</span>
                        <span style={{ color: '#b8976b' }}>NPR {fmt(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t flex justify-between text-xs font-semibold"
                      style={{ borderColor: '#f0e8e0', color: '#1a1410' }}>
                      <span>Total</span>
                      <span>NPR {fmt(total)}</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed mb-8" style={{ color: '#9a8070' }}>
                    We&apos;ll contact you to confirm your order and arrange delivery or in-salon pick-up.
                  </p>

                  <div className="flex flex-col gap-2 w-full">
                    <button onClick={handleSuccessClose}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold uppercase tracking-wide"
                      style={{ background: '#1a1410', color: '#fff' }}>
                      <Sparkles className="w-4 h-4" />
                      Continue Shopping
                    </button>
                    <Link href="/shop" onClick={handleSuccessClose}
                      className="block py-2 text-center text-xs" style={{ color: '#b0a090' }}>
                      Back to The Refined Edit
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Cart Item Row ─────────────────────────────────────────────

function CartItemRow({
  item, onQtyChange, onRemove,
}: {
  item:        import('@/providers/CartProvider').CartItem
  onQtyChange: (qty: number) => void
  onRemove:    () => void
}) {
  return (
    <div className="flex items-start gap-4 px-6 py-4">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
        {item.product.image_url
          ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-lg font-light"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#c8b89a' }}>
              {item.product.name[0]}
            </div>}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-snug" style={{ color: '#1a1410' }}>{item.product.name}</p>
        <p className="text-[10px] capitalize mt-0.5" style={{ color: '#9a8070' }}>{item.product.category}</p>
        <p className="text-sm font-semibold mt-1" style={{ color: '#b8976b' }}>
          NPR {new Intl.NumberFormat('en-NP').format(item.product.price)}
        </p>

        {/* Qty controls */}
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={() => onQtyChange(item.quantity - 1)}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ background: '#f5ede3', color: '#7a6a5e' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e8ddd4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f5ede3')}>
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center text-xs font-semibold" style={{ color: '#1a1410' }}>
            {item.quantity}
          </span>
          <button
            onClick={() => onQtyChange(item.quantity + 1)}
            disabled={item.quantity >= 20}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ background: '#f5ede3', color: '#7a6a5e' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e8ddd4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f5ede3')}>
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Subtotal + remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="text-sm font-semibold" style={{ color: '#1a1410' }}>
          NPR {new Intl.NumberFormat('en-NP').format(item.product.price * item.quantity)}
        </p>
        <button onClick={onRemove}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{ background: '#fef2f2', color: '#f87171' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
          onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
