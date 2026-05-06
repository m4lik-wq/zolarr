-- 0005_ai_chat_usage.sql
-- IP başına günlük AI sohbet sayacı

create table if not exists public.ai_chat_usage (
  ip_hash text not null,
  day date not null,
  message_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (ip_hash, day)
);

create index if not exists ai_chat_usage_day_idx on public.ai_chat_usage(day);

alter table public.ai_chat_usage enable row level security;

-- Sadece service role insert/update yapar; anon erişimi yok.
-- Policy gerekmez; service role RLS'i bypass eder.
