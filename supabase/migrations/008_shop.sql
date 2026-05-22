-- ============================================================
-- 008_shop.sql — Products & Product Orders
-- Refined Beauty Hub — "The Refined Edit" Shop
-- ============================================================

-- ── Enums ─────────────────────────────────────────────────────

create type product_category as enum (
  'hair', 'skin', 'body', 'nails', 'fragrance', 'tools', 'other'
);

create type product_order_status as enum (
  'pending', 'confirmed', 'ready', 'completed', 'cancelled'
);

-- ── Products ──────────────────────────────────────────────────

create table if not exists products (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  slug              text        not null unique,
  short_description text,
  description       text,
  expert_note       text,                               -- "Why our team loves this"
  price             numeric(10,2) not null check (price >= 0),
  compare_at_price  numeric(10,2),                      -- crossed-out original price
  image_url         text,
  gallery_urls      jsonb       not null default '[]'::jsonb,
  category          product_category not null default 'other',
  tags              text[]      not null default '{}',  -- ['bestseller','staff_pick','new','limited']
  suitable_for      text[]      not null default '{}',  -- ['dry hair','sensitive skin',…]
  ingredients       text,
  how_to_use        text,
  is_featured       boolean     not null default false,
  is_active         boolean     not null default true,
  in_stock          boolean     not null default true,
  stock_count       integer,                            -- null = unlimited
  sort_order        integer     not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index products_category_idx         on products (category);
create index products_active_featured_idx  on products (is_active, is_featured);
create index products_slug_idx             on products (slug);

-- ── Product Orders ────────────────────────────────────────────

create table if not exists product_orders (
  id              uuid        primary key default gen_random_uuid(),
  reference       text        not null unique
                              default 'PRD-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  product_id      uuid        references products (id) on delete set null,
  product_name    text        not null,   -- snapshot at reservation time
  unit_price      numeric(10,2) not null, -- snapshot at reservation time
  quantity        integer     not null default 1 check (quantity > 0 and quantity <= 20),
  total_amount    numeric(10,2) generated always as (quantity * unit_price) stored,
  customer_name   text        not null,
  customer_email  text        not null,
  customer_phone  text,
  notes           text,
  status          product_order_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index product_orders_status_idx  on product_orders (status);
create index product_orders_created_idx on product_orders (created_at desc);

-- ── Trigger function (create if not already defined) ─────────

create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Triggers ─────────────────────────────────────────────────

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at_column();

create trigger product_orders_updated_at
  before update on product_orders
  for each row execute function update_updated_at_column();

-- ── RLS ───────────────────────────────────────────────────────

alter table products       enable row level security;
alter table product_orders enable row level security;

-- Public can read active products
create policy "products_public_read" on products
  for select using (is_active = true);

-- Admin / staff full access (bypasses is_active filter)
create policy "products_admin_all" on products
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );

-- Anyone can place a reservation (guest-friendly)
create policy "product_orders_public_insert" on product_orders
  for insert with check (true);

-- Admin / staff can view and manage orders
create policy "product_orders_admin_read" on product_orders
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );

create policy "product_orders_admin_update" on product_orders
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );
