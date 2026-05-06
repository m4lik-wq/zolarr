-- 0001_categories_products.sql
-- Categories (hierarchical tree) + Products (catalog)

create extension if not exists "pgcrypto";

-- ============ CATEGORIES ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  parent_id uuid references public.categories(id) on delete cascade,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_parent_idx on public.categories(parent_id);
create index if not exists categories_sort_idx on public.categories(sort_order);

-- ============ PRODUCTS ============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  brand text,
  sku text,
  price numeric(12, 2) not null check (price >= 0),
  discount_price numeric(12, 2) check (discount_price is null or discount_price >= 0),
  stock int not null default 0,
  track_stock boolean not null default true,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  power_w numeric(10, 2),
  power_kwp numeric(10, 3),
  current_a numeric(8, 2),
  voltage_v numeric(8, 2),
  specs jsonb default '{}'::jsonb,
  images text[] default array[]::text[],
  videos text[] default array[]::text[],
  pdfs text[] default array[]::text[],
  tags text[] default array[]::text[],
  warranty_years int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_category_active_idx on public.products(category_id, is_active);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_tags_gin_idx on public.products using gin(tags);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS — anonim okuma açık (mağaza public), yazma admin için (Faz 8'de policy eklenecek)
alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories
  for select using (true);

drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products
  for select using (is_active = true);
