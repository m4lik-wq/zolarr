# Faz 13 — AI RAG (pgvector) — Completion Report

**Tarih:** 2026-05-07
**Plan:** `docs/superpowers/plans/2026-05-07-faz-13-ai-rag.md` (8 task)
**Commit aralığı:** `bc3c552 → 5137726` (7 feat commit + 1 doc commit)
**Test:** 231/231 (Vitest, 68 dosya) — Faz 12 sonu 223'tü, +8 yeni test
**Build:** Temiz (Next.js 16.2.4)

## Tamamlanan Task'lar

| # | Task | Commit | Yeni test |
|---|---|---|---|
| 1 | pgvector + embeddings + match_embeddings RPC | `bc3c552` | — |
| 2 | EmbeddingProvider abstraction (null + voyage) | `6a0febf` | 4 |
| 3 | Doc serializers (product/project/faq) | `5c2c068` | 4 |
| 4 | Indexer (reindexAll) | `f9cb980` | — |
| 5 | Retrieve query (retrieveContext via RPC) | `fc59a6d` | — |
| 6 | AI chat route context injection | `e4578a0` | — |
| 7 | /admin/ai page + reindex action + cron | `5137726` | — |
| 8 | Verifikasyon + bu rapor | (bu commit) | — |

## Yeni Yetenekler

### 1. Provider abstraction (key-less default)
- `nullProvider` (default): embed/embedBatch null döner; tüm akış graceful skip yapar
- `voyageProvider` (`VOYAGE_API_KEY` env varsa otomatik aktif): Voyage AI API, voyage-2 modeli, 1024 dim, multilingual

### 2. AI RAG akışı (key olunca)
- Kullanıcı sorgusu → embed → top-5 cosine-similar dökümanı match_embeddings RPC ile çek → AI system prompt'a "Bilgi Tabanı" bölümü olarak inject
- Kaynaklar: ürün katalogu, projeler, SSS'ler

### 3. Indexer
- `reindexAll()`: tüm products/projects/faqs sırayla embed eder
- Batch 16, upsert (doc_type, doc_id) — idempotent
- Provider null'sa erken çıkar (`skipped: true`)

### 4. Admin UI
- `/admin/ai` sayfası: per-type embedding count + son indexleme zamanı + "Yeniden indeksle" butonu
- Provider null'sa uyarı banner'ı
- Sidebar'a "AI Bilgi Tabanı" linki (Brain ikonu)

### 5. Cron
- `vercel.json`: `/api/cron/reindex` günde 03:00 UTC (06:00 TRT)
- `CRON_SECRET` Bearer auth
- Provider null'sa anlık skip

## Yeni Routes

```
/admin/ai                  — Embedding stats + reindex button + provider warning
/api/cron/reindex          — Vercel cron daily reindex (Bearer auth)
```

## DB Şema Değişiklikleri (combined_for_paste_v11.sql)

```sql
-- pgvector eklentisi
create extension if not exists vector;

-- embeddings tablosu (1024-dim vector)
create table public.embeddings (
  id uuid primary key default gen_random_uuid(),
  doc_type text check (doc_type in ('product','project','faq')),
  doc_id uuid,
  content text,
  embedding vector(1024),
  metadata jsonb,
  created_at timestamptz,
  unique(doc_type, doc_id)
);

-- ivfflat index (cosine similarity)
create index embeddings_idx on embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RPC: top-K matcher
create function match_embeddings(query_embedding vector(1024), match_count int) ...

-- RLS: sadece admin
create policy "embeddings_admin_only" on embeddings for all using (is_admin());
```

`db-check.ts` doğrulaması: `embeddings_exists: true`, `pgvector_installed: true` ✅

## Mimari Kararlar

1. **Provider abstraction key-less default** — Resend pattern (Faz 9): provider yoksa `null` döner, akış kırılmaz, AI mevcut davranışını korur
2. **Voyage AI** — Anthropic'in önerdiği multilingual provider; Türkçe için diğerlerinden iyi
3. **1024 dim** — voyage-2 default, storage + index hızı dengesi
4. **ivfflat index, lists=100** — küçük veri seti için makul; >100K row olduğunda HNSW veya `lists` artırılabilir
5. **match_embeddings RPC SECURITY DEFINER** — anonim erişim mümkün ama embeddings tablosu RLS sayesinde sadece admin görebilir, RPC arka planda güvenli select yapar
6. **Top-K=5** — Anthropic context window sınırlarına sığar, sürtünmesiz
7. **Daily full reindex** — incremental yok (Faz 14+); basit + güvenilir
8. **Snake_case DB → camelCase TS** — mevcut Profile/Product pattern korundu

