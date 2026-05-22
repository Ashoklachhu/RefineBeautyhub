'use client'

import { useState, useTransition, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ShoppingBag, ChevronDown, ChevronRight, Package, Search, X,
  Phone, Mail, StickyNote, Store, Headphones, Smartphone,
  MessageCircle, Globe,
} from 'lucide-react'
import { adminUpdateShopOrderStatus } from '@/app/actions/admin'
import { AdminBadge } from './AdminBadge'
import type { ShopOrderWithItems, ProductOrderStatus, ShopOrderSource } from '@/types/database'

const STATUS_COLOR: Record<ProductOrderStatus, 'gray' | 'blue' | 'gold' | 'green' | 'purple'> = {
  pending:   'gold',
  confirmed: 'blue',
  ready:     'purple',
  completed: 'green',
  cancelled: 'gray',
}

const STATUS_ORDER: ProductOrderStatus[] = ['pending', 'confirmed', 'ready', 'completed', 'cancelled']

const SOURCE_META: Record<ShopOrderSource, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  online:    { label: 'Online',    icon: Globe,         color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
  walk_in:   { label: 'Walk-in',   icon: Store,         color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  phone:     { label: 'Phone',     icon: Headphones,    color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
  instagram: { label: 'Instagram', icon: Smartphone,    color: 'text-pink-500',    bg: 'bg-pink-500/10'    },
  whatsapp:  { label: 'WhatsApp',  icon: MessageCircle, color: 'text-green-500',   bg: 'bg-green-500/10'   },
  other:     { label: 'Other',     icon: ShoppingBag,   color: 'text-gray-500',    bg: 'bg-gray-500/10'    },
}

interface Props {
  orders: ShopOrderWithItems[]
}

export function ShopOrdersTable({ orders }: Props) {
  const router     = useRouter()
  const [, start]  = useTransition()
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [search,   setSearch]   = useState('')

  const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleStatusChange(id: string, status: ProductOrderStatus) {
    setUpdating(id)
    start(async () => {
      const { error } = await adminUpdateShopOrderStatus(id, status)
      if (error) toast.error(error)
      else { toast.success('Order status updated'); router.refresh() }
      setUpdating(null)
    })
  }

  // Filter by search
  const q = search.trim().toLowerCase()
  const filtered = q
    ? orders.filter(o =>
        o.reference?.toLowerCase().includes(q)   ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q)
      )
    : orders

  // Summary stats
  const totalRevenue = orders.filter(o => ['confirmed','ready','completed'].includes(o.status))
                              .reduce((s, o) => s + Number(o.total_amount), 0)
  const pending   = orders.filter(o => o.status === 'pending').length
  const confirmed = orders.filter(o => o.status === 'confirmed').length
  const ready     = orders.filter(o => o.status === 'ready').length

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders',    value: orders.length,        color: 'text-gray-900 dark:text-white' },
          { label: 'Pending',         value: pending,              color: 'text-amber-500' },
          { label: 'Confirmed / Ready', value: `${confirmed} / ${ready}`, color: 'text-blue-500' },
          { label: 'Confirmed Revenue', value: `NPR ${fmt(totalRevenue)}`, color: 'text-emerald-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3">
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mb-0.5">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by reference, name, email or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-input w-full pl-9 pr-9 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                {['', 'Reference', 'Customer', 'Items · Total', 'Source', 'Status', 'Date'].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
                    <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                      {q ? `No orders matching "${search}"` : 'No orders yet.'}
                    </p>
                    {q && (
                      <button onClick={() => setSearch('')} className="mt-2 text-xs text-gold-400 hover:text-gold-300">
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {filtered.map(o => {
                const isExpanded = expanded.has(o.id)
                return (
                  <Fragment key={o.id}>
                    {/* Main row */}
                    <tr
                      className={`border-b border-gray-200 dark:border-white/5 transition-colors
                        ${isExpanded ? 'bg-gray-50 dark:bg-white/[0.02]' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'}
                        ${o.status === 'cancelled' ? 'opacity-50' : ''}`}
                    >
                      {/* Expand toggle */}
                      <td className="pl-4 pr-2 py-3 w-8">
                        <button
                          onClick={() => toggleExpand(o.id)}
                          className="w-6 h-6 rounded flex items-center justify-center transition-colors text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300 hover:bg-gray-100 dark:hover:bg-white/10"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Reference */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white tracking-wide">
                          {o.reference}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{o.customer_name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5" />{o.customer_email}
                        </p>
                        {o.customer_phone && (
                          <p className="text-[10px] text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />{o.customer_phone}
                          </p>
                        )}
                      </td>

                      {/* Items + Total */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">NPR {fmt(o.total_amount)}</p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">
                          {o.item_count} item{o.item_count !== 1 ? 's' : ''} · {o.items?.length ?? 0} line{(o.items?.length ?? 0) !== 1 ? 's' : ''}
                        </p>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3">
                        {(() => {
                          const src  = (o.source ?? 'online') as ShopOrderSource
                          const meta = SOURCE_META[src] ?? SOURCE_META.online
                          const Icon = meta.icon
                          return (
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${meta.bg}`}>
                              <Icon className={`w-2.5 h-2.5 ${meta.color}`} />
                              <span className={`text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                            </div>
                          )
                        })()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <AdminBadge label={o.status} color={STATUS_COLOR[o.status]} />
                          <div className="relative">
                            <select
                              value={o.status}
                              disabled={updating === o.id}
                              onChange={e => handleStatusChange(o.id, e.target.value as ProductOrderStatus)}
                              className="appearance-none bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-neutral-300 text-[10px] rounded-lg pl-2 pr-5 py-1 cursor-pointer transition-colors disabled:opacity-50 hover:border-gray-300 dark:hover:border-white/10"
                            >
                              {STATUS_ORDER.map(s => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                          </div>
                          {updating === o.id && (
                            <div className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500 dark:text-neutral-400">
                          {new Date(o.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                          {new Date(o.created_at).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-white/[0.015]">
                        <td colSpan={7} className="px-4 pb-4 pt-0">
                          <div className="ml-8 space-y-3">

                            {/* Line items */}
                            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/5">
                              <div className="px-3 py-2 bg-gray-100 dark:bg-neutral-800/50 border-b border-gray-200 dark:border-white/5">
                                <p className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                                  Order Items
                                </p>
                              </div>
                              <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {(o.items ?? []).map(item => (
                                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-neutral-900">
                                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border border-gray-100 dark:border-white/5">
                                      {item.image_url
                                        ? <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                        : <Package className="w-4 h-4 text-gray-300 dark:text-neutral-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.product_name}</p>
                                      <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                                        NPR {fmt(item.unit_price)} × {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white flex-shrink-0">
                                      NPR {fmt(item.subtotal)}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Notes */}
                              {o.notes && (
                                <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-500/5 border-t border-amber-100 dark:border-amber-500/10">
                                  <StickyNote className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">{o.notes}</p>
                                </div>
                              )}

                              {/* Total + payment */}
                              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-neutral-800/60 border-t border-gray-200 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-semibold text-gray-900 dark:text-white">Order Total</span>
                                  {o.payment_method && (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-medium capitalize">
                                      {o.payment_method}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">NPR {fmt(o.total_amount)}</span>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Results footer */}
        {filtered.length > 0 && q && (
          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-neutral-800/30">
            <p className="text-[10px] text-gray-400 dark:text-neutral-500">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
