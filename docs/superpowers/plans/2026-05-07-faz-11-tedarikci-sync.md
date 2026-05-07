# Faz 11 — Tedarikçi Sync (Cheerio + Cron) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** Tedarikçi sitelerinden ürün fiyat/stok bilgisini otomatik çek; %5'ten büyük değişimleri ve stok bitmelerini admin paneline notification + günlük özet e-posta olarak ilet. Hem cron ile periyodik hem admin UI'dan manuel run.

**Architecture:**
- `suppliers` + `supplier_products` tabloları (yeni migration `0012`)
- Adapter pattern: her tedarikçi için bir TypeScript adapter (DOM selector mantığı kodda kalır, URL'ler DB'de)
- `lib/suppliers/registry.ts`: slug → adapter map; admin UI yeni tedarikçi ekleyince mevcut adapter'lardan birini seçer
- `lib/suppliers/sync.ts`: fetch + parse + diff + notification + DB update
- Notifications mevcut `notifications` tablosunu kullanır (type'lar 0010'da zaten var: `PRICE_INCREASE | PRICE_DECREASE | OUT_OF_STOCK | SUPPLIER_GONE`)
- Daily rollup e-posta admin'e (canReceive check yok — admin transaksiyonel sayar)
- **No real supplier in this phase.** Bir `ExampleAdapter` ekleriz (test fixture HTML ile). Gerçek bayi adapter'ları sonra eklenir.

**Tech Stack:**
- `cheerio` (HTML parser)
- Native `fetch` + `AbortController` (timeout)
- `@vercel/cron` (otomatik) veya manuel `npm run sync:run`
- Mevcut: pg, sendEmail, notifications, admin layout

---

## Task 1: Migration — suppliers + supplier_products + last_supplier_sync

**Files:**
- Create: `supabase/migrations/0012_suppliers.sql`
- Create: `supabase/migrations/combined_for_paste_v10.sql`
- Modify: `lib/db/types.ts` (Supplier, SupplierProduct, NotificationType extension)

- [ ] **Step 1: Migration SQL**

```sql
-- 0012_suppliers.sql
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  base_url text,
  adapter_slug text not null,
  enabled boolean not null default true,
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now()
);

create index if not exists suppliers_enabled_idx on public.suppliers(enabled) where enabled = true;

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_url text not null,
  last_price numeric(12,2),
  last_stock integer,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique(supplier_id, product_id)
);

create index if not exists supplier_products_product_idx on public.supplier_products(product_id);
create index if not exists supplier_products_supplier_idx on public.supplier_products(supplier_id);

alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;

drop policy if exists "suppliers_admin_all" on public.suppliers;
create policy "suppliers_admin_all" on public.suppliers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "supplier_products_admin_all" on public.supplier_products;
create policy "supplier_products_admin_all" on public.supplier_products
  for all using (public.is_admin()) with check (public.is_admin());
```

- [ ] **Step 2: combined_for_paste_v10.sql üret**

`combined_for_paste_v9.sql` içeriğini oku. Tam içeriği v10 dosyasına kopyala. Sonuna `0012` SQL'i ekle (verification query'sinden ÖNCE).

Verification query'ye iki ekleme yap:
```sql
to_regclass('public.suppliers')         is not null as suppliers_exists,
to_regclass('public.supplier_products') is not null as supplier_products_exists,
```

- [ ] **Step 3: Types**

`lib/db/types.ts`'e ekle:

```ts
export interface Supplier {
  id: string;
  slug: string;
  name: string;
  baseUrl: string | null;
  adapterSlug: string;
  enabled: boolean;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  createdAt: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  supplierUrl: string;
  lastPrice: number | null;
  lastStock: number | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
}
```

