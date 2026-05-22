import { adminGetShopOrders } from '@/app/actions/admin'
import { ShopOrdersTable }   from '@/components/admin/ShopOrdersTable'
import { NewOrderButton }    from '@/components/admin/NewOrderButton'
import type { ProductOrderStatus } from '@/types/database'
import { ShoppingBag, Clock, CheckCircle2, Package, XCircle, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const STATUSES = ['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'] as const

const STATUS_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending:   { icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
  confirmed: { icon: CheckCircle2,  color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
  ready:     { icon: Package,       color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
  completed: { icon: TrendingUp,    color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  cancelled: { icon: XCircle,       color: 'text-rose-500',    bg: 'bg-rose-500/10'    },
}

export default async function ShopOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const orders = await adminGetShopOrders(status as ProductOrderStatus | undefined)

  const fmt = (n: number) => new Intl.NumberFormat('en-NP').format(n)

  const confirmedRevenue = orders
    .filter(o => ['confirmed', 'ready', 'completed'].includes(o.status))
    .reduce((s, o) => s + Number(o.total_amount), 0)

  const counts = (STATUSES.slice(1) as string[]).reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <ShoppingBag className="w-[18px] h-[18px] text-violet-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Shop Orders</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
              {status && status !== 'all' ? ` · filtered: ${status}` : ' total'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Revenue pill */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-none">Revenue</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">NPR {fmt(confirmedRevenue)}</p>
            </div>
          </div>
          {/* New manual order button */}
          <NewOrderButton />
        </div>
      </div>

      {/* Status mini-cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {(Object.entries(counts) as [string, number][]).map(([s, count]) => {
          const meta   = STATUS_META[s]
          const Icon   = meta.icon
          const active = s === status
          return (
            <a
              key={s}
              href={`/admin/shop-orders?status=${s}`}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all
                ${active
                  ? 'bg-gold-500/10 border-gold-500/30 shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                <Icon className={`w-3 h-3 ${meta.color}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold ${active ? 'text-gold-400' : 'text-gray-900 dark:text-white'}`}>{count}</p>
                <p className="text-[9px] capitalize text-gray-400 dark:text-neutral-500 truncate">{s}</p>
              </div>
            </a>
          )
        })}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => {
          const active = (s === 'all' && !status) || s === status
          const count  = s !== 'all' ? counts[s] : undefined
          return (
            <a
              key={s}
              href={s === 'all' ? '/admin/shop-orders' : `/admin/shop-orders?status=${s}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                active
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Orders' : s}
              {count !== undefined && count > 0 && (
                <span className="ml-1.5 px-1 py-0.5 rounded-full bg-current/15 text-[9px] font-bold">{count}</span>
              )}
            </a>
          )
        })}
      </div>

      <ShopOrdersTable orders={orders} />
    </div>
  )
}
