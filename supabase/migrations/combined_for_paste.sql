-- ============================================================
-- ZOLARR Faz 3 — Tüm migration'lar tek seferde
-- Bu dosyanın TAMAMINI Supabase SQL Editor'a yapıştırıp RUN deyin.
-- ============================================================

-- 0001_categories_products.sql ------------------------------

create extension if not exists "pgcrypto";

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

alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories for select using (true);

drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products for select using (is_active = true);


-- 0002_seed_categories.sql ------------------------------

insert into public.categories (slug, name, icon, sort_order, parent_id) values
  ('paneller', 'Güneş Panelleri', 'panel', 1, null),
  ('bataryalar', 'Bataryalar', 'battery', 2, null),
  ('invertorler', 'İnvertörler', 'invertor', 3, null),
  ('aydinlatma', 'Aydınlatma', 'sun', 4, null),
  ('hazir-paketler', 'Hazır Paket Sistemler', 'box', 5, null),
  ('aksesuarlar', 'Aksesuarlar', 'wrench', 6, null)
on conflict (slug) do nothing;

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


-- 0003_seed_products.sql ------------------------------

with cat as (select slug, id from public.categories)
insert into public.products
  (slug, name, short_description, description, category_id, brand, sku, price, discount_price, stock, is_active, is_featured, power_w, power_kwp, current_a, voltage_v, images, tags, warranty_years)
values
  ('panel-mono-550w', 'Monokristal 550W Panel', 'Yüksek verim Tier-1 panel', 'Tier-1 üretici. 25 yıl üretim garantili.', (select id from cat where slug='monokristal'), 'SunTech', 'STP-550M', 6900, null, 120, true, true, 550, 0.55, 13.6, 41.5, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava','cok_satan'], 25),
  ('panel-mono-450w', 'Monokristal 450W Panel', 'Konut için ideal', 'Hafif ve dayanıklı yapı.', (select id from cat where slug='monokristal'), 'SunTech', 'STP-450M', 5400, null, 200, true, true, 450, 0.45, 11.2, 40.5, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 25),
  ('panel-poli-330w', 'Polikristal 330W Panel', 'Ekonomik seçenek', 'Bütçe dostu poli teknolojisi.', (select id from cat where slug='polikristal'), 'JinkoSolar', 'JKS-330P', 3800, 3500, 80, true, false, 330, 0.33, 8.9, 37.5, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kampanyada'], 20),
  ('panel-bifacial-540w', 'Bifacial 540W Panel', 'Çift yüzlü, yüksek verim', '%30 ek arka yüz kazancı.', (select id from cat where slug='bifacial'), 'LongiSolar', 'LR-540B', 8200, null, 60, true, true, 540, 0.54, 13.4, 41.2, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium','yeni'], 30),
  ('panel-topcon-580w', 'TOPCon N-Type 580W', 'Yeni nesil hücre', 'Daha düşük degredasyon.', (select id from cat where slug='topcon'), 'JA Solar', 'JAM-580T', 9100, null, 40, true, true, 580, 0.58, 14.1, 41.8, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium','yeni'], 30),
  ('batarya-jel-200ah', 'Jel Batarya 200Ah 12V', 'Bakım gerektirmez', 'Derin döngü, off-grid uyumlu.', (select id from cat where slug='jel-batarya'), 'Volta', 'V-J200', 12500, null, 50, true, false, null, null, null, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 5),
  ('batarya-lifepo4-5kwh', 'Lityum LiFePO4 5kWh', 'Uzun ömür, hafif', 'Modüler, paralel bağlanabilir.', (select id from cat where slug='lityum'), 'Pylontech', 'US3000C', 78000, null, 30, true, true, null, null, null, 48, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['cok_satan','premium','kampanyada'], 10),
  ('batarya-lifepo4-10kwh', 'Lityum LiFePO4 10kWh', 'Yüksek kapasite', 'Konut depolama çözümü.', (select id from cat where slug='lityum'), 'Pylontech', 'US5000C', 145000, null, 18, true, true, null, null, null, 48, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 10),
  ('batarya-agm-100ah', 'AGM 100Ah 12V', 'Düşük bütçe', 'Bakım istemez, sızdırmaz.', (select id from cat where slug='agm'), 'Mutlu', 'M-A100', 4200, null, 90, true, false, null, null, null, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 3),
  ('invertor-tamsinus-3kw', 'Tam Sinüs İnvertör 3kW', 'Off-grid uyumlu', 'Saf sinüs çıkış, geniş cihaz uyumu.', (select id from cat where slug='tam-sinus'), 'Must', 'MS-3000', 22000, null, 25, true, false, 3000, null, null, 24, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 3),
  ('invertor-ongrid-5kw', 'On-Grid İnvertör 5kW', 'Şebeke bağlantılı', 'Mahsuplaşma için sertifikalı.', (select id from cat where slug='on-grid'), 'Solis', 'S5-5K', 36000, null, 40, true, true, 5000, null, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['cok_satan','5_yil_garantili'], 5),
  ('invertor-ongrid-10kw', 'On-Grid İnvertör 10kW', 'Konut + küçük ticari', 'Geniş giriş gerilim aralığı.', (select id from cat where slug='on-grid'), 'Solis', 'S5-10K', 64000, null, 0, true, false, 10000, null, null, 400, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 5),
  ('invertor-hibrit-5kw', 'Hibrit İnvertör 5kW', 'Batarya + şebeke', 'Aynı cihazda batarya yönetimi.', (select id from cat where slug='hibrit'), 'Goodwe', 'GW5K-ES', 48000, null, 22, true, true, 5000, null, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium','cok_satan'], 5),
  ('invertor-hibrit-10kw', 'Hibrit İnvertör 10kW', 'Geniş ev sistemleri', 'Üç fazlı, yüksek tepe gücü.', (select id from cat where slug='hibrit'), 'Goodwe', 'GW10K-ES', 88000, null, 12, true, false, 10000, null, null, 400, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 5),
  ('lamba-sokak-60w', 'Solar Sokak Lambası 60W', 'Hareket sensörlü', 'Şehir dışı uygulamalar için.', (select id from cat where slug='sokak-lambasi'), 'Phocos', 'P-SL60', 4800, null, 70, true, false, 60, null, null, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], 3),
  ('lamba-sokak-100w', 'Solar Sokak Lambası 100W', 'Yüksek lümen', 'Endüstriyel saha aydınlatma.', (select id from cat where slug='sokak-lambasi'), 'Phocos', 'P-SL100', 6500, null, 35, true, false, 100, null, null, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 3),
  ('lamba-bahce-15w', 'Solar Bahçe Lambası 15W', 'Dekoratif', 'Bahçe ve patika aydınlatma.', (select id from cat where slug='bahce-lambasi'), 'GardenSun', 'GS-15', 850, 720, 200, true, false, 15, null, null, 6, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kampanyada'], 2),
  ('paket-konut-6kw', 'Konut 6kW Anahtar Teslim', 'Tüm dahil', 'Panel + invertör + montaj kit + kablolama.', (select id from cat where slug='paket-6kw'), 'Zolarr Kit', 'ZK-6', 168000, 159000, 8, true, true, 6000, 6, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava','tercih_edilen','kampanyada'], 25),
  ('paket-konut-10kw', 'Konut 10kW Anahtar Teslim', 'Geniş aile için', 'Panel + invertör + bağlantı + ruhsat.', (select id from cat where slug='paket-10kw'), 'Zolarr Kit', 'ZK-10', 269000, null, 6, true, true, 10000, 10, null, 230, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['tercih_edilen','premium'], 25),
  ('paket-ticari-50kw', 'Ticari 50kW Anahtar Teslim', 'KOBİ uyumlu', 'Tam mühendislik + montaj + onay.', (select id from cat where slug='paket-50kw'), 'Zolarr Kit', 'ZK-50', 1450000, null, 3, true, false, 50000, 50, null, 400, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['premium'], 25),
  ('sarj-mppt-40a', 'MPPT Şarj Kontrol 40A', 'Yüksek verim', 'Off-grid sistemler için zorunlu.', (select id from cat where slug='sarj-kontrol'), 'EPEver', 'EP-40A', 4200, null, 60, true, false, null, null, 40, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava','cok_satan'], 2),
  ('sarj-pwm-30a', 'PWM Şarj Kontrol 30A', 'Ekonomik', 'Küçük sistemler için.', (select id from cat where slug='sarj-kontrol'), 'EPEver', 'EP-30P', 1500, null, 80, true, false, null, null, 30, 12, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 2),
  ('kablo-solar-6mm', 'Solar Kablo 6mm² 100m', 'TÜV onaylı', 'UV ve ısı dirençli, çift izolasyon.', (select id from cat where slug='kablo'), 'Helukabel', 'HK-6S', 4500, null, 40, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], null),
  ('kablo-solar-4mm', 'Solar Kablo 4mm² 100m', 'TÜV onaylı', 'UV ve ısı dirençli.', (select id from cat where slug='kablo'), 'Helukabel', 'HK-4S', 3200, null, 55, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], null),
  ('mc4-konnektor-set', 'MC4 Konnektör 10 Çift', 'IP68', 'Profesyonel sıkıştırmalı tip.', (select id from cat where slug='konnektor'), 'Stäubli', 'ST-MC4', 850, null, 250, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['kargo_bedava'], null),
  ('montaj-cati-kit', 'Çatı Üstü Montaj Kiti', '8 panel için', 'Alüminyum profil + kelepçeler.', (select id from cat where slug='montaj'), 'K2 Systems', 'K2-R8', 5800, null, 22, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 10),
  ('montaj-tarla-kit', 'Tarla Tip Montaj Kiti', '12 panel için', 'Galvanizli direk + kayışlar.', (select id from cat where slug='montaj'), 'K2 Systems', 'K2-G12', 9400, null, 14, true, false, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array[]::text[], 10),
  ('tracker-tek-eksen', 'Tek Eksenli Tracker', 'Verim artışı %20-30', 'Otomatik güneş takibi.', (select id from cat where slug='montaj'), 'NClave', 'NC-1A', 42000, null, 6, true, true, null, null, null, null, array['/images/placeholder-panel-1.svg','/images/placeholder-panel-2.svg','/images/placeholder-panel-3.svg','/images/placeholder-panel-4.svg','/images/placeholder-panel-5.svg'], array['yeni','premium'], 10)
on conflict (slug) do nothing;


-- ============================================================
-- Doğrulama (otomatik koşar; sonuçlar SQL Editor'un altında görünür)
-- ============================================================
select 'kategoriler' as tablo, count(*) as adet from public.categories
union all
select 'urunler' as tablo, count(*) as adet from public.products;
