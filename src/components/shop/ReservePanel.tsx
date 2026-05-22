'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Loader2, CheckCircle2, ShoppingBag } from 'lucide-react'
import { createProductOrder } from '@/app/actions/shop'
import type { Product } from '@/types/database'

interface Props {
  product: Product
  onClose: () => void
}

type Step = 'form' | 'success'

export function ReservePanel({ product, onClose }: Props) {
  const [step, setStep]         = useState<Step>('form')
  const [qty,  setQty]          = useState(1)
  const [submitting, setSub]    = useState(false)
  const [reference, setRef]     = useState('')

  const [form, setForm] = useState({
    name:  '',
    email: '',
    phone: '',
    notes: '',
  })

  const price   = product.price
  const total   = price * qty
  const fmt     = (n: number) => new Intl.NumberFormat('en-NP').format(n)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSub(true)
    const { reference: ref, error } = await createProductOrder({
      product_id:     product.id,
      product_name:   product.name,
      unit_price:     price,
      quantity:       qty,
      customer_name:  form.name,
      customer_email: form.email,
      customer_phone: form.phone || undefined,
      notes:          form.notes || undefined,
    })
    setSub(false)
    if (error) {
      alert('Something went wrong. Please try again.')
      return
    }
    setRef(ref ?? '')
    setStep('success')
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 280 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col shadow-2xl overflow-hidden"
        style={{ background: '#fdfaf7', borderLeft: '1px solid #e8ddd4' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#e8ddd4' }}>
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4" style={{ color: '#b8976b' }} />
            <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#1a1410' }}>
              Reserve Product
            </span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
            style={{ color: '#9a8070' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto"
            >
              {/* Product preview */}
              <div className="flex items-center gap-4 px-6 py-5 border-b" style={{ borderColor: '#f0e8e0', background: '#fff' }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1a1410' }}>{product.name}</p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: '#9a8070' }}>{product.category}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: '#b8976b' }}>NPR {fmt(price)}</p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-6">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7a6a5e' }}>
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: '#e8ddd4' }}>
                      <button
                        type="button"
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-stone-50 disabled:opacity-30"
                        disabled={qty <= 1}
                        style={{ color: '#7a6a5e' }}>
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold" style={{ color: '#1a1410' }}>{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(q => Math.min(10, q + 1))}
                        className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-stone-50 disabled:opacity-30"
                        disabled={qty >= 10}
                        style={{ color: '#7a6a5e' }}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#9a8070' }}>Total</p>
                      <p className="text-lg font-semibold" style={{ color: '#b8976b' }}>NPR {fmt(total)}</p>
                    </div>
                  </div>
                </div>

                {/* Contact fields */}
                <div className="space-y-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6a5e' }}>
                    Your Details
                  </label>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>
                      Full Name <span style={{ color: '#e05252' }}>*</span>
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                      style={{
                        background: '#fff', border: '1px solid #e8ddd4',
                        color: '#1a1410',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e8ddd4')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>
                      Email <span style={{ color: '#e05252' }}>*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@email.com"
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                      style={{
                        background: '#fff', border: '1px solid #e8ddd4',
                        color: '#1a1410',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e8ddd4')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+977-98XXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                      style={{
                        background: '#fff', border: '1px solid #e8ddd4',
                        color: '#1a1410',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e8ddd4')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: '#9a8070' }}>Note for us <span className="font-normal">(optional)</span></label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Any special requests or questions…"
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
                      style={{
                        background: '#fff', border: '1px solid #e8ddd4',
                        color: '#1a1410',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e8ddd4')}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-8 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-semibold tracking-wide uppercase transition-opacity disabled:opacity-60"
                  style={{ background: '#1a1410', color: '#fff' }}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                  {submitting ? 'Placing reservation…' : 'Reserve This Product'}
                </button>
                <p className="text-center text-xs mt-3" style={{ color: '#b0a090' }}>
                  We'll confirm within 24 hours via email or WhatsApp
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-8 text-center"
            >
              {/* Success state */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#f0faf5', border: '1px solid #a7f3d0' }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
                Reservation Confirmed
              </h3>
              <p className="text-sm mb-4" style={{ color: '#7a6a5e' }}>
                Your reservation for <strong style={{ color: '#1a1410' }}>{product.name}</strong> has been received.
              </p>
              {reference && (
                <div className="px-5 py-3 rounded-lg mb-4" style={{ background: '#fdf6ee', border: '1px solid #e8ddd4' }}>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#b0a090' }}>Reference</p>
                  <p className="text-base font-semibold font-mono" style={{ color: '#b8976b' }}>{reference}</p>
                </div>
              )}
              <p className="text-xs mb-8 leading-relaxed" style={{ color: '#9a8070' }}>
                We'll reach out to confirm your order and arrange delivery or pick-up within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{ background: '#1a1410', color: '#fff' }}>
                Continue Shopping
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