`Notification` type union zaten doğru (0010'da `PRICE_INCREASE | PRICE_DECREASE | OUT_OF_STOCK | SUPPLIER_GONE` var). Doğrula.

- [ ] **Step 4: Migration'ı uygula**

```powershell
npm run db:apply
```

Beklenen: v10 başarıyla uygulanır. Doğrulama için:

```powershell
npx tsx scripts/db-check.ts
```

(scripts/db-check.ts'i suppliers + supplier_products kontrolü için extend etmek gerekebilir — basit ek satır.)

- [ ] **Step 5: Build + commit**

```powershell
npm run build
git add supabase/migrations/0012_suppliers.sql supabase/migrations/combined_for_paste_v10.sql lib/db/types.ts
git commit -m "feat(db): add suppliers + supplier_products tables for price sync"
```

---

## Task 2: cheerio + fetch utility

**Files:**
- Create: `lib/suppliers/fetch-html.ts`
- Create: `tests/lib/suppliers/fetch-html.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/lib/suppliers/fetch-html.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHtml } from '@/lib/suppliers/fetch-html';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('fetchHtml', () => {
  it('returns cheerio root for 200 response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '<html><body><h1>Hello</h1></body></html>',
    });
    const result = await fetchHtml('https://example.com/x');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html('h1').text()).toBe('Hello');
    }
  });

  it('sets Zolarr User-Agent', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: async () => '<html></html>' });
    await fetchHtml('https://example.com/x');
    const callArgs = fetchMock.mock.calls[0]?.[1];
    expect(callArgs?.headers?.['User-Agent']).toMatch(/ZolarrBot/);
  });

  it('returns ok:false for 404', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404, text: async () => '' });
    const result = await fetchHtml('https://example.com/missing');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/404/);
    }
  });

  it('returns ok:false on fetch throw', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await fetchHtml('https://example.com/x');
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Test fail**

```powershell
npm test -- --run tests/lib/suppliers/fetch-html.test.ts
```

- [ ] **Step 3: Implementation**

```ts
// lib/suppliers/fetch-html.ts
import 'server-only';
import * as cheerio from 'cheerio';

const USER_AGENT = 'ZolarrBot/1.0 (+https://zolarr.com)';
const TIMEOUT_MS = 12_000;

export type FetchHtmlResult =
  | { ok: true; html: cheerio.CheerioAPI; status: number }
  | { ok: false; error: string };

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.5',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    return { ok: true, html: cheerio.load(text), status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 4: Install cheerio**

```powershell
npm install cheerio
```

- [ ] **Step 5: Test pass**

Beklenen: 4 test geçer.

- [ ] **Step 6: Commit**

```powershell
git add lib/suppliers/fetch-html.ts tests/lib/suppliers/fetch-html.test.ts package.json package-lock.json
git commit -m "feat(suppliers): add fetchHtml utility with timeout + UA + cheerio"
```

---

## Task 3: Adapter interface + ExampleAdapter + registry

**Files:**
- Create: `lib/suppliers/adapter-types.ts`
- Create: `lib/suppliers/adapters/example.ts`
- Create: `lib/suppliers/registry.ts`
- Create: `tests/fixtures/example-supplier-product.html`
- Create: `tests/lib/suppliers/adapters/example.test.ts`

- [ ] **Step 1: Adapter types**

```ts
// lib/suppliers/adapter-types.ts
import type * as cheerio from 'cheerio';

export interface ParsedProduct {
  price: number;
  stock: number; // 0 = out of stock; positive = in stock
}

export interface SupplierAdapter {
  slug: string;
  displayName: string;
  parseProduct(html: cheerio.CheerioAPI): ParsedProduct | null;
}
```

- [ ] **Step 2: Test fixture HTML**

`tests/fixtures/example-supplier-product.html`:

```html
<!doctype html>
<html><body>
  <h1 class="product-title">Solar Panel 540W</h1>
  <div class="product-price">12.500,00 TL</div>
  <div class="product-stock" data-stock="7">Stokta var (7 adet)</div>
</body></html>
```

- [ ] **Step 3: Failing test**

```ts
// tests/lib/suppliers/adapters/example.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { exampleAdapter } from '@/lib/suppliers/adapters/example';

const fixture = readFileSync(join(process.cwd(), 'tests/fixtures/example-supplier-product.html'), 'utf8');

describe('exampleAdapter', () => {
  it('parses price and stock from fixture', () => {
    const $ = cheerio.load(fixture);
    const result = exampleAdapter.parseProduct($);
    expect(result).toEqual({ price: 12500, stock: 7 });
  });

  it('returns null when selectors not found', () => {
    const $ = cheerio.load('<html><body>Nothing</body></html>');
    expect(exampleAdapter.parseProduct($)).toBeNull();
  });

  it('parses Turkish thousand separator correctly', () => {
    const $ = cheerio.load('<div class="product-price">1.250,50 TL</div><div class="product-stock" data-stock="3"></div>');
    expect(exampleAdapter.parseProduct($)).toEqual({ price: 1250.5, stock: 3 });
  });

  it('returns stock 0 when data-stock="0"', () => {
    const $ = cheerio.load('<div class="product-price">100 TL</div><div class="product-stock" data-stock="0"></div>');
    expect(exampleAdapter.parseProduct($)?.stock).toBe(0);
  });
});
```

- [ ] **Step 4: ExampleAdapter implementation**

```ts
// lib/suppliers/adapters/example.ts
import type { SupplierAdapter, ParsedProduct } from '../adapter-types';

function parseTurkishNumber(s: string): number | null {
  // "12.500,00 TL" → 12500.00
  const cleaned = s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export const exampleAdapter: SupplierAdapter = {
  slug: 'example',
  displayName: 'Example Supplier (test)',
  parseProduct(html): ParsedProduct | null {
    const priceRaw = html('.product-price').text().trim();
    const stockRaw = html('.product-stock').attr('data-stock');
    if (!priceRaw || stockRaw === undefined) return null;
    const price = parseTurkishNumber(priceRaw);
    const stock = Number(stockRaw);
    if (price === null || !Number.isFinite(stock)) return null;
    return { price, stock };
  },
};
```

- [ ] **Step 5: Registry**

```ts
// lib/suppliers/registry.ts
import type { SupplierAdapter } from './adapter-types';
import { exampleAdapter } from './adapters/example';

const REGISTRY: Record<string, SupplierAdapter> = {
  [exampleAdapter.slug]: exampleAdapter,
};

export function getAdapter(slug: string): SupplierAdapter | null {
  return REGISTRY[slug] ?? null;
}

export function listAdapters(): SupplierAdapter[] {
  return Object.values(REGISTRY);
}
```

- [ ] **Step 6: Test pass (4 tests)**

- [ ] **Step 7: Commit**

```powershell
git add lib/suppliers/adapter-types.ts lib/suppliers/adapters/example.ts lib/suppliers/registry.ts tests/fixtures/example-supplier-product.html tests/lib/suppliers/adapters/example.test.ts
git commit -m "feat(suppliers): add adapter interface + ExampleAdapter + registry"
```

---

## Task 4: Sync runner — diff + notification + DB update

**Files:**
- Create: `lib/suppliers/sync.ts`
- Create: `lib/db/queries/admin/suppliers.ts`
- Create: `tests/lib/suppliers/sync.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/lib/suppliers/sync.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetchHtml
const fetchHtmlMock = vi.fn();
vi.mock('@/lib/suppliers/fetch-html', () => ({
  fetchHtml: fetchHtmlMock,
}));

// Mock createAdminClient + 'server-only'
const fromMock = vi.fn();
const supabaseMock = { from: fromMock };
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => supabaseMock,
}));

beforeEach(() => {
  fetchHtmlMock.mockReset();
  fromMock.mockReset();
});

describe('syncSupplier diff logic', () => {
  it('marks PRICE_INCREASE when price up >5%', async () => {
    // (Setup: mock supplier_products fetch, mock fetchHtml return, expect notification insert)
    // ... see implementation Task 4
  });
  // ... more tests
});
```

(Bu task büyük — testler implementation ile birlikte yazılacak. Detay aşağıda.)

- [ ] **Step 2: Sync function**

```ts
// lib/suppliers/sync.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchHtml } from './fetch-html';
import { getAdapter } from './registry';

const PRICE_DIFF_THRESHOLD = 0.05; // 5%

export interface SyncResult {
  supplierId: string;
  total: number;
  updated: number;
  alerts: number;
  errors: number;
  changes: SyncChange[];
}

export interface SyncChange {
  productId: string;
  type: 'PRICE_INCREASE' | 'PRICE_DECREASE' | 'OUT_OF_STOCK' | 'BACK_IN_STOCK' | 'ERROR';
  oldPrice: number | null;
  newPrice: number | null;
  oldStock: number | null;
  newStock: number | null;
  message?: string;
}

export async function syncSupplier(supplierId: string): Promise<SyncResult> {
  const sb = createAdminClient();
  const { data: supplier } = await sb.from('suppliers').select('*').eq('id', supplierId).maybeSingle();
  if (!supplier) {
    return { supplierId, total: 0, updated: 0, alerts: 0, errors: 1, changes: [] };
  }
  const supRow = supplier as { adapter_slug: string; enabled: boolean };
  const adapter = getAdapter(supRow.adapter_slug);
  if (!adapter) {
    await sb.from('suppliers').update({ last_sync_error: `Bilinmeyen adapter: ${supRow.adapter_slug}` }).eq('id', supplierId);
    return { supplierId, total: 0, updated: 0, alerts: 0, errors: 1, changes: [] };
  }

  const { data: products } = await sb
    .from('supplier_products')
    .select('id,product_id,supplier_url,last_price,last_stock')
    .eq('supplier_id', supplierId);

  const items = (products ?? []) as Array<{
    id: string;
    product_id: string;
    supplier_url: string;
    last_price: number | null;
    last_stock: number | null;
  }>;

  let updated = 0;
  let alerts = 0;
  let errors = 0;
  const changes: SyncChange[] = [];

  for (const item of items) {
    const fetched = await fetchHtml(item.supplier_url);
    if (!fetched.ok) {
      errors++;
      changes.push({
        productId: item.product_id,
        type: 'ERROR',
        oldPrice: item.last_price,
        newPrice: null,
        oldStock: item.last_stock,
        newStock: null,
        message: fetched.error,
      });
      await sb.from('supplier_products').update({ last_error: fetched.error, last_synced_at: new Date().toISOString() }).eq('id', item.id);
      continue;
    }
    const parsed = adapter.parseProduct(fetched.html);
    if (!parsed) {
      errors++;
      changes.push({
        productId: item.product_id,
        type: 'ERROR',
        oldPrice: item.last_price,
        newPrice: null,
        oldStock: item.last_stock,
        newStock: null,
        message: 'Adapter parse başarısız (selector kırıldı?)',
      });
      // SUPPLIER_GONE notification only when persistent
      await sb.from('supplier_products').update({ last_error: 'Parse failed', last_synced_at: new Date().toISOString() }).eq('id', item.id);
      continue;
    }

    // Diff
    const oldPrice = item.last_price;
    const oldStock = item.last_stock;
    const { price, stock } = parsed;

    let priceChange: 'PRICE_INCREASE' | 'PRICE_DECREASE' | null = null;
    if (oldPrice !== null && oldPrice > 0) {
      const ratio = (price - oldPrice) / oldPrice;
      if (ratio >= PRICE_DIFF_THRESHOLD) priceChange = 'PRICE_INCREASE';
      else if (ratio <= -PRICE_DIFF_THRESHOLD) priceChange = 'PRICE_DECREASE';
    }

    let stockChange: 'OUT_OF_STOCK' | 'BACK_IN_STOCK' | null = null;
    if ((oldStock ?? 0) > 0 && stock === 0) stockChange = 'OUT_OF_STOCK';
    else if ((oldStock ?? 0) === 0 && stock > 0) stockChange = 'BACK_IN_STOCK';

    if (priceChange || stockChange) {
      alerts++;
      if (priceChange) {
        await sb.from('notifications').insert({
          type: priceChange,
          payload: {
            supplier_id: supplierId,
            product_id: item.product_id,
            old_price: oldPrice,
            new_price: price,
          },
        });
        changes.push({ productId: item.product_id, type: priceChange, oldPrice, newPrice: price, oldStock, newStock: stock });
      }
      if (stockChange === 'OUT_OF_STOCK') {
        await sb.from('notifications').insert({
          type: 'OUT_OF_STOCK',
          payload: { supplier_id: supplierId, product_id: item.product_id },
        });
        changes.push({ productId: item.product_id, type: 'OUT_OF_STOCK', oldPrice, newPrice: price, oldStock, newStock: stock });
      }
      // BACK_IN_STOCK için ayrı notification type yok; mevcut sistem stok alert'i ürün düzenlemesinde tetikliyor
    }

    await sb.from('supplier_products').update({
      last_price: price,
      last_stock: stock,
      last_synced_at: new Date().toISOString(),
      last_error: null,
    }).eq('id', item.id);
    updated++;
  }

  await sb.from('suppliers').update({
    last_synced_at: new Date().toISOString(),
    last_sync_error: errors > 0 ? `${errors} ürün hatalı` : null,
  }).eq('id', supplierId);

  return { supplierId, total: items.length, updated, alerts, errors, changes };
}
```

- [ ] **Step 3: Admin queries**

```ts
// lib/db/queries/admin/suppliers.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Supplier, SupplierProduct } from '@/lib/db/types';

export async function listSuppliers(): Promise<Supplier[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from('suppliers').select('*').order('name');
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    baseUrl: (r.base_url as string | null) ?? null,
    adapterSlug: r.adapter_slug as string,
    enabled: r.enabled as boolean,
    lastSyncedAt: (r.last_synced_at as string | null) ?? null,
    lastSyncError: (r.last_sync_error as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

export async function listSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from('supplier_products').select('*').eq('supplier_id', supplierId);
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    supplierId: r.supplier_id as string,
    productId: r.product_id as string,
    supplierUrl: r.supplier_url as string,
    lastPrice: (r.last_price as number | null) ?? null,
    lastStock: (r.last_stock as number | null) ?? null,
    lastSyncedAt: (r.last_synced_at as string | null) ?? null,
    lastError: (r.last_error as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}
```

- [ ] **Step 4: Test (mock-heavy)**

Test'in tam halini implementer yazsın — fetchHtml + supabase mock ile diff senaryolarını cover etsin:
- Price up 10% → PRICE_INCREASE notification + supplier_products update
- Price down 10% → PRICE_DECREASE
- Stock 5 → 0 → OUT_OF_STOCK
- fetchHtml fail → ERROR + last_error set
- adapter parse null → ERROR
- Price diff %3 → no notification (under threshold)

En az 5 test.

- [ ] **Step 5: Build + tests + commit**

```powershell
git add lib/suppliers/sync.ts lib/db/queries/admin/suppliers.ts tests/lib/suppliers/sync.test.ts
git commit -m "feat(suppliers): add sync runner with diff/notification/DB update"
```

---

## Task 5: Daily rollup admin e-postası

**Files:**
- Create: `lib/email/templates/supplier-sync-summary.ts`
- Create: `tests/lib/email/templates/supplier-sync-summary.test.ts`

- [ ] **Step 1: Test**

```ts
// tests/lib/email/templates/supplier-sync-summary.test.ts
import { describe, it, expect } from 'vitest';
import { supplierSyncSummaryEmail } from '@/lib/email/templates/supplier-sync-summary';

describe('supplierSyncSummaryEmail', () => {
  const sample = {
    runAt: '2026-05-08T06:00:00Z',
    suppliers: [
      { name: 'Tedarikçi A', total: 10, updated: 10, alerts: 2, errors: 0 },
      { name: 'Tedarikçi B', total: 5, updated: 4, alerts: 1, errors: 1 },
    ],
    totalAlerts: 3,
    totalErrors: 1,
  };
  it('subject mentions alert count', () => {
    const e = supplierSyncSummaryEmail(sample);
    expect(e.subject).toContain('3');
  });
  it('html lists each supplier', () => {
    const e = supplierSyncSummaryEmail(sample);
    expect(e.html).toContain('Tedarikçi A');
    expect(e.html).toContain('Tedarikçi B');
  });
  it('shows error indicator when errors > 0', () => {
    const e = supplierSyncSummaryEmail(sample);
    expect(e.html.toLowerCase()).toMatch(/hata/);
  });
});
```

- [ ] **Step 2: Template**

```ts
// lib/email/templates/supplier-sync-summary.ts
import { renderEmail, escapeHtml } from '../template';

export interface SupplierSummaryRow {
  name: string;
  total: number;
  updated: number;
  alerts: number;
  errors: number;
}

export interface SupplierSyncSummaryData {
  runAt: string;
  suppliers: SupplierSummaryRow[];
  totalAlerts: number;
  totalErrors: number;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function supplierSyncSummaryEmail(d: SupplierSyncSummaryData) {
  const subject = `Tedarikçi Sync Özeti · ${d.totalAlerts} uyarı${d.totalErrors > 0 ? `, ${d.totalErrors} hata` : ''}`;
  const rows = d.suppliers.map((s) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #262626;">${escapeHtml(s.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #262626;text-align:right;">${s.updated}/${s.total}</td>
      <td style="padding:8px;border-bottom:1px solid #262626;text-align:right;color:${s.alerts > 0 ? '#5DD62C' : '#888'};">${s.alerts}</td>
      <td style="padding:8px;border-bottom:1px solid #262626;text-align:right;color:${s.errors > 0 ? '#ff5555' : '#888'};">${s.errors}</td>
    </tr>
  `).join('');

  const body = `
    <h2 style="margin:0 0 16px;color:#fff;">Tedarikçi Sync Özeti</h2>
    <p style="color:#888;font-size:13px;">Çalışma zamanı: ${escapeHtml(new Date(d.runAt).toLocaleString('tr-TR'))}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      <thead>
        <tr style="color:#888;font-size:12px;text-align:left;">
          <th style="padding:8px;border-bottom:2px solid #262626;">Tedarikçi</th>
          <th style="padding:8px;border-bottom:2px solid #262626;text-align:right;">Güncelleme</th>
          <th style="padding:8px;border-bottom:2px solid #262626;text-align:right;">Uyarı</th>
          <th style="padding:8px;border-bottom:2px solid #262626;text-align:right;">Hata</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;font-size:14px;">
      Toplam <strong>${d.totalAlerts}</strong> uyarı, <strong>${d.totalErrors}</strong> hata.
    </p>
    <div style="margin-top:24px;">
      <a href="${SITE}/admin/tedarikciler" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Admin panelinde aç</a>
    </div>
  `;
  return { subject, html: renderEmail({ title: subject, body }) };
}
```

- [ ] **Step 3: Test pass + commit**

```powershell
git add lib/email/templates/supplier-sync-summary.ts tests/lib/email/templates/supplier-sync-summary.test.ts
git commit -m "feat(email): add supplier sync summary email template"
```

---

## Task 6: Admin tedarikçiler UI + manual run

**Files:**
- Create: `lib/server-actions/admin/sync-supplier.ts`
- Create: `lib/server-actions/admin/upsert-supplier.ts`
- Create: `lib/validation/supplier-schema.ts`
- Create: `components/admin/supplier-form.tsx`
- Create: `components/admin/sync-button.tsx`
- Create: `app/admin/tedarikciler/page.tsx`
- Create: `app/admin/tedarikciler/yeni/page.tsx`
- Create: `app/admin/tedarikciler/[id]/page.tsx`

- [ ] **Step 1: Schema + actions**

```ts
// lib/validation/supplier-schema.ts
import { z } from 'zod';

export const supplierSchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, 'Sadece küçük harf/rakam/tire'),
  name: z.string().min(2).max(120),
  baseUrl: z.string().url().nullable().optional().or(z.literal('')),
  adapterSlug: z.string().min(1),
  enabled: z.boolean(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
```

```ts
// lib/server-actions/admin/upsert-supplier.ts
'use server';
import 'server-only';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { supplierSchema } from '@/lib/validation/supplier-schema';

export type UpsertSupplierResult = { ok: true; id: string } | { ok: false; error: string };

function toRow(d: ReturnType<typeof supplierSchema.parse>) {
  return {
    slug: d.slug,
    name: d.name,
    base_url: d.baseUrl || null,
    adapter_slug: d.adapterSlug,
    enabled: d.enabled,
  };
}

export async function createSupplierAction(input: unknown): Promise<UpsertSupplierResult> {
  await requireAdmin();
  const r = supplierSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { data, error } = await sb.from('suppliers').insert(toRow(r.data)).select('id').single();
  if (error) {
    console.error('[admin] createSupplierAction failed', { error });
    return { ok: false, error: 'Tedarikçi oluşturulamadı.' };
  }
  revalidatePath('/admin/tedarikciler');
  redirect(`/admin/tedarikciler/${(data as { id: string }).id}`);
}

export async function updateSupplierAction(id: string, input: unknown): Promise<UpsertSupplierResult> {
  await requireAdmin();
  const r = supplierSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { error } = await sb.from('suppliers').update(toRow(r.data)).eq('id', id);
  if (error) {
    console.error('[admin] updateSupplierAction failed', { id, error });
    return { ok: false, error: 'Güncellenemedi.' };
  }
  revalidatePath('/admin/tedarikciler');
  revalidatePath(`/admin/tedarikciler/${id}`);
  return { ok: true, id };
}
```

```ts
// lib/server-actions/admin/sync-supplier.ts
'use server';
import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/server';
import { syncSupplier } from '@/lib/suppliers/sync';

export type SyncSupplierResult = { ok: true; alerts: number; updated: number; errors: number } | { ok: false; error: string };

export async function syncSupplierAction(supplierId: string): Promise<SyncSupplierResult> {
  await requireAdmin();
  try {
    const result = await syncSupplier(supplierId);
    revalidatePath('/admin/tedarikciler');
    revalidatePath(`/admin/tedarikciler/${supplierId}`);
    return { ok: true, alerts: result.alerts, updated: result.updated, errors: result.errors };
  } catch (e) {
    console.error('[admin] syncSupplierAction failed', { supplierId, error: e });
    return { ok: false, error: 'Sync başarısız.' };
  }
}
```

- [ ] **Step 2: SyncButton component**

```tsx
// components/admin/sync-button.tsx
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { syncSupplierAction } from '@/lib/server-actions/admin/sync-supplier';

export function SyncButton({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setMsg(null);
    const res = await syncSupplierAction(supplierId);
    setPending(false);
    if (res.ok) {
      setMsg(`✓ ${res.updated} ürün, ${res.alerts} uyarı, ${res.errors} hata`);
      router.refresh();
    } else {
      setMsg(`Hata: ${res.error}`);
    }
    setTimeout(() => setMsg(null), 5000);
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" onClick={onClick} disabled={pending}>
        {pending ? 'Sync ediliyor…' : 'Şimdi sync et'}
      </Button>
      {msg && <span className="text-xs text-[var(--color-text-muted)]">{msg}</span>}
    </div>
  );
}
```

- [ ] **Step 3: SupplierForm**

ProductForm/CategoryForm pattern. Field'lar: slug, name, baseUrl, adapterSlug (dropdown — `listAdapters()` döndürüyor), enabled.

```tsx
// components/admin/supplier-form.tsx (özet — Field helper aynı pattern)
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supplierSchema, type SupplierInput } from '@/lib/validation/supplier-schema';
import { createSupplierAction, updateSupplierAction } from '@/lib/server-actions/admin/upsert-supplier';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<SupplierInput> & { id?: string };
  adapters: { slug: string; displayName: string }[];
}

