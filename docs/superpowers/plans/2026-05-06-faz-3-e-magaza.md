# Faz 3 — E-Mağaza Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec §6 e-mağazasını MVP düzeyinde kurmak — kategori ağacı, ürün listesi (`/magaza`), ürün detay (`/magaza/[slug]`), sepet (`/sepet`), seed data, ve homepage entegrasyonu (StockProducts/ProductSlider gerçek DB'den beslenir).

**Architecture:**
- Supabase Postgres veri tabanı; SQL migration dosyaları `supabase/migrations/`'de tutulur (insan tarafından okunabilir, Supabase Studio'da uygulanabilir, MCP ile push edilebilir).
- Sunucu sorguları için `lib/supabase/server.ts` (zaten mevcut). Client tarafı için `lib/supabase/client.ts`.
- Tipler `lib/db/types.ts`'de el yazımı `Database` interface (otomatik gen şu an opsiyonel, ileride `supabase gen types` ile değiştirilebilir).
- Sepet client-side **Zustand** store (`lib/store/cart.ts`), localStorage persist.
- Ürün listesi/filtre URL search params üzerinden (RSC + client filter formu birlikte).

**Tech Stack:** Next.js 16.2.4 App Router, React 19, TypeScript strict, Tailwind 4, Supabase JS (`@supabase/ssr`, `@supabase/supabase-js`), Zustand ^5, Vitest. Mevcut UI primitive'ler (Button, Card, Input, Accordion, ProductCard) yeniden kullanılır.

**Notlar (kritik kurallar):**
- AGENTS.md: Next.js 16 — `node_modules/next/dist/docs/` oku.
- Hardcoded `text-white`/`bg-black` YOK — sadece semantic token.
- Türkçe metin; JSX apostrofu `&apos;`.
- TDD: önce test, sonra implementation. Frequent commit.
- DB migration'ları ASLA otomatik çalıştırma — SQL dosyası üret, kullanıcı uygulasın (veya MCP üzerinden).
- Service role key sadece server-side (`SUPABASE_SERVICE_ROLE_KEY`); browser'a sızdırma.

---

## File Structure

**Yeni dosyalar:**

```
supabase/
  migrations/
    0001_categories_products.sql      — categories + products + indexes
    0002_seed_categories.sql          — 6 kategori + alt kategoriler
    0003_seed_products.sql            — 28 örnek ürün

lib/
  db/
    types.ts                          — Database interface (Supabase Postgres tipleri)
    queries/
      categories.ts                   — getAllCategories, getCategoryTree
      products.ts                     — getProducts (filter/sort), getProductBySlug, getFeaturedProducts
  store/
    cart.ts                           — Zustand cart store + persist
  utils/
    price.ts                          — formatTry, calcDiscount, lineTotal

components/
  shop/
    category-tree.tsx                 — sidebar accordion category list
    filter-panel.tsx                  — fiyat/etiket/stok filtreleri
    sort-bar.tsx                      — search input + sort select + view toggle
    product-grid.tsx                  — listede ürün kartı dizilimi
    product-detail-gallery.tsx        — 5-image + thumbnails + lightbox
    product-detail-tabs.tsx           — Açıklama / Teknik Özellikler tab'ları
    add-to-cart-button.tsx            — adet seçici + sepete ekle
    related-products.tsx              — same-category 4 product carousel
  cart/
    cart-line-item.tsx                — sepet kalemi (görsel/ad/adet/toplam/sil)
    cart-summary.tsx                  — ara toplam, kargo, toplam
    cart-empty.tsx                    — boş sepet state
  layout/
    header-cart-badge.tsx             — header'daki sepet sayısı (client; subscribe to store)

app/
  magaza/
    page.tsx                          — listeleme (RSC, search params)
    loading.tsx                       — skeleton grid
    [slug]/
      page.tsx                        — ürün detay (RSC, generateMetadata)
      not-found.tsx                   — ürün bulunamadı
  sepet/
    page.tsx                          — sepet sayfası (client component, Zustand)

tests/
  lib/
    store/cart.test.ts                — cart store add/remove/qty/persist
    utils/price.test.ts               — formatTry + lineTotal
    db/queries/products.test.ts       — getProducts filter logic (mock supabase client)
  components/
    shop/sort-bar.test.tsx            — search/sort form behavior
    shop/filter-panel.test.tsx        — filter form interaction
    cart/cart-line-item.test.tsx      — qty change emits
    cart/cart-summary.test.tsx        — totals
  app/
    magaza/page.test.tsx              — smoke (mock queries)
    sepet/page.test.tsx               — empty state + with items
```

**Değişen dosyalar:**

```
components/home/stock-products.tsx    — mock yerine getFeaturedProducts query
components/home/product-slider.tsx    — kampanya yerine featured ürünler (kampanya MVP dışında)
components/layout/header.tsx          — sepet ikonuna HeaderCartBadge entegrasyonu
lib/db/schema.ts                      — Drizzle için categories+products+product_tags eklenir (TYPE PARITY için)
.env.example                           — Supabase keys + DATABASE_URL örnekleri
```

---

## Task Sequencing Notes

- **Görev 1-3:** SQL migrations + seed data. Kullanıcı bunları Supabase Studio'da çalıştırmalı (talimat dahil).
- **Görev 4:** Database TypeScript tipleri.
- **Görev 5-6:** Sorgu fonksiyonları.
- **Görev 7-8:** Yardımcılar (price utils + cart store).
- **Görev 9-15:** Mağaza listeleme bileşenleri ve sayfası.
- **Görev 16-20:** Ürün detay sayfası bileşenleri.
- **Görev 21-23:** Sepet sayfası.
- **Görev 24:** Header cart badge.
- **Görev 25:** Anasayfa entegrasyonu (mock → DB).
- **Görev 26:** Final build/test/QA verification + completion report.

---

## Task 1: Migration — categories + products şemaları

**Files:**
- Create: `supabase/migrations/0001_categories_products.sql`

- [ ] **Step 1: SQL dosyasını yaz**

```sql
-- 0001_categories_products.sql
-- Categories (hierarchical tree) + Products (catalog)

create extension if not exists "pgcrypto";

-- ============ CATEGORIES ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  parent_id uuid references public.categories(id) on delete cascade,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_parent_idx on public.categories(parent_id);
create index if not exists categories_sort_idx on public.categories(sort_order);

-- ============ PRODUCTS ============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  brand text,
  sku text,
  price numeric(12, 2) not null check (price >= 0),
  discount_price numeric(12, 2) check (discount_price is null or discount_price >= 0),
  stock int not null default 0,
  track_stock boolean not null default true,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  power_w numeric(10, 2),
  power_kwp numeric(10, 3),
  current_a numeric(8, 2),
  voltage_v numeric(8, 2),
  specs jsonb default '{}'::jsonb,
  images text[] default array[]::text[],
  videos text[] default array[]::text[],
  pdfs text[] default array[]::text[],
  tags text[] default array[]::text[],
  warranty_years int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_category_active_idx on public.products(category_id, is_active);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_tags_gin_idx on public.products using gin(tags);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS — anonim okuma açık (mağaza public), yazma admin için (Faz 8'de policy eklenecek)
alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories
  for select using (true);

drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products
  for select using (is_active = true);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0001_categories_products.sql
git commit -m "feat(db): add categories and products migration"
```

---

## Task 2: Seed — 6 kategori + alt kategoriler

**Files:**
- Create: `supabase/migrations/0002_seed_categories.sql`

- [ ] **Step 1: Seed SQL'i yaz**

```sql
-- 0002_seed_categories.sql

insert into public.categories (slug, name, icon, sort_order, parent_id) values
  ('paneller', 'Güneş Panelleri', 'panel', 1, null),
  ('bataryalar', 'Bataryalar', 'battery', 2, null),
  ('invertorler', 'İnvertörler', 'invertor', 3, null),
  ('aydinlatma', 'Aydınlatma', 'sun', 4, null),
  ('hazir-paketler', 'Hazır Paket Sistemler', 'box', 5, null),
  ('aksesuarlar', 'Aksesuarlar', 'wrench', 6, null)
on conflict (slug) do nothing;

-- alt kategoriler — parent slug ile resolve
with parents as (
  select slug, id from public.categories
)
insert into public.categories (slug, name, parent_id, sort_order) values
  ('monokristal',    'Monokristal',    (select id from parents where slug = 'paneller'), 1),
  ('polikristal',    'Polikristal',    (select id from parents where slug = 'paneller'), 2),
  ('bifacial',       'Bifacial',       (select id from parents where slug = 'paneller'), 3),
  ('topcon',         'TOPCon N-Type',  (select id from parents where slug = 'paneller'), 4),

  ('jel-batarya',    'Jel',            (select id from parents where slug = 'bataryalar'), 1),
  ('lityum',         'Lityum (LiFePO4)', (select id from parents where slug = 'bataryalar'), 2),
  ('agm',            'AGM',            (select id from parents where slug = 'bataryalar'), 3),

  ('tam-sinus',      'Tam Sinüs',      (select id from parents where slug = 'invertorler'), 1),
  ('on-grid',        'On-Grid',        (select id from parents where slug = 'invertorler'), 2),
  ('hibrit',         'Hibrit',         (select id from parents where slug = 'invertorler'), 3),

  ('sokak-lambasi',  'Solar Sokak Lambası', (select id from parents where slug = 'aydinlatma'), 1),
  ('bahce-lambasi',  'Solar Bahçe Lambası', (select id from parents where slug = 'aydinlatma'), 2),

  ('paket-6kw',      '6 kW Sistem',    (select id from parents where slug = 'hazir-paketler'), 1),
  ('paket-10kw',     '10 kW Sistem',   (select id from parents where slug = 'hazir-paketler'), 2),
  ('paket-50kw',     '50 kW Sistem',   (select id from parents where slug = 'hazir-paketler'), 3),

  ('sarj-kontrol',   'Şarj Kontrol Cihazları', (select id from parents where slug = 'aksesuarlar'), 1),
  ('kablo',          'Kablolar',       (select id from parents where slug = 'aksesuarlar'), 2),
  ('konnektor',      'Konektörler',    (select id from parents where slug = 'aksesuarlar'), 3),
  ('montaj',         'Montaj Kitleri', (select id from parents where slug = 'aksesuarlar'), 4)
on conflict (slug) do nothing;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0002_seed_categories.sql
git commit -m "feat(db): seed product categories tree"
```

---

## Task 3: Seed — 28 örnek ürün

**Files:**
- Create: `supabase/migrations/0003_seed_products.sql`

- [ ] **Step 1: Seed SQL'i yaz**

```sql
-- 0003_seed_products.sql
-- 28 örnek ürün, 6 kategori arasında dağılmış

with cat as (
  select slug, id from public.categories
)
insert into public.products
  (slug, name, short_description, description, category_id, brand, sku, price, discount_price, stock, is_active, is_featured, power_w, power_kwp, current_a, voltage_v, images, tags, warranty_years)
values
  -- Paneller
  ('panel-mono-550w', 'Monokristal 550W Panel', 'Yüksek verim Tier-1 panel', 'Tier-1 üretici. 25 yıl üretim garantili.', (select id from cat where slug='monokristal'), 'SunTech', 'STP-550M', 6900, null, 120, true, true, 550, 0.55, 13.6, 41.5, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava','cok_satan'], 25),
  ('panel-mono-450w', 'Monokristal 450W Panel', 'Konut için ideal', 'Hafif ve dayanıklı yapı.', (select id from cat where slug='monokristal'), 'SunTech', 'STP-450M', 5400, null, 200, true, true, 450, 0.45, 11.2, 40.5, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 25),
  ('panel-poli-330w', 'Polikristal 330W Panel', 'Ekonomik seçenek', 'Bütçe dostu poli teknolojisi.', (select id from cat where slug='polikristal'), 'JinkoSolar', 'JKS-330P', 3800, 3500, 80, true, false, 330, 0.33, 8.9, 37.5, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kampanyada'], 20),
  ('panel-bifacial-540w', 'Bifacial 540W Panel', 'Çift yüzlü, yüksek verim', '%30 ek arka yüz kazancı.', (select id from cat where slug='bifacial'), 'LongiSolar', 'LR-540B', 8200, null, 60, true, true, 540, 0.54, 13.4, 41.2, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium','yeni'], 30),
  ('panel-topcon-580w', 'TOPCon N-Type 580W', 'Yeni nesil hücre', 'Daha düşük degredasyon.', (select id from cat where slug='topcon'), 'JA Solar', 'JAM-580T', 9100, null, 40, true, true, 580, 0.58, 14.1, 41.8, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium','yeni'], 30),

  -- Bataryalar
  ('batarya-jel-200ah', 'Jel Batarya 200Ah 12V', 'Bakım gerektirmez', 'Derin döngü, off-grid uyumlu.', (select id from cat where slug='jel-batarya'), 'Volta', 'V-J200', 12500, null, 50, true, false, null, null, null, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 5),
  ('batarya-lifepo4-5kwh', 'Lityum LiFePO4 5kWh', 'Uzun ömür, hafif', 'Modüler, paralel bağlanabilir.', (select id from cat where slug='lityum'), 'Pylontech', 'US3000C', 78000, null, 30, true, true, null, null, null, 48, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['cok_satan','premium','kampanyada'], 10),
  ('batarya-lifepo4-10kwh', 'Lityum LiFePO4 10kWh', 'Yüksek kapasite', 'Konut depolama çözümü.', (select id from cat where slug='lityum'), 'Pylontech', 'US5000C', 145000, null, 18, true, true, null, null, null, 48, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 10),
  ('batarya-agm-100ah', 'AGM 100Ah 12V', 'Düşük bütçe', 'Bakım istemez, sızdırmaz.', (select id from cat where slug='agm'), 'Mutlu', 'M-A100', 4200, null, 90, true, false, null, null, null, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 3),

  -- İnvertörler
  ('invertor-tamsinus-3kw', 'Tam Sinüs İnvertör 3kW', 'Off-grid uyumlu', 'Saf sinüs çıkış, geniş cihaz uyumu.', (select id from cat where slug='tam-sinus'), 'Must', 'MS-3000', 22000, null, 25, true, false, 3000, null, null, 24, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 3),
  ('invertor-ongrid-5kw', 'On-Grid İnvertör 5kW', 'Şebeke bağlantılı', 'Mahsuplaşma için sertifikalı.', (select id from cat where slug='on-grid'), 'Solis', 'S5-5K', 36000, null, 40, true, true, 5000, null, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['cok_satan','5_yil_garantili'], 5),
  ('invertor-ongrid-10kw', 'On-Grid İnvertör 10kW', 'Konut + küçük ticari', 'Geniş giriş gerilim aralığı.', (select id from cat where slug='on-grid'), 'Solis', 'S5-10K', 64000, null, 0, true, false, 10000, null, null, 400, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 5),
  ('invertor-hibrit-5kw', 'Hibrit İnvertör 5kW', 'Batarya + şebeke', 'Aynı cihazda batarya yönetimi.', (select id from cat where slug='hibrit'), 'Goodwe', 'GW5K-ES', 48000, null, 22, true, true, 5000, null, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium','cok_satan'], 5),
  ('invertor-hibrit-10kw', 'Hibrit İnvertör 10kW', 'Geniş ev sistemleri', 'Üç fazlı, yüksek tepe gücü.', (select id from cat where slug='hibrit'), 'Goodwe', 'GW10K-ES', 88000, null, 12, true, false, 10000, null, null, 400, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 5),

  -- Aydınlatma
  ('lamba-sokak-60w', 'Solar Sokak Lambası 60W', 'Hareket sensörlü', 'Şehir dışı uygulamalar için.', (select id from cat where slug='sokak-lambasi'), 'Phocos', 'P-SL60', 4800, null, 70, true, false, 60, null, null, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 3),
  ('lamba-sokak-100w', 'Solar Sokak Lambası 100W', 'Yüksek lümen', 'Endüstriyel saha aydınlatma.', (select id from cat where slug='sokak-lambasi'), 'Phocos', 'P-SL100', 6500, null, 35, true, false, 100, null, null, 12, array[ '/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 3),
  ('lamba-bahce-15w', 'Solar Bahçe Lambası 15W', 'Dekoratif', 'Bahçe ve patika aydınlatma.', (select id from cat where slug='bahce-lambasi'), 'GardenSun', 'GS-15', 850, 720, 200, true, false, 15, null, null, 6, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kampanyada'], 2),

  -- Hazır paketler
  ('paket-konut-6kw', 'Konut 6kW Anahtar Teslim', 'Tüm dahil', 'Panel + invertör + montaj kit + kablolama.', (select id from cat where slug='paket-6kw'), 'Zolarr Kit', 'ZK-6', 168000, 159000, 8, true, true, 6000, 6, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava','tercih_edilen','kampanyada'], 25),
  ('paket-konut-10kw', 'Konut 10kW Anahtar Teslim', 'Geniş aile için', 'Panel + invertör + bağlantı + ruhsat.', (select id from cat where slug='paket-10kw'), 'Zolarr Kit', 'ZK-10', 269000, null, 6, true, true, 10000, 10, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['tercih_edilen','premium'], 25),
  ('paket-ticari-50kw', 'Ticari 50kW Anahtar Teslim', 'KOBİ uyumlu', 'Tam mühendislik + montaj + onay.', (select id from cat where slug='paket-50kw'), 'Zolarr Kit', 'ZK-50', 1450000, null, 3, true, false, 50000, 50, null, 400, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 25),

  -- Aksesuarlar
  ('sarj-mppt-40a', 'MPPT Şarj Kontrol 40A', 'Yüksek verim', 'Off-grid sistemler için zorunlu.', (select id from cat where slug='sarj-kontrol'), 'EPEver', 'EP-40A', 4200, null, 60, true, false, null, null, 40, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava','cok_satan'], 2),
  ('sarj-pwm-30a', 'PWM Şarj Kontrol 30A', 'Ekonomik', 'Küçük sistemler için.', (select id from cat where slug='sarj-kontrol'), 'EPEver', 'EP-30P', 1500, null, 80, true, false, null, null, 30, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 2),
  ('kablo-solar-6mm', 'Solar Kablo 6mm² 100m', 'TÜV onaylı', 'UV ve ısı dirençli, çift izolasyon.', (select id from cat where slug='kablo'), 'Helukabel', 'HK-6S', 4500, null, 40, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], null),
  ('kablo-solar-4mm', 'Solar Kablo 4mm² 100m', 'TÜV onaylı', 'UV ve ısı dirençli.', (select id from cat where slug='kablo'), 'Helukabel', 'HK-4S', 3200, null, 55, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], null),
  ('mc4-konnektor-set', 'MC4 Konnektör 10 Çift', 'IP68', 'Profesyonel sıkıştırmalı tip.', (select id from cat where slug='konnektor'), 'Stäubli', 'ST-MC4', 850, null, 250, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], null),
  ('montaj-cati-kit', 'Çatı Üstü Montaj Kiti', '8 panel için', 'Alüminyum profil + kelepçeler.', (select id from cat where slug='montaj'), 'K2 Systems', 'K2-R8', 5800, null, 22, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 10),
  ('montaj-tarla-kit', 'Tarla Tip Montaj Kiti', '12 panel için', 'Galvanizli direk + kayışlar.', (select id from cat where slug='montaj'), 'K2 Systems', 'K2-G12', 9400, null, 14, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 10),
  ('tracker-tek-eksen', 'Tek Eksenli Tracker', 'Verim artışı %20-30', 'Otomatik güneş takibi.', (select id from cat where slug='montaj'), 'NClave', 'NC-1A', 42000, null, 6, true, true, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['yeni','premium'], 10)
on conflict (slug) do nothing;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0003_seed_products.sql
git commit -m "feat(db): seed 28 sample products across 6 categories"
```