## Sayılar

- **Commit:** 8 (7 feat + 1 docs)
- **Yeni dosya:** 13 (8 lib/ai + 1 admin server action + 1 query + 1 component + 1 page + 1 API)
- **Değiştirilen dosya:** 5 (db/types, db-check, ai chat route, vercel.json, sidebar)
- **Yeni test:** 8 (4 provider + 4 serializers)
- **Toplam test:** 231/231
- **Yeni route:** 2 (1 admin + 1 cron)
- **Build:** Temiz

## ⚠️ Anahtar Eklendiğinde

`VOYAGE_API_KEY` `.env.local`'a ekleyince:
1. Dev server **restart** (env değişikliği için)
2. http://localhost:3000/admin/ai → uyarı banner'ı kaybolmalı
3. "Yeniden indeksle" → 5-30 saniye → embedding count'lar artmalı
4. AI Asistan'da soru sor → cevap artık DB içeriğinden besleniyor

`CRON_SECRET` (Faz 11'den) zaten gerekli — eklediyseniz reindex cron de hazır. Production deploy'da Vercel env'ine kopyalamayı unutmayın.

## Manuel Test (key olmadan)

✅ `/admin/ai` → "API anahtarı eksik. Embedding sağlayıcısı: null." uyarısı
✅ Reindex butonu → "Atlandı: API anahtarı yok (provider: null)"
✅ AI chat normal çalışıyor (context injection skip, mevcut Anthropic davranışı korunuyor)

## Bilinen Sınırlamalar

- **Incremental indexing yok** — her reindex tüm dökümanları yeniden embed eder. Az sayıda doc için sorun değil. Büyük katalogda Faz 14'te eklenebilir
- **Hybrid search yok** — sadece vector similarity. Keyword arama (BM25) + vector hybrid daha doğru sonuç verir, gelecekte eklenebilir
- **Re-ranker yok** — top-5 doğrudan AI'a gider. Cohere Rerank veya cross-encoder ile daha iyi sıralama mümkün
- **Per-user knowledge base yok** — global embeddings; kullanıcıya özel bilgi yok
- **Streaming retrieval yok** — retrieve sırasında loading indicator yok (1-2sn alıyor)
- **Tool use yok** — AI fonksiyon çağıramıyor (örn. "stok ne kadar X ürünün?" doğrudan DB'ye sorgu atmıyor; sadece embed'lenmiş bilgiyi görüyor)
- **Embedding model değiştirme zor** — boyut değişirse `embeddings.embedding vector(1024)` kolonu da değişmeli; migration gerekir

## Sonraki Faz

**Faz 14** — Screenshot QA Loop. Plan: `docs/superpowers/plans/2026-05-07-faz-14-screenshot-qa.md` (yapısal — sıra gelince genişletilecek).

Faz 14'te tüm sayfaları light + dark mode'da Playwright ile screenshot alıp Claude Opus ile görsel review + düzeltme döngüsü yapacağız (kullanıcının istediği mükemmeliyetçi pass).

Bundan önce bekleyen anahtarlar var:
- `VOYAGE_API_KEY` — Faz 13 RAG için (opsiyonel)
- `ANTHROPIC_API_KEY` — Faz 5 AI Asistan için (chat zaten çalışıyorsa eklendi demektir)
- `CRON_SECRET` — Faz 11 + Faz 13 cron için (opsiyonel; production'a deploy ederken gerekli)

## Roadmap durumu

| Faz | Durum |
|---|---|
| 10 — Bildirim + KVKK | ✅ TAMAM |
| 11 — Tedarikçi sync | ✅ TAMAM |
| 12 — Recharts dashboard | ✅ TAMAM |
| 13 — AI RAG (pgvector) | ✅ TAMAM (key bekliyor) |
| 14 — Screenshot QA loop | 📋 Yapısal plan hazır |
