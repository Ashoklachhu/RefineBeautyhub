'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { Product, ProductCategory, ProductOrder } from '@/types/database'

function db() { return createServiceClient() }

// ── Public: fetch products ────────────────────────────────────

export async function getProducts(category?: ProductCategory | 'all') {
  const supabase = db()
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) return []
  return (data ?? []) as Product[]
}

export async function getFeaturedProducts(limit = 6) {
  const supabase = db()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit)
  return (data ?? []) as Product[]
}

export async function getProductBySlug(slug: string) {
  const supabase = db()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Product | null
}

// ── Public: place reservation ─────────────────────────────────

export async function createProductOrder(input: {
  product_id:     string
  product_name:   string
  unit_price:     number
  quantity:       number
  customer_name:  string
  customer_email: string
  customer_phone?: string
  notes?:         string
}): Promise<{ reference: string | null; error: string | null }> {
  const supabase = db()

  const { data, error } = await supabase
    .from('product_orders')
    .insert({
      product_id:     input.product_id,
      product_name:   input.product_name,
      unit_price:     input.unit_price,
      quantity:       input.quantity,
      customer_name:  input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone ?? null,
      notes:          input.notes ?? null,
    })
    .select('reference')
    .single()

  if (error) return { reference: null, error: error.message }
  return { reference: data.reference, error: null }
}

// ── Public: get order by reference (for confirmation page) ────

export async function getProductOrderByReference(reference: string) {
  const supabase = db()
  const { data } = await supabase
    .from('product_orders')
    .select('*, product:products(*)')
    .eq('reference', reference)
    .single()
  return data as (ProductOrder & { product: Product | null }) | null
}

// ── Public: multi-item cart checkout ─────────────────────────

export async function createShopOrder(input: {
  customer_name:  string
  customer_email: string
  customer_phone?: string
  notes?:          string
  items: {
    product_id:   string
    product_name: string
    image_url?:   string | null
    unit_price:   number
    quantity:     number
  }[]
}): Promise<{ reference: string | null; error: string | null }> {
  const supabase = db()

  const total_amount = input.items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const item_count   = input.items.reduce((s, i) => s + i.quantity, 0)

  // Insert order header
  const { data: order, error: orderErr } = await supabase
    .from('shop_orders')
    .insert({
      customer_name:  input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone ?? null,
      notes:          input.notes ?? null,
      item_count,
      total_amount,
    })
    .select('id, reference')
    .single()

  if (orderErr || !order) return { reference: null, error: orderErr?.message ?? 'Failed to create order' }

  // Insert line items
  const { error: itemsErr } = await supabase
    .from('shop_order_items')
    .insert(
      input.items.map(i => ({
        order_id:     order.id,
        product_id:   i.product_id,
        product_name: i.product_name,
        image_url:    i.image_url ?? null,
        unit_price:   i.unit_price,
        quantity:     i.quantity,
      }))
    )

  if (itemsErr) return { reference: null, error: itemsErr.message }

  return { reference: order.reference, error: null }
}

// ── Public: get shop order by reference ──────────────────────

export async function getShopOrderByReference(reference: string) {
  const supabase = db()
  const { data } = await supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .eq('reference', reference)
    .single()
  return data as import('@/types/database').ShopOrderWithItems | null
}
