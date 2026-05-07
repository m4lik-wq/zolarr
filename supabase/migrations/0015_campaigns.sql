-- 0015_campaigns.sql
-- Faz 15A: Kampanyalar tablosu (admin tarafindan yonetilen ana sayfa banner'i)

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