---

## Task 4: Database TypeScript types

**Files:**
- Create: `lib/db/types.ts`

- [ ] **Step 1: Tipleri yaz**

```ts
export type ProductTag =
  | 'kargo_bedava'
  | 'tercih_edilen'
  | 'yeni'
  | 'cok_satan'
  | 'premium'
  | 'kampanyada'
  | '5_yil_garantili';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  brand: string | null;
  sku: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  track_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  power_w: number | null;
  power_kwp: number | null;
  current_a: number | null;
  voltage_v: number | null;
  specs: Record<string, unknown>;
  images: string[];
  videos: string[];
  pdfs: string[];
  tags: string[];
  warranty_years: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface Database {
  public: {
    Tables: {
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
    };
  };
}
```

- [ ] **Step 2: tsc**

Run: `npx tsc --noEmit` → clean.

- [ ] **Step 3: Commit**

```bash
git add lib/db/types.ts
git commit -m "feat(db): add Database, Category, Product types"
```

---

## Task 5: getCategoryTree query

**Files:**
- Create: `lib/db/queries/categories.ts`
- Create: `tests/lib/db/queries/categories.test.ts`

- [ ] **Step 1: Failing test yaz**

```ts
import { describe, it, expect } from 'vitest';
import { buildCategoryTree } from '@/lib/db/queries/categories';
import type { Category } from '@/lib/db/types';

const flat: Category[] = [
  { id: '1', slug: 'paneller', name: 'Güneş Panelleri', description: null, parent_id: null, icon: null, sort_order: 1, created_at: '' },
  { id: '2', slug: 'mono', name: 'Monokristal', description: null, parent_id: '1', icon: null, sort_order: 1, created_at: '' },
  { id: '3', slug: 'poli', name: 'Polikristal', description: null, parent_id: '1', icon: null, sort_order: 2, created_at: '' },
  { id: '4', slug: 'bataryalar', name: 'Bataryalar', description: null, parent_id: null, icon: null, sort_order: 2, created_at: '' },
];

describe('buildCategoryTree', () => {
  it('groups children under parent and orders by sort_order', () => {
    const tree = buildCategoryTree(flat);
    expect(tree).toHaveLength(2);
    expect(tree[0]!.slug).toBe('paneller');
    expect(tree[0]!.children).toHaveLength(2);
    expect(tree[0]!.children[0]!.slug).toBe('mono');
    expect(tree[1]!.slug).toBe('bataryalar');
    expect(tree[1]!.children).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation**

```ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Category, CategoryNode } from '@/lib/db/types';

export function buildCategoryTree(flat: Category[]): CategoryNode[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of flat) {
    const list = byParent.get(c.parent_id) ?? [];
    list.push(c);
    byParent.set(c.parent_id, list);
  }
  function build(parentId: string | null): CategoryNode[] {
    const items = byParent.get(parentId) ?? [];
    return items
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ ...c, children: build(c.id) }));
  }
  return build(null);
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const flat = await getAllCategories();
  return buildCategoryTree(flat);
}
```

- [ ] **Step 4: Test geçsin**

- [ ] **Step 5: Commit**

```bash
git add lib/db/queries/categories.ts tests/lib/db/queries/categories.test.ts
git commit -m "feat(db): add category tree query and pure tree builder"
```

---

## Task 6: getProducts query (filter/sort)

**Files:**
- Create: `lib/db/queries/products.ts`
- Create: `tests/lib/db/queries/products.test.ts`

- [ ] **Step 1: Failing test yaz** — pure helpers test (filtreleri SQL'e çevirmeden önce param normalizasyonu).

```ts
import { describe, it, expect } from 'vitest';
import { normalizeProductFilters, type RawFilters } from '@/lib/db/queries/products';