export function SupplierForm({ mode, initial, adapters }: Props) {
  // ... aynı pattern: useState, safeParse on submit, Field helper, Kaydet button
  // (full kodu detayı implementer yazsın — pattern aynı)
}
```

- [ ] **Step 4: Pages**

```tsx
// app/admin/tedarikciler/page.tsx
import Link from 'next/link';
import { listSuppliers } from '@/lib/db/queries/admin/suppliers';
import { Button } from '@/components/ui/button';
import { SyncButton } from '@/components/admin/sync-button';
import { StatusBadge } from '@/components/admin/status-badge';

export const dynamic = 'force-dynamic';

export default async function AdminTedarikcilerPage() {
  const list = await listSuppliers();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Tedarikçiler</h1>
        <Button asChild><Link href="/admin/tedarikciler/yeni">+ Yeni Tedarikçi</Link></Button>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Adapter</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Son sync</th>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.adapterSlug}</td>
                <td className="px-4 py-3"><StatusBadge status={s.enabled ? 'approved' : 'archived'} label={s.enabled ? 'Aktif' : 'Kapalı'} /></td>
                <td className="px-4 py-3 text-xs">{s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString('tr-TR') : '—'}</td>
                <td className="px-4 py-3"><SyncButton supplierId={s.id} /></td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/tedarikciler/${s.id}`} className="text-[var(--color-brand)] hover:underline">Düzenle</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-4 text-sm text-[var(--color-text-muted)]">Henüz tedarikçi yok.</p>}
      </div>
    </div>
  );
}
```

`yeni/page.tsx`: `<SupplierForm mode="create" adapters={listAdapters().map(a => ({slug: a.slug, displayName: a.displayName}))} />`

`[id]/page.tsx`: `getSupplier(id)` + `<SupplierForm mode="edit" initial={...} adapters={...} />`. Ayrıca aşağıda `listSupplierProducts(id)` listele.

- [ ] **Step 5: Sidebar link**

`components/admin/sidebar.tsx`'i oku. Mevcut menüye "Tedarikçiler" ekle.

- [ ] **Step 6: Build + commit**

```powershell
git add lib/validation/supplier-schema.ts lib/server-actions/admin/upsert-supplier.ts lib/server-actions/admin/sync-supplier.ts components/admin/supplier-form.tsx components/admin/sync-button.tsx app/admin/tedarikciler components/admin/sidebar.tsx
git commit -m "feat(admin): add suppliers management UI + manual sync"
```

---

## Task 7: Vercel cron — günlük tüm tedarikçileri sync

**Files:**
- Create: `app/api/cron/sync-suppliers/route.ts`
- Modify: `vercel.json` (yoksa create)
- Modify: `.env.example` (CRON_SECRET ekle)

- [ ] **Step 1: Cron route**

```ts
// app/api/cron/sync-suppliers/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncSupplier } from '@/lib/suppliers/sync';
import { sendEmail } from '@/lib/email/send';
import { supplierSyncSummaryEmail } from '@/lib/email/templates/supplier-sync-summary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Vercel Cron auth
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = createAdminClient();
  const { data: suppliers } = await sb.from('suppliers').select('id,name').eq('enabled', true);
  const list = (suppliers ?? []) as Array<{ id: string; name: string }>;

  const summaries: Array<{ name: string; total: number; updated: number; alerts: number; errors: number }> = [];
  let totalAlerts = 0;
  let totalErrors = 0;

  for (const s of list) {
    const result = await syncSupplier(s.id);
    summaries.push({ name: s.name, total: result.total, updated: result.updated, alerts: result.alerts, errors: result.errors });
    totalAlerts += result.alerts;
    totalErrors += result.errors;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && (totalAlerts > 0 || totalErrors > 0)) {
    await sendEmail({
      to: adminEmail,
      ...supplierSyncSummaryEmail({
        runAt: new Date().toISOString(),
        suppliers: summaries,
        totalAlerts,
        totalErrors,
      }),
    });
  }

  return NextResponse.json({ ok: true, summaries, totalAlerts, totalErrors });
}
```

- [ ] **Step 2: vercel.json**

`vercel.json`'i oku — yoksa oluştur, varsa cron sekmesi ekle:

```json
{
  "crons": [
    { "path": "/api/cron/sync-suppliers", "schedule": "0 6 * * *" }
  ]
}
```

(06:00 UTC = 09:00 TRT.)

- [ ] **Step 3: .env.example**

```
CRON_SECRET=...
```

`.env.local`'a kullanıcı ekleyecek (rastgele uzun string). Plan'da bunu kullanıcıya hatırlat.

- [ ] **Step 4: Commit**

```powershell
git add app/api/cron/sync-suppliers/route.ts vercel.json .env.example
git commit -m "feat(suppliers): add daily cron job + summary email"
```

---

## Task 8: Manuel runner script (Vercel olmadan da çalışsın)

**Files:**
- Create: `scripts/sync-suppliers.ts`
- Modify: `package.json` (`sync:run` komutu)

Vercel olmayan (lokal test, başka host) durum için CLI script.

- [ ] **Step 1: Script**

```ts
// scripts/sync-suppliers.ts
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

loadEnv({ path: '.env.local' });

async function main() {
  // syncSupplier serviceRole + Next.js çalışma zamanına bağımlı
  // Bu script Next.js dışında çalıştığı için doğrudan supabase-js kullanır
  const { syncSupplier } = await import('../lib/suppliers/sync');
  // syncSupplier 'server-only' import ediyor — bu vitest aliası ile çözüldü
  // CLI için: env'lerin set olması yeterli
  // ...
  // Implementation: syncSupplier'i çağırmak için Next runtime'a bağımlı.
  // Daha temiz alternatif: scripts/sync-suppliers.ts curl ile cron route'u tetikler.
}
```

**Daha basit yaklaşım:** scripts/sync-suppliers.ts sadece curl'a sarmalayıcı:

```ts
// scripts/sync-suppliers.ts
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

async function main() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET .env.local içinde tanımlı değil');
    process.exit(1);
  }
  const res = await fetch(`${url}/api/cron/sync-suppliers`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

`package.json`:
```
"sync:run": "tsx scripts/sync-suppliers.ts"
```

Kullanıcı yerelde test ederken: `npm run dev` (terminal 1) + `npm run sync:run` (terminal 2).

- [ ] **Step 2: Commit**

```powershell
git add scripts/sync-suppliers.ts package.json
git commit -m "feat(suppliers): add CLI wrapper to trigger sync route"
```

---

## Task 9: Final verification + completion report

**Files:**
- Create: `docs/superpowers/plans/2026-05-07-faz-11-completion.md`

- [ ] **Step 1: Run all tests**

```powershell
npm test -- --run
```

Beklenen: 198 + 4 (fetch) + 4 (adapter) + 5 (sync) + 3 (summary) ≈ **214/214**.

- [ ] **Step 2: Build**

```powershell
npm run build
```

- [ ] **Step 3: Manuel smoke test**

1. `npm run db:apply` (v10 uygula)
2. Admin'de bir tedarikçi oluştur (`example` adapter ile, base_url `https://example.com`)
3. Bir ürünü tedarikçi ile bağla (DB'ye manuel `supplier_products` insert — admin UI v1'de bu yok, sonra eklenir)
4. SyncButton'a bas — error verir (example.com'da product yok) ama akış çalışır
5. `notifications` tablosuna kayıt geliyor mu kontrol et

- [ ] **Step 4: CRON_SECRET üret + .env.local'a ekle**

Hatırlat: `openssl rand -hex 32` ya da herhangi 64-karakter random string.

- [ ] **Step 5: Completion report yaz**

Standart format. Yeni route'lar (`/admin/tedarikciler*`, `/api/cron/sync-suppliers`), yeni dosyalar, sayılar, sınırlamalar.

Sınırlamalar:
- ExampleAdapter sadece test fixture içindir; gerçek tedarikçi adapter'ı eklenecek (kullanıcı seçecek)
- supplier_products eklemek için admin UI v1'de yok — sonra eklenecek
- Cron sadece Vercel'de çalışır; başka host'larda manuel `npm run sync:run` veya kendi cron sistemi
- robots.txt riayet kontrolü yapılmıyor (TODO Faz 12+)

- [ ] **Step 6: Commit + push**

```powershell
git add docs/superpowers/plans/2026-05-07-faz-11-completion.md
git commit -m "docs: Faz 11 completion report"
git push origin master
```

---

## Self-Review

- [ ] Migration idempotent (`if not exists`, `drop if exists`)
- [ ] Adapter pattern: yeni tedarikçi eklerken sadece adapter dosyası + registry'e kayıt
- [ ] sync.ts: PRICE_DIFF_THRESHOLD = 0.05, OUT_OF_STOCK eşiği oldStock>0 && newStock=0
- [ ] Notifications mevcut tablo + type union ile uyumlu
- [ ] Best-effort: tek ürün hatası tüm sync'i bozmaz
- [ ] Cron auth: Bearer CRON_SECRET
- [ ] Daily summary e-posta sadece alert/error varsa gönderilir
- [ ] Tüm admin actions `requireAdmin()` çağırıyor
- [ ] Tüm yeni testler bağımsız (mock-first)

## Bilinen Riskler

- Bayi siteleri layout değiştirebilir → adapter'ın `parseProduct` `null` döner → ERROR + last_error set → kullanıcı admin UI'da görür
- Rate limiting: aynı domain'e ardışık istek atma — şu an handle edilmiyor (TODO: per-domain serial queue)
- robots.txt riayet etmiyor — yasal risk yok (kamuya açık fiyat) ama nezaketsiz; gelecekte eklenebilir
- IP bloku riski: User-Agent + frequency düşük (günde 1 kez) → düşük risk

## Kapsam Dışı (Faz 12+)

- robots.txt parser
- Per-domain rate-limit queue
- Adapter health monitoring (3 ardışık fail → otomatik enabled=false)
- Diff history (her sync'te eski değerleri sakla)
- Per-product supplier_products UI ekleme (şimdilik DB üzerinden)
- Playwright (JS-rendered siteler)
