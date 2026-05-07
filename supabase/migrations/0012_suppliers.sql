-- 0012_suppliers.sql
-- Faz 11: Tedarikçi sync — fiyat/stok scraping altyapısı

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  base_url text,
  adapter_slug text not null,
  enabled boolean not null default true,
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now()
);

create index if not exists suppliers_enabled_idx on public.suppliers(enabled) where enabled = true;

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_url text not null,
  last_price numeric(12,2),
  last_stock integer,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique(supplier_id, product_id)
);

create index if not exists supplier_products_product_idx on public.supplier_products(product_id);
create index if not exists supplier_products_supplier_idx on public.supplier_products(supplier_id);

alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;

drop policy if exists "suppliers_admin_all" on public.suppliers;
create policy "suppliers_admin_all" on public.suppliers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "supplier_products_admin_all" on public.supplier_products;
create policy "supplier_products_admin_all" on public.supplier_products
  for all using (public.is_admin()) with check (public.is_admin());
