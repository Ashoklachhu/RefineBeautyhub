-- ============================================================
-- 009_shop_orders.sql — Multi-item shop orders
-- Replaces single-item product_orders for cart checkout flow
-- ============================================================

-- ── Shop Orders (cart checkout header) ───────────────────────

create table if not exists shop_orders (
  id             uuid          primary key default gen_random_uuid(),
  reference      text          not null unique
                               default 'ORD-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  customer_name  text          not null,
  customer_email text          not null,
  customer_phone text,
  notes          text,
  item_count     integer       not null default 0,
  total_amount   numeric(10,2) not null default 0,
  status         product_order_status not null default 'pending',
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

create index shop_orders_status_idx  on shop_orders (status);
create index shop_orders_created_idx on shop_orders (created_at desc);

-- ── Shop Order Items (line items per order) ───────────────────

create table if not exists shop_order_items (
  id           uuid          primary key default gen_random_uuid(),
  order_id     uuid          not null references shop_orders (id) on delete cascade,
  product_id   uuid          references products (id) on delete set null,
  product_name text          not null,
  image_url    text,
  unit_price   numeric(10,2) not null,
  quantity     integer       not null default 1 check (quantity > 0 and quantity <= 50),
  subtotal     numeric(10,2) generated always as (quantity * unit_price) stored
);

create index shop_order_items_order_idx on shop_order_items (order_id);

-- ── Triggers ─────────────────────────────────────────────────

create trigger shop_orders_updated_at
  before update on shop_orders
  for each row execute function update_updated_at_column();

-- ── RLS ───────────────────────────────────────────────────────

alter table shop_orders      enable row level security;
alter table shop_order_items enable row level security;

-- Anyone can create an order (guest checkout)
create policy "shop_orders_public_insert" on shop_orders
  for insert with check (true);

create policy "shop_order_items_public_insert" on shop_order_items
  for insert with check (true);

-- Admin / staff full access
create policy "shop_orders_admin_all" on shop_orders
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );

create policy "shop_order_items_admin_all" on shop_order_items
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );
