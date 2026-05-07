# Faz 11 — Tedarikçi Sync (Cheerio + Cron) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

> **Status:** YAPISAL TASLAK — sıra geldiğinde Faz 10 detay seviyesinde genişletilecek.

**Goal:** Bayi/tedarikçi sitelerinden ürün fiyatı/stoğu otomatik scrape et; değişimleri admin panelinde notification olarak göster ve admin e-postasıyla bildir. Hem cron ile periyodik hem manuel run.

**Architecture:**
- `suppliers` tablo: tedarikçi listesi (slug, name, base_url)
- `supplier_products` tablo: ürün × tedarikçi mapping (product_id, supplier_id, supplier_url, last_price, last_stock, last_synced_at)
- Adapter pattern: `lib/suppliers/adapters/<slug>.ts` — her tedarikçi için custom selector + parse logic
- Generic runner: `lib/suppliers/sync.ts` — adapter'ı çağırır, diff hesaplar, notification + e-posta atar
- Trigger: Vercel Cron (`vercel.json` config) ya da admin manuel run
- **Notifications:** mevcut `notifications` tablosu, type'lar `PRICE_INCREASE | PRICE_DECREASE | OUT_OF_STOCK | SUPPLIER_GONE`

**Tech Stack:**
- `cheerio` (HTML parser)
- `node-fetch` veya native `fetch` (User-Agent header ile)
- Vercel Cron veya cron-parser + DB-tracked schedule

**Tahmini task: 10**

---

## Task 1: DB migration (suppliers + supplier_products)

```sql
-- 0012_suppliers.sql
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  base_url text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_url text not null,
  last_price numeric(12,2),
  last_stock integer,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique(supplier_id, product_id)
);

create index supplier_products_product_idx on public.supplier_products(product_id);
```

`combined_for_paste_v10.sql` üret.

## Task 2: cheerio scraper utility

`lib/suppliers/fetch-html.ts`: User-Agent set, timeout, retry-once, return cheerio root.

```ts
export async function fetchPage(url: string): Promise<cheerio.CheerioAPI | null>
```

## Task 3: Adapter interface + örnek

```ts
// lib/suppliers/adapters/index.ts
export interface SupplierAdapter {
  slug: string;
  parseProduct(url: string, html: cheerio.CheerioAPI): { price: number; stock: number } | null;
}
```

Bir örnek adapter (örn. enerjisa-bayisi.com — kullanıcı seçecek).

## Task 4: Sync runner

```ts
// lib/suppliers/sync.ts
export async function syncSupplier(supplierId: string): Promise<{ updated: number; alerts: number }>
```

Algoritma:
1. supplier_products satırlarını çek
2. Her biri için fetchPage + adapter.parseProduct
3. Eski vs yeni karşılaştır
4. Diff %5'ten büyükse notification yarat (PRICE_INCREASE/DECREASE)
5. Stock 0'a düşmüşse OUT_OF_STOCK notification
6. supplier_products satırını güncelle

## Task 5: Bildirim e-postası — admin'e fiyat değişimi özeti

Günlük tek e-posta (rollup): "12 ürünün fiyatı değişti, 2 stok bitti" — admin'e.

## Task 6: Admin manual run UI

`/admin/tedarikciler` sayfası: tedarikçi listesi + her satırda "Şimdi sync et" butonu.
Server action: `syncSupplierAction(id)` → `syncSupplier(id)` çağırır → revalidate.

## Task 7: Vercel Cron

`vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/sync-suppliers", "schedule": "0 6 * * *" }] }
```

Route: tüm `enabled=true` tedarikçiler için sync → tek admin e-postası gönder.

`CRON_SECRET` env ile auth.

## Task 8: Adapter testi (mock cheerio output)

```ts
const html = readFileSync('tests/fixtures/sample-supplier.html');
const result = adapter.parseProduct('https://...', cheerio.load(html));
expect(result).toEqual({ price: 1200, stock: 5 });
```

## Task 9: Integration test (sync runner)

Mock fetch + adapter → runner doğru notification + DB update yapıyor mu?

## Task 10: Completion report

---

## Bilinen Riskler

- Bayi siteleri layout değiştirebilir → adapter kırılır → SUPPLIER_GONE notification (graceful)
- Rate limiting: aynı domain'e arka arkaya istek atma (sync between domains: parallel; same domain: serial)
- robots.txt riayet et
- IP bloku riski: `User-Agent: ZolarrBot/1.0 (+https://zolarr.com)` set, web admin'lere mailto

## Kapsam Dışı

- Tam web scraping framework (Playwright/Puppeteer) — JS-rendered siteler için. Cheerio statik HTML için yeterli.
- Otomatik adapter generation
