-- 0013_pgvector_embeddings.sql
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
