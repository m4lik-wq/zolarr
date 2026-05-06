-- combined_for_paste_v2.sql
-- Quotes (teklif talepleri) + Dealer applications
-- Bu dosyayi Supabase Studio SQL Editor'e yapistirip Run et.

-- ============ QUOTES ============
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  contact_time_preference text,
  city text not null,
  district text,
  installation_location text not null check (
    installation_location in ('roof', 'roof_flat', 'land', 'carport', 'facade')
  ),
  location_notes text,
  appliances jsonb default '[]'::jsonb,
  description text,
  estimated_kwp numeric(10, 3),
  estimated_savings_try numeric(12, 2),
  estimated_payback_years numeric(6, 2),
  status text not null default 'new' check (
    status in ('new', 'contacted', 'quoted', 'won', 'lost')
  ),
  admin_notes text,
  responded boolean not null default false,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_status_created_idx on public.quotes(status, created_at desc);

drop trigger if exists trg_quotes_updated_at on public.quotes;
create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;

drop policy if exists "quotes_insert_anon" on public.quotes;
create policy "quotes_insert_anon" on public.quotes
  for insert with check (true);

-- Read kapalı (Faz 8'de admin role policy ile açılacak)

-- ============ DEALER APPLICATIONS ============
create table if not exists public.dealer_applications (
  id uuid primary key default gen_random_uuid(),
  application_number text not null unique,
  company_name text not null,
  tax_office text,
  tax_number text,
  company_address text,
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  contact_role text,
  service_categories text[] default array[]::text[],
  service_areas text[] default array[]::text[],
  experience_years int,
  document_urls text[] default array[]::text[],
  status text not null default 'new' check (
    status in ('new', 'reviewing', 'approved', 'rejected')
  ),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dealer_status_created_idx on public.dealer_applications(status, created_at desc);

drop trigger if exists trg_dealers_updated_at on public.dealer_applications;
create trigger trg_dealers_updated_at
  before update on public.dealer_applications
  for each row execute function public.set_updated_at();

alter table public.dealer_applications enable row level security;

drop policy if exists "dealer_insert_anon" on public.dealer_applications;
create policy "dealer_insert_anon" on public.dealer_applications
  for insert with check (true);

-- Doğrulama
select 'quotes' as tablo, count(*) as adet from public.quotes
union all
select 'dealer_applications' as tablo, count(*) as adet from public.dealer_applications;
