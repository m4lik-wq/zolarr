-- combined_for_paste_v6.sql
-- Faz 8 Batch A — Admin notifications + auto-create triggers
-- Bu dosya Supabase SQL Editor'a yapistirilarak calistirilir.

-- 0010_admin_notifications.sql

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
  for select using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "notifications_admin_update" on public.notifications;
create policy "notifications_admin_update" on public.notifications
  for update using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

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

-- Dogrulama
select to_regclass('public.notifications') is not null as notifications_exists,
       count(*) filter (where trigger_name = 'trg_notify_new_quote') as quote_trigger,
       count(*) filter (where trigger_name = 'trg_notify_new_dealer') as dealer_trigger,
       count(*) filter (where trigger_name = 'trg_notify_new_contact') as contact_trigger
from information_schema.triggers
where trigger_schema = 'public';
