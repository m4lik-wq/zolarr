-- combined_for_paste_v12.sql
-- v11 superseti + Faz 15A:
--   * pgvector extension + embeddings tablosu + match_embeddings RPC (Faz 13)
--   * campaigns tablosu (Faz 15A - admin tarafindan yonetilen ana sayfa banner'i)
-- Tum statementlar idempotent (if not exists / drop if exists / create or replace).

-- ============================================================================
-- BOLUM 1: 0009 auth_profiles
-- ============================================================================

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

-- ============================================================================
-- BOLUM 2: is_admin() SECURITY DEFINER helper (L3 fix)
-- ============================================================================

-- profiles RLS'inden bagimsizdir; politikalar bu fonksiyon uzerinden rolu sorgular
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- ============================================================================
-- BOLUM 3: 0010 admin_notifications (is_admin() ile)
-- ============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'NEW_QUOTE','NEW_DEALER','NEW_CONTACT','NEW_ORDER',
    'PRICE_INCREASE','PRICE_DECREASE','OUT_OF_STOCK','SUPPLIER_GONE'
  )),
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_idx on public.notifications(is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_admin_read" on public.notifications;
create policy "notifications_admin_read" on public.notifications
  for select using (public.is_admin());

drop policy if exists "notifications_admin_update" on public.notifications;
create policy "notifications_admin_update" on public.notifications
  for update using (public.is_admin());

-- Triggers: yeni teklif, bayi, iletisim mesaji geldiginde notification yarat

create or replace function public.notify_new_quote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, payload)
  values (
    'NEW_QUOTE',
    jsonb_build_object(
      'quote_id', new.id,
      'quote_number', new.quote_number,
      'contact_name', new.contact_name,
      'city', new.city
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_quote on public.quotes;
create trigger trg_notify_new_quote
  after insert on public.quotes
  for each row execute function public.notify_new_quote();

create or replace function public.notify_new_dealer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, payload)
  values (
    'NEW_DEALER',
    jsonb_build_object(
      'dealer_id', new.id,
      'application_number', new.application_number,
      'company_name', new.company_name
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_dealer on public.dealer_applications;
create trigger trg_notify_new_dealer
  after insert on public.dealer_applications
  for each row execute function public.notify_new_dealer();

create or replace function public.notify_new_contact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, payload)
  values (
    'NEW_CONTACT',
    jsonb_build_object(
      'message_id', new.id,
      'message_number', new.message_number,
      'name', new.name,
      'email', new.email
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_contact on public.contact_messages;
create trigger trg_notify_new_contact
  after insert on public.contact_messages
  for each row execute function public.notify_new_contact();

-- ============================================================================
-- BOLUM 4: 0011 email preferences (Faz 10)
-- ============================================================================

alter table public.profiles
  add column if not exists email_preferences jsonb not null default '{
    "marketing": true,
    "stock_alerts": true,
    "quote_status": true,
    "dealer_status": true
  }'::jsonb;

alter table public.profiles
  add column if not exists unsubscribe_secret text not null default encode(gen_random_bytes(16), 'hex');

-- ============================================================================
-- BOLUM 5: 0012 suppliers (Faz 11)
-- ============================================================================

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

-- ============================================================================
-- BOLUM 6: 0013 pgvector + embeddings + match_embeddings (Faz 13)
-- ============================================================================

create extension if not exists vector;

create table if not exists public.embeddings (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null check (doc_type in ('product','project','faq')),
  doc_id uuid not null,
  content text not null,
  embedding vector(1024) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(doc_type, doc_id)
);

create index if not exists embeddings_idx on public.embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists embeddings_doc_idx on public.embeddings(doc_type, doc_id);

alter table public.embeddings enable row level security;
drop policy if exists "embeddings_admin_only" on public.embeddings;
create policy "embeddings_admin_only" on public.embeddings
  for all using (public.is_admin()) with check (public.is_admin());

-- RPC: vektör cosine similarity ile top-K döndür
create or replace function public.match_embeddings(query_embedding vector(1024), match_count int default 5)
returns table (
  doc_type text,
  doc_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
security definer
set search_path = public
as $$
  select doc_type, doc_id, content, metadata, 1 - (embedding <=> query_embedding) as similarity
  from public.embeddings
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- BOLUM 7: 0015 campaigns (Faz 15A)
-- ============================================================================

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text,
  cta_href text,
  bg_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists campaigns_active_idx on public.campaigns(is_active, sort_order);

alter table public.campaigns enable row level security;

drop policy if exists "campaigns_public_read" on public.campaigns;
create policy "campaigns_public_read" on public.campaigns
  for select using (is_active = true);

drop policy if exists "campaigns_admin_all" on public.campaigns;
create policy "campaigns_admin_all" on public.campaigns
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- DOGRULAMA
-- ============================================================================

select
  to_regclass('public.profiles')         is not null as profiles_exists,
  to_regclass('public.addresses')        is not null as addresses_exists,
  to_regclass('public.favorites')        is not null as favorites_exists,
  to_regclass('public.stock_alerts')     is not null as stock_alerts_exists,
  to_regclass('public.notifications')    is not null as notifications_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quotes' and column_name = 'user_id'
  ) as quotes_user_id_exists,
  exists (
    select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) as is_admin_exists,
  (select count(*) from information_schema.triggers
    where trigger_schema = 'public' and trigger_name in (
      'trg_notify_new_quote','trg_notify_new_dealer','trg_notify_new_contact'
    )) as notification_trigger_count,
  exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='email_preferences'
  ) as email_preferences_exists,
  exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='unsubscribe_secret'
  ) as unsubscribe_secret_exists,
  to_regclass('public.suppliers')         is not null as suppliers_exists,
  to_regclass('public.supplier_products') is not null as supplier_products_exists,
  to_regclass('public.embeddings')        is not null as embeddings_exists,
  exists (select 1 from pg_extension where extname='vector') as pgvector_installed,
  exists (
    select 1 from pg_proc p join pg_namespace n on p.pronamespace=n.oid
    where n.nspname='public' and p.proname='match_embeddings'
  ) as match_embeddings_fn,
  to_regclass('public.campaigns')         is not null as campaigns_exists;
