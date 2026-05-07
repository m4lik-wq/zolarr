-- 0011_email_preferences.sql
alter table public.profiles
  add column if not exists email_preferences jsonb not null default '{
    "marketing": true,
    "stock_alerts": true,
    "quote_status": true,
    "dealer_status": true
  }'::jsonb;

alter table public.profiles
  add column if not exists unsubscribe_secret text not null default encode(gen_random_bytes(16), 'hex');
