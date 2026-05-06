-- 0006_projects_faqs_contact.sql

-- ============ PROJECTS ============
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null check (type in ('konut','ticari','tarim')),
  location text not null,
  capacity_kwp numeric(10,3) not null,
  cover_image text not null,
  description text,
  before_image text,
  after_image text,
  gallery_images text[] not null default array[]::text[],
  product_slugs text[] not null default array[]::text[],
  customer_quote text,
  customer_name text,
  annual_savings_try numeric(12,2),
  completion_date date,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_idx on public.projects(is_published, sort_order);
create index if not exists projects_type_idx on public.projects(type) where is_published;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "projects_read_anon" on public.projects;
create policy "projects_read_anon" on public.projects
  for select using (is_published = true);

-- ============ FAQS ============
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'genel'
    check (category in ('genel','teknik','fiyat','kurulum','garanti')),
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_category_idx on public.faqs(category, sort_order) where is_published;

drop trigger if exists trg_faqs_updated_at on public.faqs;
create trigger trg_faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

alter table public.faqs enable row level security;

drop policy if exists "faqs_read_anon" on public.faqs;
create policy "faqs_read_anon" on public.faqs
  for select using (is_published = true);

-- ============ CONTACT MESSAGES ============
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  message_number text not null unique,
  name text not null,
  email text not null,
  phone text,
  subject text,
  body text not null,
  status text not null default 'new'
    check (status in ('new','read','replied','archived')),
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on public.contact_messages(status, created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_insert_anon" on public.contact_messages;
create policy "contact_insert_anon" on public.contact_messages
  for insert with check (true);
-- Read closed (admin Faz 8'de açacak)
