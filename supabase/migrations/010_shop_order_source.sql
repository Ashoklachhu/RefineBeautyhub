-- ── Migration 010: shop order source + payment method ──────────
-- Adds order origin tracking and payment method to shop_orders

-- Order source enum
do $$ begin
  create type shop_order_source as enum (
    'online', 'walk_in', 'phone', 'instagram', 'whatsapp', 'other'
  );
exception when duplicate_object then null; end $$;

-- Payment method enum
do $$ begin
  create type shop_payment_method as enum (
    'cash', 'card', 'esewa', 'khalti', 'fonepay', 'credit', 'other'
  );
exception when duplicate_object then null; end $$;

-- Add columns to shop_orders
alter table shop_orders
  add column if not exists source         shop_order_source   not null default 'online',
  add column if not exists payment_method shop_payment_method          default null,
  add column if not exists created_by     uuid references auth.users(id) on delete set null default null;

-- Index for filtering by source
create index if not exists shop_orders_source_idx on shop_orders(source);

comment on column shop_orders.source         is 'How the order came in (online cart, walk-in, phone, etc.)';
comment on column shop_orders.payment_method is 'How the customer paid (cash, card, eSewa, etc.)';
comment on column shop_orders.created_by     is 'Admin/staff user who created a manual order, null for online orders';
