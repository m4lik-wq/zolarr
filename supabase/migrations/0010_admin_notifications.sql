-- 0010_admin_notifications.sql

-- is_admin() SECURITY DEFINER helper: profiles tablosunun RLS'inden bagimsiz
-- olarak rolu kontrol eder. RLS politikalari icin tek dogru kaynak.
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
