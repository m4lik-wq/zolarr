-- combined_for_paste_v5.sql
-- 0009_auth_profiles.sql tüm içeriği aynen + sondaki doğrulama

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  role text not null default 'customer'
    check (role in ('customer','moderator','assistant','admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- ============ HANDLE_NEW_USER TRIGGER ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ADDRESSES ============
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  full_name text not null,
  phone text not null,
  city text not null,
  district text,
  postal_code text,
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses(user_id);

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "addresses_self_all" on public.addresses;
create policy "addresses_self_all" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ FAVORITES ============
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_user_idx on public.favorites(user_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "favorites_self_all" on public.favorites;
create policy "favorites_self_all" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ STOCK ALERTS ============
create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  email text not null,
  notified boolean not null default false,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists stock_alerts_user_idx on public.stock_alerts(user_id, created_at desc);
create index if not exists stock_alerts_product_idx on public.stock_alerts(product_id) where notified = false;

alter table public.stock_alerts enable row level security;

drop policy if exists "stock_alerts_self_all" on public.stock_alerts;
create policy "stock_alerts_self_all" on public.stock_alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ QUOTES.USER_ID ============
alter table public.quotes
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists quotes_user_idx on public.quotes(user_id, created_at desc);

drop policy if exists "quotes_self_read" on public.quotes;
create policy "quotes_self_read" on public.quotes
  for select using (auth.uid() = user_id);

-- Doğrulama
select to_regclass('public.profiles') is not null as profiles_exists,
       to_regclass('public.addresses') is not null as addresses_exists,
       to_regclass('public.favorites') is not null as favorites_exists,
       to_regclass('public.stock_alerts') is not null as stock_alerts_exists,
       (select column_name from information_schema.columns
        where table_name='quotes' and column_name='user_id') is not null as quotes_user_id_exists;