describe('normalizeProductFilters', () => {
  it('parses price range, tags, sort, and page', () => {
    const raw: RawFilters = { q: 'panel', minPrice: '100', maxPrice: '5000', tags: 'kargo_bedava,premium', sort: 'price_asc', page: '2', inStock: '1', categorySlug: 'mono' };
    const out = normalizeProductFilters(raw);
    expect(out.q).toBe('panel');
    expect(out.minPrice).toBe(100);
    expect(out.maxPrice).toBe(5000);
    expect(out.tags).toEqual(['kargo_bedava', 'premium']);
    expect(out.sort).toBe('price_asc');
    expect(out.page).toBe(2);
    expect(out.inStock).toBe(true);
    expect(out.categorySlug).toBe('mono');
  });

  it('falls back to defaults', () => {
    const out = normalizeProductFilters({});
    expect(out.q).toBe('');
    expect(out.minPrice).toBeNull();
    expect(out.maxPrice).toBeNull();
    expect(out.tags).toEqual([]);
    expect(out.sort).toBe('recommended');
    expect(out.page).toBe(1);
    expect(out.inStock).toBe(false);
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation**

```ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/db/types';

export type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'newest';

export interface RawFilters {
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  tags?: string;
  sort?: string;
  page?: string;
  inStock?: string;
  categorySlug?: string;
}

export interface ProductFilters {
  q: string;
  minPrice: number | null;
  maxPrice: number | null;
  tags: string[];
  sort: SortKey;
  page: number;
  inStock: boolean;
  categorySlug: string | null;
}

export const PAGE_SIZE = 12;

export function normalizeProductFilters(raw: RawFilters): ProductFilters {
  const sortKeys: SortKey[] = ['recommended', 'price_asc', 'price_desc', 'newest'];
  return {
    q: raw.q?.trim() ?? '',
    minPrice: raw.minPrice ? Number(raw.minPrice) : null,
    maxPrice: raw.maxPrice ? Number(raw.maxPrice) : null,
    tags: raw.tags ? raw.tags.split(',').filter(Boolean) : [],
    sort: sortKeys.includes(raw.sort as SortKey) ? (raw.sort as SortKey) : 'recommended',
    page: raw.page ? Math.max(1, parseInt(raw.page, 10) || 1) : 1,
    inStock: raw.inStock === '1' || raw.inStock === 'true',
    categorySlug: raw.categorySlug ?? null,
  };
}

export async function getProducts(filters: ProductFilters): Promise<{ items: Product[]; total: number }> {
  const supabase = await createClient();
  let q = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);

  if (filters.q) q = q.ilike('name', `%${filters.q}%`);
  if (filters.minPrice != null) q = q.gte('price', filters.minPrice);
  if (filters.maxPrice != null) q = q.lte('price', filters.maxPrice);
  if (filters.inStock) q = q.gt('stock', 0);
  if (filters.tags.length > 0) q = q.contains('tags', filters.tags);
  if (filters.categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', filters.categorySlug).single();
    if (cat) q = q.eq('category_id', cat.id);
  }

  switch (filters.sort) {
    case 'price_asc': q = q.order('price', { ascending: true }); break;
    case 'price_desc': q = q.order('price', { ascending: false }); break;
    case 'newest': q = q.order('created_at', { ascending: false }); break;
    default: q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  q = q.range(from, from + PAGE_SIZE - 1);
  const { data, count, error } = await q;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as Product[], total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as Product | null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getRelatedProducts(categoryId: string | null, excludeSlug: string, limit = 4): Promise<Product[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true).eq('category_id', categoryId).neq('slug', excludeSlug).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}
```

- [ ] **Step 4: Test geçsin**

- [ ] **Step 5: Commit**

```bash
git add lib/db/queries/products.ts tests/lib/db/queries/products.test.ts
git commit -m "feat(db): add product query helpers with filter normalization"
```

---

## Task 7: Price utils

**Files:**
- Create: `lib/utils/price.ts`
- Create: `tests/lib/utils/price.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { formatTry, calcDiscountPercent, lineTotal } from '@/lib/utils/price';

describe('price utils', () => {
  it('formatTry formats integer TRY without decimals', () => {
    expect(formatTry(6900)).toMatch(/6\.900/);
  });

  it('calcDiscountPercent returns null when discount missing', () => {
    expect(calcDiscountPercent(1000, null)).toBeNull();
  });

  it('calcDiscountPercent rounds correctly', () => {
    expect(calcDiscountPercent(1000, 850)).toBe(15);
  });

  it('lineTotal multiplies', () => {
    expect(lineTotal(2500, 3)).toBe(7500);
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation**

```ts
const fmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });

export function formatTry(value: number): string {
  return fmt.format(value);
}

export function calcDiscountPercent(price: number, discount: number | null): number | null {
  if (discount == null || discount >= price) return null;
  return Math.round(((price - discount) / price) * 100);
}

export function lineTotal(unitPrice: number, qty: number): number {
  return unitPrice * qty;
}

export function effectivePrice(price: number, discount: number | null): number {
  return discount != null && discount < price ? discount : price;
}
```

- [ ] **Step 4: Test geçsin**

- [ ] **Step 5: Commit**

```bash
git add lib/utils/price.ts tests/lib/utils/price.test.ts
git commit -m "feat(utils): add price formatting and discount helpers"
```

---

## Task 8: Cart store (Zustand + persist)

**Files:**
- Create: `lib/store/cart.ts`
- Create: `tests/lib/store/cart.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/lib/store/cart';

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('adds an item with default qty=1', () => {
    useCartStore.getState().addItem({ productId: 'p1', slug: 'mono-550', name: 'Panel', priceTry: 6900, image: '/img.svg' });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]!.qty).toBe(1);
  });

  it('increments qty when adding existing item', () => {
    const item = { productId: 'p1', slug: 'mono-550', name: 'Panel', priceTry: 6900, image: '/img.svg' };
    useCartStore.getState().addItem(item, 2);
    useCartStore.getState().addItem(item, 1);
    expect(useCartStore.getState().items[0]!.qty).toBe(3);
  });

  it('setQty replaces value', () => {
    useCartStore.getState().addItem({ productId: 'p1', slug: 'mono-550', name: 'Panel', priceTry: 6900, image: '/img.svg' });
    useCartStore.getState().setQty('p1', 5);
    expect(useCartStore.getState().items[0]!.qty).toBe(5);
  });

  it('removeItem deletes line', () => {
    useCartStore.getState().addItem({ productId: 'p1', slug: 'mono-550', name: 'Panel', priceTry: 6900, image: '/img.svg' });
    useCartStore.getState().removeItem('p1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('subtotal sums line totals', () => {
    useCartStore.getState().addItem({ productId: 'p1', slug: 'a', name: 'A', priceTry: 1000, image: '' }, 2);
    useCartStore.getState().addItem({ productId: 'p2', slug: 'b', name: 'B', priceTry: 500, image: '' }, 3);
    expect(useCartStore.getState().subtotal()).toBe(1000 * 2 + 500 * 3);
  });

  it('totalCount sums quantities', () => {
    useCartStore.getState().addItem({ productId: 'p1', slug: 'a', name: 'A', priceTry: 1000, image: '' }, 2);
    useCartStore.getState().addItem({ productId: 'p2', slug: 'b', name: 'B', priceTry: 500, image: '' }, 3);
    expect(useCartStore.getState().totalCount()).toBe(5);
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation**

```ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceTry: number;
  image: string;
  qty: number;
}

export interface CartItemInput {
  productId: string;
  slug: string;
  name: string;
  priceTry: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItemInput, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
  totalCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) => {
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        });
      },
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.priceTry * i.qty, 0),
      totalCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'zolarr-cart',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({
        getItem: () => null, setItem: () => {}, removeItem: () => {},
      } as Storage))),
    }
  )
);
```

- [ ] **Step 4: Test geçsin**

- [ ] **Step 5: Commit**

```bash
git add lib/store/cart.ts tests/lib/store/cart.test.ts
git commit -m "feat(store): add Zustand cart store with localStorage persist"
```

---

## Task 9: SortBar component (search + sort + view toggle)

**Files:**
- Create: `components/shop/sort-bar.tsx`
- Create: `tests/components/shop/sort-bar.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SortBar } from '@/components/shop/sort-bar';

describe('SortBar', () => {
  it('emits change on search submit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortBar value={{ q: '', sort: 'recommended', view: 'grid' }} onChange={onChange} />);
    await user.type(screen.getByPlaceholderText(/Ürün ara/i), 'panel');
    await user.click(screen.getByRole('button', { name: /Ara/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ q: 'panel' }));
  });

  it('emits change on sort select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortBar value={{ q: '', sort: 'recommended', view: 'grid' }} onChange={onChange} />);
    await user.selectOptions(screen.getByLabelText(/Sıralama/i), 'price_asc');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ sort: 'price_asc' }));
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation**

```tsx
'use client';

import * as React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'newest';
export type ViewMode = 'grid' | 'list';

export interface SortBarValue {
  q: string;
  sort: SortKey;
  view: ViewMode;
}

interface Props {
  value: SortBarValue;
  onChange: (next: SortBarValue) => void;
}

export function SortBar({ value, onChange }: Props) {
  const [q, setQ] = React.useState(value.q);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange({ ...value, q });
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex flex-1 items-center gap-2 min-w-[200px]">
        <Input
          type="search"
          placeholder="Ürün ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Ürün arama"
        />
        <Button type="submit" size="sm">
          <Search className="h-4 w-4" />
          Ara
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-[var(--color-text-muted)]">Sıralama</label>
        <select
          id="sort"
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value as SortKey })}
          className="h-9 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          <option value="recommended">Önerilen</option>
          <option value="price_asc">Fiyat (artan)</option>
          <option value="price_desc">Fiyat (azalan)</option>
          <option value="newest">Yeni eklenen</option>
        </select>
      </div>

      <div className="flex gap-1" role="group" aria-label="Görünüm">
        <Button
          type="button"
          variant={value.view === 'grid' ? 'primary' : 'icon'}
          size="icon"
          aria-label="Izgara görünüm"
          aria-pressed={value.view === 'grid'}
          onClick={() => onChange({ ...value, view: 'grid' })}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={value.view === 'list' ? 'primary' : 'icon'}
          size="icon"
          aria-label="Liste görünüm"
          aria-pressed={value.view === 'list'}
          onClick={() => onChange({ ...value, view: 'list' })}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Test geçsin**

- [ ] **Step 5: Commit**

```bash
git add components/shop/sort-bar.tsx tests/components/shop/sort-bar.test.tsx
git commit -m "feat(shop): add SortBar with search/sort/view toggle"
```

---

## Task 10: FilterPanel component

**Files:**
- Create: `components/shop/filter-panel.tsx`
- Create: `tests/components/shop/filter-panel.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterPanel } from '@/components/shop/filter-panel';

describe('FilterPanel', () => {
  it('emits price range and stock toggle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel value={{ minPrice: '', maxPrice: '', tags: [], inStock: false }} onChange={onChange} />);
    await user.type(screen.getByLabelText(/Min fiyat/i), '100');
    await user.type(screen.getByLabelText(/Max fiyat/i), '5000');
    await user.click(screen.getByLabelText(/Sadece stoktakiler/i));
    await user.click(screen.getByRole('button', { name: /Filtreyi uygula/i }));
    expect(onChange).toHaveBeenCalledWith({ minPrice: '100', maxPrice: '5000', tags: [], inStock: true });
  });

  it('toggles tag chips', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel value={{ minPrice: '', maxPrice: '', tags: [], inStock: false }} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Kargo Bedava/i }));
    await user.click(screen.getByRole('button', { name: /Filtreyi uygula/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ tags: ['kargo_bedava'] }));
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation**

```tsx
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TAG_OPTIONS: { key: string; label: string }[] = [
  { key: 'kargo_bedava', label: 'Kargo Bedava' },
  { key: 'tercih_edilen', label: 'Tercih Edilen' },
  { key: 'cok_satan', label: 'Çok Satan' },
  { key: 'premium', label: 'Premium' },
  { key: 'yeni', label: 'Yeni' },
  { key: 'kampanyada', label: 'Kampanyada' },
];

export interface FilterValue {
  minPrice: string;
  maxPrice: string;
  tags: string[];
  inStock: boolean;
}

interface Props {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
}

export function FilterPanel({ value, onChange }: Props) {
  const [local, setLocal] = React.useState<FilterValue>(value);
  React.useEffect(() => setLocal(value), [value]);

  function toggleTag(key: string) {
    setLocal((p) => ({
      ...p,
      tags: p.tags.includes(key) ? p.tags.filter((t) => t !== key) : [...p.tags, key],
    }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(local);
      }}
      className="space-y-6"
      aria-label="Ürün filtreleri"
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Fiyat Aralığı (TL)</legend>
        <div className="flex gap-2">
          <Input
            id="minPrice"
            inputMode="numeric"
            placeholder="Min"
            aria-label="Min fiyat"
            value={local.minPrice}
            onChange={(e) => setLocal((p) => ({ ...p, minPrice: e.target.value }))}
          />
          <Input
            id="maxPrice"
            inputMode="numeric"
            placeholder="Max"
            aria-label="Max fiyat"
            value={local.maxPrice}
            onChange={(e) => setLocal((p) => ({ ...p, maxPrice: e.target.value }))}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Etiketler</legend>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleTag(t.key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                local.tags.includes(t.key)
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/50'
              )}
              aria-pressed={local.tags.includes(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={local.inStock}
          onChange={(e) => setLocal((p) => ({ ...p, inStock: e.target.checked }))}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        Sadece stoktakiler
      </label>

      <Button type="submit" className="w-full">Filtreyi uygula</Button>
    </form>
  );
}
```

- [ ] **Step 4: Test geçsin**

- [ ] **Step 5: Commit**

```bash
git add components/shop/filter-panel.tsx tests/components/shop/filter-panel.test.tsx
git commit -m "feat(shop): add FilterPanel with price/tags/stock"
```

---

## Task 11: CategoryTree component

**Files:**
- Create: `components/shop/category-tree.tsx`

- [ ] **Step 1: Implementation**

```tsx
import Link from 'next/link';
import type { CategoryNode } from '@/lib/db/types';
import { cn } from '@/lib/utils';

interface Props {
  categories: CategoryNode[];
  activeSlug?: string | null;
}

export function CategoryTree({ categories, activeSlug }: Props) {
  return (
    <nav aria-label="Kategoriler">
      <ul className="space-y-1 text-sm">
        <li>
          <Link
            href="/magaza"
            className={cn(
              'block rounded-xl px-3 py-2 transition-colors',
              !activeSlug
                ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                : 'hover:bg-[var(--color-bg-overlay)]'
            )}
          >
            Tümü
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/magaza?categorySlug=${c.slug}`}
              className={cn(
                'block rounded-xl px-3 py-2 font-medium transition-colors',
                activeSlug === c.slug
                  ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                  : 'hover:bg-[var(--color-bg-overlay)]'
              )}
            >
              {c.name}
            </Link>
            {c.children.length > 0 && (
              <ul className="ml-3 mt-1 space-y-0.5 border-l border-[var(--color-border-glass)] pl-3">
                {c.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/magaza?categorySlug=${child.slug}`}
                      className={cn(
                        'block rounded-xl px-2 py-1 text-xs transition-colors',
                        activeSlug === child.slug
                          ? 'text-[var(--color-brand)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                      )}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/category-tree.tsx
git commit -m "feat(shop): add CategoryTree sidebar navigation"
```

---

## Task 12: ShopProductCard (DB Product version)

**Files:**
- Create: `components/shop/shop-product-card.tsx`

> Why a new card: Anasayfadaki `components/ui/product-card.tsx` `MockProduct` tipi alıyor (5 sabit alan + Türkçe badge dizisi). Mağazada DB'den gelen `Product` tipini kullanıyoruz. Aynı görsel dile sahip ama veriyi `Product`tan tüketen yeni bileşen.

- [ ] **Step 1: Implementation**

```tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BellPlus, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/db/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { formatTry, calcDiscountPercent, effectivePrice } from '@/lib/utils/price';
import { cn } from '@/lib/utils';

const TAG_LABELS: Record<string, string> = {
  kargo_bedava: '🚚 Kargo Bedava',
  tercih_edilen: '🏆 Tercih Edilen',
  cok_satan: '🔥 Çok Satan',
  premium: '💎 Premium',
  yeni: '⭐ Yeni',
  kampanyada: '🎁 Kampanyada',
};

interface Props {
  product: Product;
  className?: string;
}

export function ShopProductCard({ product, className }: Props) {
  const [idx, setIdx] = React.useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const total = product.images.length;
  const inStock = product.stock > 0;
  const discountPct = calcDiscountPercent(product.price, product.discount_price);
  const finalPrice = effectivePrice(product.price, product.discount_price);

  const cycle = (delta: number) => () => setIdx((i) => (i + delta + total) % total);
  const cur = product.images[idx] ?? product.images[0] ?? '/images/placeholder-panel-1.svg';

  return (
    <article className={cn('glass group relative flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/30', className)}>
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg-overlay)]">
        <Image src={cur} alt={`${product.name} görseli ${idx + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        {total > 1 && (
          <>
            <button type="button" aria-label="Önceki görsel" onClick={cycle(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Sonraki görsel" onClick={cycle(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        <ul className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((t) => (
            <li key={t} className="rounded-full bg-[var(--color-bg-base)]/85 px-2 py-0.5 font-mono text-[10px]">{TAG_LABELS[t] ?? t}</li>
          ))}
        </ul>
        {discountPct != null && (
          <span className="absolute right-2 top-2 rounded-full bg-[var(--color-brand)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--color-bg-base)]">-{discountPct}%</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link href={`/magaza/${product.slug}`} className="font-display text-base font-medium leading-tight hover:text-[var(--color-brand)]">
          {product.name}
        </Link>
        {product.brand && <p className="text-xs text-[var(--color-text-muted)]">{product.brand}</p>}
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-mono text-lg font-semibold text-[var(--color-brand)]">{formatTry(finalPrice)}</p>
          {discountPct != null && <p className="font-mono text-xs text-[var(--color-text-muted)] line-through">{formatTry(product.price)}</p>}
        </div>
        <div className="mt-auto flex gap-2 pt-3">
          {inStock ? (
            <>
              <Button type="button" size="sm" className="flex-1" onClick={() => addItem({ productId: product.id, slug: product.slug, name: product.name, priceTry: finalPrice, image: cur })}>
                <ShoppingCart className="h-4 w-4" />
                Sepete Ekle
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/magaza/${product.slug}`}>İncele</Link>
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" size="sm" className="flex-1">
              <BellPlus className="h-4 w-4" />
              Gelince Haber Ver
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/shop-product-card.tsx
git commit -m "feat(shop): add ShopProductCard backed by DB Product type"
```

---

## Task 13: ProductGrid + EmptyState

**Files:**
- Create: `components/shop/product-grid.tsx`

- [ ] **Step 1: Implementation**

```tsx
import type { Product } from '@/lib/db/types';
import { ShopProductCard } from './shop-product-card';

interface Props {
  products: Product[];
  view?: 'grid' | 'list';
}

export function ProductGrid({ products, view = 'grid' }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-12 text-center">
        <p className="font-display text-lg font-semibold">Aradığınız kriterlere uyan ürün bulunamadı.</p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Filtreleri sıfırlayıp tekrar deneyin veya farklı bir kategori seçin.</p>
      </div>
    );
  }

  return (
    <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
      {products.map((p) => (
        <ShopProductCard key={p.id} product={p} className={view === 'list' ? 'flex-row sm:flex' : ''} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/product-grid.tsx
git commit -m "feat(shop): add ProductGrid with empty state"
```

---

## Task 14: Pagination component

**Files:**
- Create: `components/shop/pagination.tsx`

- [ ] **Step 1: Implementation**

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: Props) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <Button variant="icon" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Önceki sayfa">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-mono text-sm">
        {page} / {last}
      </span>
      <Button variant="icon" size="icon" disabled={page >= last} onClick={() => onChange(page + 1)} aria-label="Sonraki sayfa">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/pagination.tsx
git commit -m "feat(shop): add Pagination control"
```

---

## Task 15: /magaza page (RSC + URL state)

**Files:**
- Create: `app/magaza/page.tsx`
- Create: `app/magaza/loading.tsx`
- Create: `components/shop/shop-controls.tsx` (client wrapper that pushes URL state)

- [ ] **Step 1: shop-controls.tsx (client URL syncer)**

```tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SortBar, type SortBarValue, type SortKey } from './sort-bar';
import { FilterPanel, type FilterValue } from './filter-panel';
import { Pagination } from './pagination';

interface Props {
  totalCount: number;
  pageSize: number;
}

export function ShopControls({ totalCount, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortValue: SortBarValue = {
    q: searchParams.get('q') ?? '',
    sort: (searchParams.get('sort') as SortKey) || 'recommended',
    view: (searchParams.get('view') as 'grid' | 'list') || 'grid',
  };

  const filterValue: FilterValue = {
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
    inStock: searchParams.get('inStock') === '1',
  };

  const page = Number(searchParams.get('page') ?? '1') || 1;

  function pushParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    });
    if (!('page' in patch)) next.delete('page');
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="space-y-6">
      <SortBar
        value={sortValue}
        onChange={(v) => pushParams({ q: v.q || null, sort: v.sort, view: v.view })}
      />
      <FilterPanel
        value={filterValue}
        onChange={(v) =>
          pushParams({
            minPrice: v.minPrice || null,
            maxPrice: v.maxPrice || null,
            tags: v.tags.length ? v.tags.join(',') : null,
            inStock: v.inStock ? '1' : null,
          })
        }
      />
      <Pagination page={page} pageSize={pageSize} total={totalCount} onChange={(p) => pushParams({ page: String(p) })} />
    </div>
  );
}
```

- [ ] **Step 2: app/magaza/loading.tsx**

```tsx
export default function Loading() {
  return (
    <div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
      </aside>
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: app/magaza/page.tsx (RSC)**

```tsx
import { Suspense } from 'react';
import { getProducts, normalizeProductFilters, PAGE_SIZE, type RawFilters } from '@/lib/db/queries/products';
import { getCategoryTree } from '@/lib/db/queries/categories';
import { CategoryTree } from '@/components/shop/category-tree';
import { ProductGrid } from '@/components/shop/product-grid';
import { ShopControls } from '@/components/shop/shop-controls';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<RawFilters>;
}

export const metadata = {
  title: 'E-Mağaza | Zolarr',
  description: 'Güneş paneli, invertör, batarya ve aksesuarlar — Zolarr E-Mağaza.',
};

export default async function MagazaPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = normalizeProductFilters(raw);
  const [tree, { items, total }] = await Promise.all([getCategoryTree(), getProducts(filters)]);

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <CategoryTree categories={tree} activeSlug={filters.categorySlug} />
        <Suspense>
          <ShopControls totalCount={total} pageSize={PAGE_SIZE} />
        </Suspense>
      </aside>

      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4 border-b border-[var(--color-border-glass)] pb-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">E-Mağaza</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{total} ürün gösteriliyor</p>
          </div>
        </header>
        <ProductGrid products={items} view={(raw.sort === 'list' ? 'list' : 'grid')} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: build + commit**

```bash
npm run build
git add app/magaza/page.tsx app/magaza/loading.tsx components/shop/shop-controls.tsx
git commit -m "feat(shop): add /magaza listing page with filters and pagination"
```

---

## Task 16: Product detail gallery

**Files:**
- Create: `components/shop/product-detail-gallery.tsx`

- [ ] **Step 1: Implementation**

```tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  alt: string;
}

export function ProductDetailGallery({ images, alt }: Props) {
  const [idx, setIdx] = React.useState(0);
  const total = images.length;
  if (total === 0) return null;

  const cur = images[idx] ?? images[0]!;
  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]">
        <Image src={cur} alt={`${alt} ${idx + 1}/${total}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" />
        {total > 1 && (
          <>
            <button type="button" aria-label="Önceki" onClick={() => setIdx((i) => (i - 1 + total) % total)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-base)]/85 p-2 hover:bg-[var(--color-bg-overlay)]">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Sonraki" onClick={() => setIdx((i) => (i + 1) % total)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-base)]/85 p-2 hover:bg-[var(--color-bg-overlay)]">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Görsel ${i + 1}`}
            className={cn(
              'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
              i === idx ? 'border-[var(--color-brand)]' : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
            )}
          >
            <Image src={src} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/product-detail-gallery.tsx
git commit -m "feat(shop): add product detail gallery with thumbnails"
```

---

## Task 17: AddToCartButton (qty + add)

**Files:**
- Create: `components/shop/add-to-cart-button.tsx`

- [ ] **Step 1: Implementation**

```tsx
'use client';

import * as React from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';

interface Props {
  productId: string;
  slug: string;
  name: string;
  priceTry: number;
  image: string;
  inStock: boolean;
  stock: number;
}

export function AddToCartButton({ productId, slug, name, priceTry, image, inStock, stock }: Props) {
  const [qty, setQty] = React.useState(1);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({ productId, slug, name, priceTry, image }, qty);
    toast.success(`${name} sepete eklendi`, { description: `${qty} adet · ${priceTry.toLocaleString('tr-TR')} TL/adet` });
  }

  if (!inStock) {
    return (
      <Button type="button" variant="secondary" size="lg" className="w-full">
        Gelince Haber Ver
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-text-muted)]">Adet</span>
        <div className="flex items-center rounded-2xl border border-[var(--color-border)]">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Azalt" className="px-3 py-2 hover:bg-[var(--color-bg-overlay)]">
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center font-mono">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(stock, q + 1))} aria-label="Arttır" className="px-3 py-2 hover:bg-[var(--color-bg-overlay)]">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">Stok: {stock}</span>
      </div>
      <Button type="button" size="lg" onClick={handleAdd} className="w-full">
        <ShoppingCart className="h-5 w-5" />
        Sepete Ekle
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/add-to-cart-button.tsx
git commit -m "feat(shop): add AddToCartButton with qty stepper"
```

---

## Task 18: ProductDetailTabs

**Files:**
- Create: `components/shop/product-detail-tabs.tsx`

- [ ] **Step 1: Implementation**

```tsx
'use client';

import * as Tabs from '@radix-ui/react-tabs';
import type { Product } from '@/lib/db/types';

interface Props {
  product: Product;
}

export function ProductDetailTabs({ product }: Props) {
  return (
    <Tabs.Root defaultValue="desc" className="mt-10">
      <Tabs.List className="flex flex-wrap gap-2 border-b border-[var(--color-border-glass)] pb-2">
        <Tabs.Trigger value="desc" className="rounded-xl px-4 py-2 font-display text-sm data-[state=active]:bg-[var(--color-brand)] data-[state=active]:text-[var(--color-bg-base)]">
          Açıklama
        </Tabs.Trigger>
        <Tabs.Trigger value="specs" className="rounded-xl px-4 py-2 font-display text-sm data-[state=active]:bg-[var(--color-brand)] data-[state=active]:text-[var(--color-bg-base)]">
          Teknik Özellikler
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="desc" className="prose prose-invert max-w-none pt-6 leading-relaxed">
        {product.short_description && <p className="mb-4 font-medium">{product.short_description}</p>}
        {product.description ? <p>{product.description}</p> : <p className="text-[var(--color-text-muted)]">Açıklama henüz girilmemiş.</p>}
      </Tabs.Content>
      <Tabs.Content value="specs" className="pt-6">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {product.brand && <SpecRow label="Marka" value={product.brand} />}
          {product.sku && <SpecRow label="SKU" value={product.sku} />}
          {product.power_w && <SpecRow label="Güç" value={`${product.power_w} W`} />}
          {product.power_kwp && <SpecRow label="kWp" value={`${product.power_kwp}`} />}
          {product.current_a && <SpecRow label="Akım" value={`${product.current_a} A`} />}
          {product.voltage_v && <SpecRow label="Voltaj" value={`${product.voltage_v} V`} />}
          {product.warranty_years && <SpecRow label="Garanti" value={`${product.warranty_years} yıl`} />}
          <SpecRow label="Stok" value={`${product.stock} adet`} />
        </dl>
      </Tabs.Content>
    </Tabs.Root>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 px-4 py-2">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/product-detail-tabs.tsx
git commit -m "feat(shop): add ProductDetailTabs (description + specs)"
```

---

## Task 19: RelatedProducts

**Files:**
- Create: `components/shop/related-products.tsx`

- [ ] **Step 1: Implementation**

```tsx
import { getRelatedProducts } from '@/lib/db/queries/products';
import { ShopProductCard } from './shop-product-card';

interface Props {
  categoryId: string | null;
  excludeSlug: string;
}

export async function RelatedProducts({ categoryId, excludeSlug }: Props) {
  const items = await getRelatedProducts(categoryId, excludeSlug, 4);
  if (items.length === 0) return null;
  return (
    <section className="mt-12 border-t border-[var(--color-border-glass)] pt-10">
      <h2 className="mb-6 font-display text-2xl font-bold">İlgili Ürünler</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/shop/related-products.tsx
git commit -m "feat(shop): add RelatedProducts server component"
```

---

## Task 20: /magaza/[slug] page + not-found

**Files:**
- Create: `app/magaza/[slug]/page.tsx`
- Create: `app/magaza/[slug]/not-found.tsx`

- [ ] **Step 1: page.tsx**

```tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/db/queries/products';
import { ProductDetailGallery } from '@/components/shop/product-detail-gallery';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { ProductDetailTabs } from '@/components/shop/product-detail-tabs';
import { RelatedProducts } from '@/components/shop/related-products';
import { formatTry, calcDiscountPercent, effectivePrice } from '@/lib/utils/price';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Ürün bulunamadı | Zolarr' };
  return {
    title: `${product.name} | Zolarr E-Mağaza`,
    description: product.short_description ?? product.name,
  };
}

const TAG_LABELS: Record<string, string> = {
  kargo_bedava: '🚚 Kargo Bedava',
  tercih_edilen: '🏆 Tercih Edilen',
  cok_satan: '🔥 Çok Satan',
  premium: '💎 Premium',
  yeni: '⭐ Yeni',
  kampanyada: '🎁 Kampanyada',
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const inStock = product.stock > 0;
  const discountPct = calcDiscountPercent(product.price, product.discount_price);
  const finalPrice = effectivePrice(product.price, product.discount_price);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductDetailGallery images={product.images} alt={product.name} />
        <div className="space-y-4">
          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <li key={t} className="rounded-full bg-[var(--color-brand)]/15 px-3 py-1 font-mono text-xs text-[var(--color-brand)]">
                  {TAG_LABELS[t] ?? t}
                </li>
              ))}
            </ul>
          )}
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
          {(product.brand || product.sku) && (
            <p className="text-sm text-[var(--color-text-muted)]">
              {product.brand}{product.sku ? ` · ${product.sku}` : ''}
            </p>
          )}
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-3xl font-bold text-[var(--color-brand)]">{formatTry(finalPrice)}</p>
            {discountPct != null && (
              <>
                <p className="font-mono text-lg text-[var(--color-text-muted)] line-through">{formatTry(product.price)}</p>
                <span className="rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 font-mono text-xs text-[var(--color-danger)]">-{discountPct}%</span>
              </>
            )}
          </div>
          <p className={inStock ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'}>
            {inStock ? `✅ Stokta — ${product.stock} adet hazır` : '❌ Stokta yok'}
          </p>
          <div className="pt-4">
            <AddToCartButton productId={product.id} slug={product.slug} name={product.name} priceTry={finalPrice} image={product.images[0] ?? ''} inStock={inStock} stock={product.stock} />
          </div>
        </div>
      </div>

      <ProductDetailTabs product={product} />

      <Suspense>
        <RelatedProducts categoryId={product.category_id} excludeSlug={product.slug} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 2: not-found.tsx**

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-7xl font-bold text-[var(--color-brand)]">404</p>
      <h1 className="mt-6 font-display text-2xl font-semibold">Ürün bulunamadı</h1>
      <p className="mt-2 max-w-md text-[var(--color-text-muted)]">Aradığınız ürün kaldırılmış olabilir. Mağaza ana sayfasından tekrar deneyin.</p>
      <Button asChild className="mt-6">
        <Link href="/magaza">Mağazaya Dön</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: build + commit**

```bash
npm run build
git add app/magaza/\[slug\]/page.tsx app/magaza/\[slug\]/not-found.tsx
git commit -m "feat(shop): add /magaza/[slug] product detail page"
```

---

## Task 21: CartLineItem + CartSummary + CartEmpty

**Files:**
- Create: `components/cart/cart-line-item.tsx`
- Create: `components/cart/cart-summary.tsx`
- Create: `components/cart/cart-empty.tsx`
- Create: `tests/components/cart/cart-line-item.test.tsx`
- Create: `tests/components/cart/cart-summary.test.tsx`

- [ ] **Step 1: cart-line-item.tsx**

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, type CartItem } from '@/lib/store/cart';
import { formatTry, lineTotal } from '@/lib/utils/price';

interface Props {
  item: CartItem;
}

export function CartLineItem({ item }: Props) {
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <article className="flex gap-4 border-b border-[var(--color-border-glass)] py-4 last:border-0">
      <Link href={`/magaza/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--color-bg-overlay)]">
        {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col">
        <Link href={`/magaza/${item.slug}`} className="font-display text-base font-medium hover:text-[var(--color-brand)]">
          {item.name}
        </Link>
        <p className="text-xs text-[var(--color-text-muted)]">Birim: {formatTry(item.priceTry)}</p>
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex items-center rounded-2xl border border-[var(--color-border)]">
            <button type="button" aria-label="Azalt" onClick={() => setQty(item.productId, item.qty - 1)} className="px-2 py-1 hover:bg-[var(--color-bg-overlay)]">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center font-mono text-sm">{item.qty}</span>
            <button type="button" aria-label="Arttır" onClick={() => setQty(item.productId, item.qty + 1)} className="px-2 py-1 hover:bg-[var(--color-bg-overlay)]">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="font-mono font-semibold text-[var(--color-brand)]">{formatTry(lineTotal(item.priceTry, item.qty))}</p>
          <button type="button" aria-label="Sil" onClick={() => removeItem(item.productId)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: cart-summary.tsx**

```tsx
'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { formatTry } from '@/lib/utils/price';

export function CartSummary() {
  const subtotal = useCartStore((s) => s.subtotal());
  const itemsCount = useCartStore((s) => s.totalCount());
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <aside className="glass sticky top-24 space-y-3 rounded-2xl p-6">
      <h2 className="font-display text-xl font-semibold">Özet</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt>Ürün adedi</dt><dd className="font-mono">{itemsCount}</dd></div>
        <div className="flex justify-between"><dt>Ara toplam</dt><dd className="font-mono">{formatTry(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Kargo</dt><dd className="font-mono">{shipping === 0 ? 'Ücretsiz' : formatTry(shipping)}</dd></div>
      </dl>
      <div className="border-t border-[var(--color-border-glass)] pt-3">
        <div className="flex justify-between text-lg font-semibold">
          <span>Toplam</span>
          <span className="font-mono text-[var(--color-brand)]">{formatTry(total)}</span>
        </div>
      </div>
      <Button asChild className="w-full" size="lg">
        <Link href="/teklif/al">Talep Oluştur</Link>
      </Button>
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Talep oluşturduğunuzda uzmanlarımız sizinle iletişime geçer.
      </p>
    </aside>
  );
}
```

- [ ] **Step 3: cart-empty.tsx**

```tsx
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-16 text-center">
      <ShoppingBag className="h-12 w-12 text-[var(--color-text-muted)]" aria-hidden />
      <h2 className="mt-4 font-display text-xl font-semibold">Sepetiniz boş</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
        Mağazadan beğendiğiniz ürünleri sepete ekleyin, talep oluşturun.
      </p>
      <Button asChild className="mt-6">
        <Link href="/magaza">Mağazaya Git</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: cart-line-item.test.tsx**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartLineItem } from '@/components/cart/cart-line-item';
import { useCartStore } from '@/lib/store/cart';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

const mockItem = { productId: 'p1', slug: 'panel', name: 'Panel', priceTry: 1000, image: '/img.svg', qty: 2 };

describe('CartLineItem', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [mockItem] });
  });

  it('renders name, qty and line total', () => {
    render(<CartLineItem item={mockItem} />);
    expect(screen.getByText('Panel')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/2\.000/)).toBeInTheDocument();
  });

  it('increments qty via plus button', async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={mockItem} />);
    await user.click(screen.getByRole('button', { name: /Arttır/i }));
    expect(useCartStore.getState().items[0]!.qty).toBe(3);
  });

  it('removes item via trash button', async () => {
    const user = userEvent.setup();
    render(<CartLineItem item={mockItem} />);
    await user.click(screen.getByRole('button', { name: /Sil/i }));
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
```

- [ ] **Step 5: cart-summary.test.tsx**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartSummary } from '@/components/cart/cart-summary';
import { useCartStore } from '@/lib/store/cart';

describe('CartSummary', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [
      { productId: 'p1', slug: 'a', name: 'A', priceTry: 1000, image: '', qty: 2 },
      { productId: 'p2', slug: 'b', name: 'B', priceTry: 500, image: '', qty: 1 },
    ]});
  });

  it('shows correct subtotal and shipping', () => {
    render(<CartSummary />);
    expect(screen.getByText(/2\.500/)).toBeInTheDocument(); // subtotal
    expect(screen.getByText(/250/)).toBeInTheDocument(); // shipping
    expect(screen.getByText(/2\.750/)).toBeInTheDocument(); // total
  });

  it('shows free shipping above threshold', () => {
    useCartStore.setState({ items: [{ productId: 'p1', slug: 'a', name: 'A', priceTry: 6000, image: '', qty: 1 }] });
    render(<CartSummary />);
    expect(screen.getByText(/Ücretsiz/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: tsc + tests + commit**

```bash
npx tsc --noEmit
npm test -- tests/components/cart/
git add components/cart/ tests/components/cart/
git commit -m "feat(cart): add CartLineItem, CartSummary, CartEmpty components"
```

---

## Task 22: /sepet page

**Files:**
- Create: `app/sepet/page.tsx`

- [ ] **Step 1: page.tsx**

```tsx
'use client';

import * as React from 'react';
import { useCartStore } from '@/lib/store/cart';
import { CartLineItem } from '@/components/cart/cart-line-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { CartEmpty } from '@/components/cart/cart-empty';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold sm:text-4xl">Sepetim</h1>
      {!hydrated ? (
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
      ) : items.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
            {items.map((it) => <CartLineItem key={it.productId} item={it} />)}
          </div>
          <CartSummary />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: build + commit**

```bash
npm run build
git add app/sepet/page.tsx
git commit -m "feat(cart): add /sepet page with hydration guard"
```

---

## Task 23: HeaderCartBadge

**Files:**
- Create: `components/layout/header-cart-badge.tsx`
- Modify: `components/layout/header.tsx` (replace plain cart icon link with HeaderCartBadge)

- [ ] **Step 1: HeaderCartBadge**

```tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export function HeaderCartBadge({ className }: Props) {
  const count = useCartStore((s) => s.totalCount());
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  return (
    <Link
      href="/sepet"
      aria-label={hydrated && count > 0 ? `Sepet (${count} ürün)` : 'Sepet'}
      className={cn('relative inline-flex h-12 w-12 items-center justify-center rounded-2xl glass hover:bg-[var(--color-bg-overlay)]', className)}
    >
      <ShoppingCart className="h-5 w-5" />
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand)] px-1 font-mono text-[10px] font-semibold text-[var(--color-bg-base)]">
          {count}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Modify header.tsx**

Mevcut header'da sepet ikonu olan satırı bul ve `<HeaderCartBadge />` ile değiştir. Eski bağlantı tarzına uygun olacak şekilde className uygula.

- [ ] **Step 3: build + commit**

```bash
npm run build
git add components/layout/header-cart-badge.tsx components/layout/header.tsx
git commit -m "feat(cart): show cart count badge in header"
```

---

## Task 24: Anasayfa entegrasyonu (mock → DB)

**Files:**
- Modify: `components/home/stock-products.tsx`
- Modify: `components/home/product-slider.tsx`
- Modify: `app/page.tsx` (eğer gerekirse)
- Modify: `tests/app/page.test.tsx` (mock supabase queries)

- [ ] **Step 1: stock-products.tsx — DB'den çek**

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopProductCard } from '@/components/shop/shop-product-card';
import { getFeaturedProducts } from '@/lib/db/queries/products';

export async function StockProducts() {
  const items = await getFeaturedProducts(8);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[var(--color-border-glass)] py-16" aria-labelledby="stock-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="stock-heading" className="font-display text-3xl font-bold sm:text-4xl">Stoktaki ürünler</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Hemen kargolanmaya hazır panel, invertör ve batarya seçenekleri.</p>
          </div>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/magaza">Tüm ürünler<ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ShopProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: product-slider.tsx — featured ürünler MVP**

`CAMPAIGNS_MOCK` MVP'de kalır (kampanya motoru Faz 8'de gelecek). Sadece veri gerçeğe bağlanmadığı için bu component'a değişiklik yok. **Skip.**

- [ ] **Step 3: tests/app/page.test.tsx — Supabase mocks**

`vi.mock('@/lib/db/queries/products', ...)` ekle:

```tsx
vi.mock('@/lib/db/queries/products', () => ({
  getFeaturedProducts: vi.fn().mockResolvedValue([]),
}));
```

- [ ] **Step 4: build + commit**

```bash
npm run build
git add components/home/stock-products.tsx tests/app/page.test.tsx
git commit -m "feat(home): wire StockProducts to Supabase featured products"
```

---

## Task 25: Manual migration runner script (dev convenience)

**Files:**
- Create: `scripts/run-migrations.md` (instructions, NOT a runner — kullanıcı Supabase Studio'da uygular)

- [ ] **Step 1: Yaz**

```md
# Migrations'ı çalıştırma

Bu projede Drizzle yerine düz SQL migration dosyaları kullanıyoruz.
Sırayla `supabase/migrations/` altındakileri Supabase Studio'da çalıştırın:

1. Supabase Dashboard → Project → SQL Editor → "New query"
2. Aşağıdaki sırayla içerikleri yapıştırın ve "Run" deyin:
   - `0001_categories_products.sql`
   - `0002_seed_categories.sql`
   - `0003_seed_products.sql`
3. Doğrulama:
   ```sql
   select count(*) from public.products; -- 28 olmalı
   select count(*) from public.categories; -- 25 olmalı (6 üst + 19 alt)
   ```

**Not:** Faz 4'te (Teklif sistemi) yeni migration'lar gelecek; aynı yöntemle uygulanacak.
```

- [ ] **Step 2: commit**

```bash
git add scripts/run-migrations.md
git commit -m "docs: add migration application guide"
```

---

## Task 26: Final build + Faz 3 completion report

**Files:**
- Create: `docs/superpowers/plans/2026-05-06-faz-3-completion.md`

- [ ] **Step 1: Tam doğrulama**

```bash
npm test
npx tsc --noEmit
npm run build
```

Beklenen: tüm testler PASS, build başarılı.

- [ ] **Step 2: Completion report yaz**

```md
# Faz 3 — E-Mağaza: Completion Report

**Tarih:** 2026-05-06
**Branch:** master
**Plan:** docs/superpowers/plans/2026-05-06-faz-3-e-magaza.md

## Özet
- 3 SQL migration (categories + products + 28 ürün seed)
- 9 yeni shop bileşeni + 3 cart bileşeni + HeaderCartBadge
- /magaza listing (filter/sort/page) + /magaza/[slug] detay + /sepet
- Anasayfa StockProducts gerçek DB'ye bağlandı
- Cart Zustand store, localStorage persist
- Test coverage: cart store, price utils, filters, components

## Commit count, test count, files added — final komutla doldurulur

## Bilinen sınırlamalar
- Kampanya kuralları motoru Faz 8'de
- Stock alerts (push notification) Faz 7+
- Reviews/Q&A daha sonra
- Admin product CRUD Faz 8
- Supplier sync Faz 9

## Kullanıcı eylemi gerekli
1. `supabase/migrations/0001..0003`'ü Supabase Studio SQL Editor'da sırayla çalıştır.
2. Sonra `npm run dev` → /magaza, /magaza/panel-mono-550w, /sepet test et.
```

- [ ] **Step 3: commit**

```bash
git add docs/superpowers/plans/2026-05-06-faz-3-completion.md
git commit -m "docs: Phase 3 completion report"
```

---

## Self-Review

**Spec coverage (§6):**
- (6.1) Ürün listesi sayfası: ✅ /magaza + filter panel + category tree + sort + search + pagination
- (6.2) Kategori hiyerarşisi: ✅ migration + tree builder + sidebar component
- (6.3) Ürün detay sayfası: ✅ /magaza/[slug] + galeri + tabs + add-to-cart + ilgili ürünler. PDF/video/yorum/Q&A SONRAKI fazda.
- (6.4) Ürün etiketleri: ✅ TAG_LABELS + chip filtreleri + kart üstü gösterim
- (6.5) Sepet: ✅ /sepet + line item + summary + empty state
- (6.6) Kampanya yönetimi: ⏳ Faz 8'de (admin paneli)

**Placeholder scan:** Yok — tüm task'larda kod tam.

**Type consistency:**
- `Product` tipi `lib/db/types.ts`'de tanımlı, her query/component aynı tipi tüketiyor.
- `CartItem` / `CartItemInput` arasında `qty` farkı tutarlı.
- `ProductFilters` `RawFilters → ProductFilters` her yerde aynı.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-06-faz-3-e-magaza.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Fresh subagent per task, hızlı iterasyon.

**2. Inline Execution** — Bu oturumda batch'lerle yürüt + checkpoint review.

**Hangisini istersiniz?**
