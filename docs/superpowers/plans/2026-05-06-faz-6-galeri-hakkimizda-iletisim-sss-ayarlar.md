# Faz 6 — Galeri + Hakkımızda + İletişim + SSS + Ayarlar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beş yeni public sayfa ekle: `/galeri` (filtreli proje grid'i + before/after slider'lı detay), `/hakkimizda` (şirket hikayesi, ekip, sayılar), `/iletisim` (form + Google Maps), `/sss` (kategorili FAQ), `/ayarlar` (tema, çerezler, iletişim bilgileri — auth gerektiren bölümler Faz 7'ye placeholder).

**Architecture:** Projeler ve SSS Supabase'de tablolaştırılır (admin CRUD'u Faz 8'de gelecek). İletişim formu `contact_messages` tablosuna server action ile yazılır (retry-on-conflict pattern). Hakkımızda statik içerik (mock data) — Faz 8'de admin editable olacak. Ayarlar'da auth gerektiren alt-bölümler (Hesap, Şifre, Bildirimler) "Faz 7'de aktif" mesajıyla görünür.

**Tech Stack:** Next.js 16 App Router, Supabase, Drizzle ORM types, Zod, react-markdown, framer-motion, Radix UI (Tabs, Dialog), Vitest.

---

## File Structure

| Path | Sorumluluk |
|------|------------|
| `supabase/migrations/0006_projects_faqs_contact.sql` | 3 yeni tablo + RLS + trigger |
| `supabase/migrations/0007_seed_projects.sql` | 12 örnek proje |
| `supabase/migrations/0008_seed_faqs.sql` | 15 SSS girdisi (5 kategori × 3) |
| `supabase/migrations/combined_for_paste_v4.sql` | Hepsi tek paste için |
| `lib/db/queries/projects.ts` | Server-only proje sorguları |
| `lib/db/queries/projects-helpers.ts` | Pure typeof helpers (test-friendly) |
| `lib/db/queries/faqs.ts` | Server-only SSS sorguları |
| `lib/db/queries/faqs-helpers.ts` | Pure helpers (groupByCategory) |
| `lib/db/types.ts` | `Project`, `Faq`, `ContactMessage` interface |
| `lib/data/team-mock.ts` | Hakkımızda ekip verisi |
| `lib/data/brands-mock.ts` | Logo grid markaları |
| `lib/data/values-mock.ts` | Şirket değerleri |
| `lib/validation/contact-schema.ts` | Zod schema (form) |
| `lib/server-actions/submit-contact.ts` | `'use server'` + retry |
| `lib/utils/contact-number.ts` | `MSG-YYYY-XXXXX` üreticisi |
| `components/galeri/before-after-slider.tsx` | Sürüklenebilir karşılaştırma |
| `components/galeri/project-card.tsx` | Liste kartı |
| `components/galeri/filter-tabs.tsx` | Tümü / Konut / Ticari / Tarımsal |
| `components/galeri/project-gallery.tsx` | Lightbox grid |
| `components/galeri/lightbox.tsx` | Tam ekran görsel |
| `components/galeri/related-projects.tsx` | Detay altı |
| `components/hakkimizda/values-grid.tsx` | 4 değer kartı |
| `components/hakkimizda/team-grid.tsx` | Ekip portreleri |
| `components/hakkimizda/brand-grid.tsx` | Marka logoları |
| `components/iletisim/contact-form.tsx` | Form + submit |
| `components/iletisim/maps-embed.tsx` | Google Maps iframe |
| `components/iletisim/contact-info-card.tsx` | Adres + telefon kartı |
| `components/sss/faq-search.tsx` | Arama input'u |
| `components/sss/faq-category-tabs.tsx` | Tab bar |
| `components/sss/faq-list.tsx` | Sonuç listesi |
| `components/ayarlar/section-card.tsx` | Genel kart kabuğu |
| `components/ayarlar/theme-section.tsx` | Tema seçimi |
| `components/ayarlar/cookie-section.tsx` | Çerez tercihleri |
| `components/ayarlar/social-section.tsx` | Sosyal linkler |
| `components/ayarlar/contact-info-section.tsx` | Adres + harita |
| `components/ayarlar/legal-section.tsx` | KVKK linkleri |
| `components/ayarlar/auth-deferred-section.tsx` | Faz 7 placeholder |
| `app/galeri/page.tsx` | Liste |
| `app/galeri/[slug]/page.tsx` + `not-found.tsx` | Detay |
| `app/hakkimizda/page.tsx` | Hakkımızda |
| `app/iletisim/page.tsx` | İletişim |
| `app/sss/page.tsx` | SSS |
| `app/ayarlar/page.tsx` | Ayarlar |
| `tests/lib/contact-number.test.ts` | TDD |
| `tests/lib/projects-helpers.test.ts` | TDD |
| `tests/lib/faqs-helpers.test.ts` | TDD |
| `tests/components/galeri/before-after-slider.test.tsx` | TDD |
| `tests/components/iletisim/contact-form.test.tsx` | TDD |
| `tests/components/sss/faq-search.test.tsx` | TDD |
| `tests/app/galeri/page.test.tsx` | Smoke |
| `tests/app/sss/page.test.tsx` | Smoke |

---

## Task 1: Migration 0006 — projects + faqs + contact_messages

**Files:**
- Create: `supabase/migrations/0006_projects_faqs_contact.sql`

- [ ] **Step 1: SQL yaz**

```sql
-- 0006_projects_faqs_contact.sql

-- ============ PROJECTS ============
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null check (type in ('konut','ticari','tarim')),
  location text not null,
  capacity_kwp numeric(10,3) not null,
  cover_image text not null,
  description text,
  before_image text,
  after_image text,
  gallery_images text[] not null default array[]::text[],
  product_slugs text[] not null default array[]::text[],
  customer_quote text,
  customer_name text,
  annual_savings_try numeric(12,2),
  completion_date date,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_idx on public.projects(is_published, sort_order);
create index if not exists projects_type_idx on public.projects(type) where is_published;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "projects_read_anon" on public.projects;
create policy "projects_read_anon" on public.projects
  for select using (is_published = true);

-- ============ FAQS ============
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'genel'
    check (category in ('genel','teknik','fiyat','kurulum','garanti')),
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_category_idx on public.faqs(category, sort_order) where is_published;

drop trigger if exists trg_faqs_updated_at on public.faqs;
create trigger trg_faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

alter table public.faqs enable row level security;

drop policy if exists "faqs_read_anon" on public.faqs;
create policy "faqs_read_anon" on public.faqs
  for select using (is_published = true);

-- ============ CONTACT MESSAGES ============
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  message_number text not null unique,
  name text not null,
  email text not null,
  phone text,
  subject text,
  body text not null,
  status text not null default 'new'
    check (status in ('new','read','replied','archived')),
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on public.contact_messages(status, created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_insert_anon" on public.contact_messages;
create policy "contact_insert_anon" on public.contact_messages
  for insert with check (true);
-- Read closed (admin Faz 8'de açacak)
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0006_projects_faqs_contact.sql
git commit -m "feat(db): add projects, faqs, contact_messages tables"
```

---

## Task 2: Seed projects (12 proje)

**Files:**
- Create: `supabase/migrations/0007_seed_projects.sql`

- [ ] **Step 1: SQL yaz**

```sql
-- 0007_seed_projects.sql
-- 12 örnek proje. Görsel placeholder'ları public/images/ altında SVG.

insert into public.projects (slug, title, type, location, capacity_kwp, cover_image, description, before_image, after_image, gallery_images, product_slugs, customer_quote, customer_name, annual_savings_try, completion_date, sort_order)
values
-- Konut (4)
('antalya-villa', 'Antalya Villa Çatı GES', 'konut', 'Antalya / Konyaaltı', 12, '/images/placeholder-project-1.svg',
 'Akdeniz iklimine uygun olarak tasarlanan 12 kWp gücünde monokristal panel sistemi. Yıllık ortalama 18.500 kWh üretimle ailenin elektrik faturasının %92''sini karşılıyor.',
 '/images/placeholder-project-1-before.svg', '/images/placeholder-project-1-after.svg',
 array['/images/placeholder-project-1-1.svg','/images/placeholder-project-1-2.svg','/images/placeholder-project-1-3.svg'],
 array[]::text[],
 'Yatırımımız 4 yılda kendini ödedi, üstüne komşulara da örnek olduk.', 'M. Demir', 38500, '2024-08-15', 10),
('istanbul-cati', 'İstanbul Çatı GES', 'konut', 'İstanbul / Beykoz', 15, '/images/placeholder-project-4.svg',
 '15 kWp''lik konut sistemi, kuzey Anadolu''nun bulutlu günleri düşünülerek yüksek verimli panellerle kurgulandı. Akıllı izleme paneli ile telefondan üretim takip ediliyor.',
 null, null,
 array['/images/placeholder-project-4-1.svg','/images/placeholder-project-4-2.svg'],
 array[]::text[],
 'Mobil uygulamadan üretimi izlemek inanılmaz keyifli.', 'A. Yılmaz', 47000, '2024-11-02', 20),
('ankara-mustakil', 'Ankara Müstakil Ev', 'konut', 'Ankara / Çankaya', 8, '/images/placeholder-project-7.svg',
 '8 kWp paket sistem, geleneksel kiremit çatı üzerine alüminyum montaj sistemi ile uygulandı. Mahsuplaşma yöntemiyle yıllık fatura ortalama 6.800 TL''den 1.200 TL''ye indi.',
 '/images/placeholder-project-7-before.svg', '/images/placeholder-project-7-after.svg',
 array['/images/placeholder-project-7-1.svg'],
 array[]::text[],
 null, null, 22000, '2025-01-10', 30),
('izmir-villa', 'İzmir Villa Sistem', 'konut', 'İzmir / Karşıyaka', 10, '/images/placeholder-project-8.svg',
 '10 kWp hibrit sistem, batarya destekli. Şebeke kesilse bile kritik tüketim (buzdolabı, aydınlatma, internet) batarya üzerinden devam ediyor.',
 null, null,
 array['/images/placeholder-project-8-1.svg','/images/placeholder-project-8-2.svg'],
 array[]::text[],
 'Yaz aylarında haftada 1-2 gün kesinti yaşıyorduk, artık sıfır.', 'E. Kaya', 32000, '2025-02-22', 40),

-- Ticari (4)
('konya-fabrika', 'Konya Mobilya Fabrikası', 'ticari', 'Konya / Selçuklu', 250, '/images/placeholder-project-2.svg',
 '250 kWp''lik fabrika çatı GES. Üretim hattının gündüz tüketimini neredeyse tamamen karşılıyor. KDV %1 avantajıyla geri ödeme süresi 3.5 yıla indi.',
 '/images/placeholder-project-2-before.svg', '/images/placeholder-project-2-after.svg',
 array['/images/placeholder-project-2-1.svg','/images/placeholder-project-2-2.svg','/images/placeholder-project-2-3.svg'],
 array[]::text[],
 'Aylık enerji giderimiz 180.000 TL''den 35.000 TL''ye düştü.', 'Mobilya A.Ş.', 1740000, '2024-06-30', 50),
('kayseri-otel', 'Kayseri Termal Otel', 'ticari', 'Kayseri / Kocasinan', 180, '/images/placeholder-project-5.svg',
 '180 kWp otel projesi. Gündüz havuz/iklimlendirme yükü güneşten karşılanıyor. Yatırım teşvik belgesi ile %50 vergi indirimi alındı.',
 null, null,
 array['/images/placeholder-project-5-1.svg','/images/placeholder-project-5-2.svg'],
 array[]::text[],
 null, null, 1240000, '2024-09-12', 60),
('bursa-market', 'Bursa Süpermarket Zinciri', 'ticari', 'Bursa / Nilüfer', 90, '/images/placeholder-project-9.svg',
 '90 kWp süpermarket çatı GES. Soğutma reyonlarının yüksek elektrik tüketimi gündüz güneşle dengeleniyor. Kuzey-güney çift yönlü panel yerleşimi ile alan optimize edildi.',
 null, null,
 array['/images/placeholder-project-9-1.svg'],
 array[]::text[],
 'Yatırımı 4 yılda geri kazanıyoruz; süpermarket zinciri tüm şubelere yaygınlaştırma kararı aldı.', 'Bursa Market Zinciri', 620000, '2024-12-05', 70),
('eskisehir-depo', 'Eskişehir Lojistik Depo', 'ticari', 'Eskişehir / Tepebaşı', 320, '/images/placeholder-project-10.svg',
 '320 kWp lojistik depo çatı GES. Yüksek tavanlı çelik konstrüksiyona özel ankraj çözümü ile uygulandı. Artan elektrik şebekeye satılarak ekstra gelir sağlanıyor.',
 '/images/placeholder-project-10-before.svg', '/images/placeholder-project-10-after.svg',
 array['/images/placeholder-project-10-1.svg','/images/placeholder-project-10-2.svg'],
 array[]::text[],
 null, null, 2200000, '2025-03-18', 80),

-- Tarım (4)
('aydin-sera', 'Aydın Sera Sulama', 'tarim', 'Aydın / Söke', 30, '/images/placeholder-project-3.svg',
 '30 kWp tarımsal sulama GES. Damla sulama pompalarını gün boyu çalıştırarak maliyetsiz sulama sağlıyor. 2,5 yılda yatırım amortismanı.',
 '/images/placeholder-project-3-before.svg', '/images/placeholder-project-3-after.svg',
 array['/images/placeholder-project-3-1.svg','/images/placeholder-project-3-2.svg'],
 array[]::text[],
 'Sulama maliyetimiz neredeyse sıfırlandı.', 'Söke Çiftçi Birliği', 195000, '2024-07-20', 90),
('sanliurfa-pompa', 'Şanlıurfa Tarımsal Pompaj', 'tarim', 'Şanlıurfa / Harran', 50, '/images/placeholder-project-6.svg',
 '50 kWp pompaj sistemi. GAP bölgesinin yüksek güneşlenmesinden faydalanan bu sistem, 80 hektarlık tarım arazisinin sulamasını üstleniyor.',
 null, null,
 array['/images/placeholder-project-6-1.svg'],
 array[]::text[],
 null, null, 360000, '2024-10-08', 100),
('mersin-sera', 'Mersin Hibrit Sera', 'tarim', 'Mersin / Tarsus', 75, '/images/placeholder-project-11.svg',
 '75 kWp hibrit batarya destekli sera projesi. Geceleri seranın iklim kontrolü batarya destekli sürdürülüyor.',
 null, null,
 array['/images/placeholder-project-11-1.svg','/images/placeholder-project-11-2.svg'],
 array[]::text[],
 'Yaz aylarında ürün kalitesi %18 arttı.', 'Tarsus Tarım Koop.', 540000, '2025-01-25', 110),
('manisa-bagcilik', 'Manisa Bağcılık Tesisi', 'tarim', 'Manisa / Salihli', 40, '/images/placeholder-project-12.svg',
 '40 kWp bağcılık işletmesi. Üzüm depolama soğuk hava deposunun yıllık enerji ihtiyacının %78''ini karşılıyor.',
 '/images/placeholder-project-12-before.svg', '/images/placeholder-project-12-after.svg',
 array['/images/placeholder-project-12-1.svg'],
 array[]::text[],
 null, null, 280000, '2025-04-02', 120);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0007_seed_projects.sql
git commit -m "feat(db): seed 12 sample projects (4 konut, 4 ticari, 4 tarım)"
```

---

## Task 3: Seed FAQs (5 kategori × 3 = 15)

**Files:**
- Create: `supabase/migrations/0008_seed_faqs.sql`

- [ ] **Step 1: SQL yaz**

```sql
-- 0008_seed_faqs.sql
-- 5 kategori × 3 soru

insert into public.faqs (question, answer, category, sort_order) values
-- GENEL
('Çatımda güneş paneli için yeterli alan var mı?',
 '1 kWp sistem yaklaşık 5–6 m² alana ihtiyaç duyar. 10 kWp''lik bir konut sistemi için 50–60 m² çatı alanı yeterlidir. **Ücretsiz keşif** ile sizin çatınız için net ölçüm veriyoruz.',
 'genel', 10),
('Bulutlu havalarda sistem çalışır mı?',
 'Evet — sistem yağmurlu/bulutlu havada da düşük verimle çalışmaya devam eder. Yıllık ortalama üretim hesabımız bu koşulları içerir.',
 'genel', 20),
('Kullanılan malzemeler hangi markalardan?',
 'Panel: Longi, Trina, Canadian Solar, REC. İnvertör: Huawei, SMA, Solis, Growatt. Tüm markalar uluslararası sertifikalı, Türkiye ofisleri ile servis garantilidir.',
 'genel', 30),

-- TEKNİK
('Hangi panel tipini öneriyorsunuz?',
 'Konut için **monokristal yarı-hücre paneller** (TopCon teknolojisi) öneriyoruz — yüksek verim, düşük yer kaplama, gölgelemeye dayanıklılık. Endüstriyel projelerde **bifacial paneller** çift yönlü ışınımla %8-12 ek üretim sağlar.',
 'teknik', 10),
('İnvertör hibrit mi olmalı, on-grid mi?',
 'Şebeke kesintisi yaşamıyorsanız **on-grid invertör** yeterlidir (daha ucuz, mahsuplaşma için ideal). Sık kesinti varsa veya enerji bağımsızlığı isteniyorsa **hibrit invertör + batarya** önerilir.',
 'teknik', 20),
('Sistemi mobil uygulamadan takip edebilir miyim?',
 'Evet — kurduğumuz tüm sistemlerde Wi-Fi modülü standarttır. Anlık üretim, günlük/aylık/yıllık raporlar, hata uyarıları telefondan görünür.',
 'teknik', 30),

-- FİYAT
('Geri ödeme süresi ne kadar?',
 'Türkiye''de ortalama **4–6 yıldır**. Konut, fatura tutarına ve bölgeye göre değişir; ticari işletmelerde KDV avantajı sayesinde 3–4 yıla iner. Sistemin ekonomik ömrü 25 yıldır.',
 'fiyat', 10),
('Devletten teşvik var mı?',
 'Mesken aboneliklerinde **10 kW''a kadar mahsuplaşma** uygulanır. Ticari sistemlerde **KDV %1**, ek olarak **yatırım teşvik belgesi** alınabilir. Detaylı bilgilendirmeyi teklif sürecinde sunuyoruz.',
 'fiyat', 20),
('Taksitli ödeme mümkün mü?',
 'Evet — anlaşmalı bankalar üzerinden **12 aya kadar 0 faiz**, 24 aya kadar düşük faiz seçenekleri mevcut. Ayrıca KOBİ kredisi ve TKDK destekleri için danışmanlık sağlıyoruz.',
 'fiyat', 30),

-- KURULUM
('Kurulum ne kadar sürer?',
 'Konut sistemi için **2–4 iş günü**, küçük ticari (50 kWp altı) için 1–2 hafta, büyük ticari/sanayi için 3–6 hafta. Sürelere keşif, tasarım, ekipman temini ve bağlantı izinleri dahildir.',
 'kurulum', 10),
('Çatımı zarar verir mi?',
 'Hayır — alüminyum montaj sistemi, çatı kaplamasını delmeden veya yalıtımı bozmadan kurulur. 10 yıl sızdırmazlık garantisi veriyoruz.',
 'kurulum', 20),
('Şebeke bağlantı izinleri için ne gerekiyor?',
 'Tüm bürokratik süreçleri (TEDAŞ başvurusu, çağrı mektubu, sayaç değişimi, EPDK kayıt) **biz takip ediyoruz**. Sizden sadece tapu, abonelik bilgisi ve imza alıyoruz.',
 'kurulum', 30),

-- GARANTİ
('Panellerin garantisi nedir?',
 '**Ürün garantisi 12 yıl**, **performans garantisi 25 yıl** (25. yılda nominal gücün %85''i). Türkiye''nin yetkili servis noktalarında karşılanır.',
 'garanti', 10),
('İnvertör arızasında ne kadar sürede değişir?',
 'Garanti süresince (5–10 yıl) **48 saat içinde** yedek invertör temin ediyoruz. Üretim kaybınız olmaması için stoklarımızda tüm ana modeller bulunur.',
 'garanti', 20),
('Bakım gerekiyor mu?',
 'Yılda 1–2 kez panel temizliği yeterlidir. **İnvertör ve bağlantı kontrolünü 2 yılda bir** uzman bakım ekibimiz **garanti süresince ücretsiz** yapıyor.',
 'garanti', 30);
```

- [ ] **Step 2: Combined paste-ready hazırla**

`supabase/migrations/combined_for_paste_v4.sql` dosyasında 0006 + 0007 + 0008 birleşik. Sonuna doğrulama:

```sql
select 'projects' as table_name, count(*) from public.projects
union all
select 'faqs', count(*) from public.faqs
union all
select 'contact_messages', count(*) from public.contact_messages;
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0008_seed_faqs.sql supabase/migrations/combined_for_paste_v4.sql
git commit -m "feat(db): seed 15 FAQ entries and bundle paste-ready v4"
```

---

## Task 4: lib/db/types.ts'e Project, Faq, ContactMessage ekle

**Files:**
- Modify: `lib/db/types.ts`

- [ ] **Step 1: Mevcut dosyaya ekle (sonuna)**

```ts
export interface Project {
  id: string;
  slug: string;
  title: string;
  type: 'konut' | 'ticari' | 'tarim';
  location: string;
  capacityKwp: number;
  coverImage: string;
  description: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  galleryImages: string[];
  productSlugs: string[];
  customerQuote: string | null;
  customerName: string | null;
  annualSavingsTry: number | null;
  completionDate: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: 'genel' | 'teknik' | 'fiyat' | 'kurulum' | 'garanti';
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  messageNumber: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/types.ts
git commit -m "feat(db): add Project, Faq, ContactMessage types"
```

---

## Task 5: Project queries (helpers + server)

**Files:**
- Create: `lib/db/queries/projects-helpers.ts`
- Create: `lib/db/queries/projects.ts`
- Create: `tests/lib/projects-helpers.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/lib/projects-helpers.test.ts
import { describe, it, expect } from 'vitest';
import { mapProjectRow, filterProjectsByType, type ProjectRow } from '@/lib/db/queries/projects-helpers';

const row: ProjectRow = {
  id: 'a',
  slug: 'antalya-villa',
  title: 'Antalya Villa',
  type: 'konut',
  location: 'Antalya',
  capacity_kwp: '12',
  cover_image: '/x.svg',
  description: 'desc',
  before_image: null,
  after_image: null,
  gallery_images: [],
  product_slugs: [],
  customer_quote: null,
  customer_name: null,
  annual_savings_try: '38500',
  completion_date: '2024-08-15',
  is_published: true,
  sort_order: 10,
  created_at: '2024-01-01',
  updated_at: '2024-01-02',
};

describe('mapProjectRow', () => {
  it('converts capacity_kwp string to number', () => {
    expect(mapProjectRow(row).capacityKwp).toBe(12);
  });

  it('converts annual_savings_try string to number', () => {
    expect(mapProjectRow(row).annualSavingsTry).toBe(38500);
  });

  it('preserves slug, title, type', () => {
    const m = mapProjectRow(row);
    expect(m.slug).toBe('antalya-villa');
    expect(m.title).toBe('Antalya Villa');
    expect(m.type).toBe('konut');
  });

  it('coerces null annual_savings_try to null', () => {
    expect(mapProjectRow({ ...row, annual_savings_try: null }).annualSavingsTry).toBeNull();
  });
});

describe('filterProjectsByType', () => {
  const a = mapProjectRow(row);
  const b = mapProjectRow({ ...row, id: 'b', slug: 'x', type: 'ticari' });
  const c = mapProjectRow({ ...row, id: 'c', slug: 'y', type: 'tarim' });

  it('returns all when type is "all"', () => {
    expect(filterProjectsByType([a, b, c], 'all')).toHaveLength(3);
  });

  it('filters by single type', () => {
    expect(filterProjectsByType([a, b, c], 'konut')).toEqual([a]);
  });
});
```

- [ ] **Step 2: Test fail olsun**

```bash
npx vitest run tests/lib/projects-helpers.test.ts
```

- [ ] **Step 3: Helpers implementation**

```ts
// lib/db/queries/projects-helpers.ts
import type { Project } from '../types';

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  type: 'konut' | 'ticari' | 'tarim';
  location: string;
  capacity_kwp: string | number;
  cover_image: string;
  description: string | null;
  before_image: string | null;
  after_image: string | null;
  gallery_images: string[];
  product_slugs: string[];
  customer_quote: string | null;
  customer_name: string | null;
  annual_savings_try: string | number | null;
  completion_date: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    location: row.location,
    capacityKwp: Number(row.capacity_kwp),
    coverImage: row.cover_image,
    description: row.description,
    beforeImage: row.before_image,
    afterImage: row.after_image,
    galleryImages: row.gallery_images,
    productSlugs: row.product_slugs,
    customerQuote: row.customer_quote,
    customerName: row.customer_name,
    annualSavingsTry: row.annual_savings_try !== null ? Number(row.annual_savings_try) : null,
    completionDate: row.completion_date,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ProjectTypeFilter = 'all' | Project['type'];

export function filterProjectsByType(
  projects: Project[],
  filter: ProjectTypeFilter
): Project[] {
  if (filter === 'all') return projects;
  return projects.filter((p) => p.type === filter);
}
```

- [ ] **Step 4: Server query**

```ts
// lib/db/queries/projects.ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { mapProjectRow, type ProjectRow } from './projects-helpers';
import type { Project } from '../types';

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[listProjects] error:', error);
    return [];
  }
  return (data as ProjectRow[]).map(mapProjectRow);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error || !data) return null;
  return mapProjectRow(data as ProjectRow);
}

export async function listRelatedProjects(
  type: Project['type'],
  excludeSlug: string,
  limit = 3
): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .eq('type', type)
    .neq('slug', excludeSlug)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return (data as ProjectRow[]).map(mapProjectRow);
}
```

- [ ] **Step 5: Test geçsin + commit**

```bash
npx vitest run tests/lib/projects-helpers.test.ts
git add lib/db/queries/projects.ts lib/db/queries/projects-helpers.ts tests/lib/projects-helpers.test.ts
git commit -m "feat(db): add project queries and helpers"
```

---

## Task 6: FAQ queries + helpers

**Files:**
- Create: `lib/db/queries/faqs-helpers.ts`
- Create: `lib/db/queries/faqs.ts`
- Create: `tests/lib/faqs-helpers.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/lib/faqs-helpers.test.ts
import { describe, it, expect } from 'vitest';
import { groupByCategory, searchFaqs } from '@/lib/db/queries/faqs-helpers';
import type { Faq } from '@/lib/db/types';

function fq(partial: Partial<Faq>): Faq {
  return {
    id: 'x',
    question: 'Soru',
    answer: 'Cevap',
    category: 'genel',
    sortOrder: 0,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

describe('groupByCategory', () => {
  it('groups faqs by category preserving sort_order', () => {
    const faqs = [
      fq({ id: '1', category: 'genel', sortOrder: 20 }),
      fq({ id: '2', category: 'teknik', sortOrder: 10 }),
      fq({ id: '3', category: 'genel', sortOrder: 10 }),
    ];
    const groups = groupByCategory(faqs);
    expect(groups.genel).toHaveLength(2);
    expect(groups.genel?.[0]!.id).toBe('3');
    expect(groups.teknik).toHaveLength(1);
  });

  it('returns empty array for missing category', () => {
    expect(groupByCategory([]).fiyat ?? []).toEqual([]);
  });
});

describe('searchFaqs', () => {
  const faqs = [
    fq({ id: '1', question: 'Geri ödeme süresi ne?', answer: 'cevap' }),
    fq({ id: '2', question: 'Garanti var mı?', answer: 'evet 25 yıl' }),
  ];

  it('returns all when query is empty', () => {
    expect(searchFaqs(faqs, '')).toHaveLength(2);
  });

  it('matches question case-insensitively', () => {
    expect(searchFaqs(faqs, 'GERİ').map((f) => f.id)).toEqual(['1']);
  });

  it('matches answer text', () => {
    expect(searchFaqs(faqs, '25 yıl').map((f) => f.id)).toEqual(['2']);
  });
});
```

- [ ] **Step 2: Test fail**

```bash
npx vitest run tests/lib/faqs-helpers.test.ts
```

- [ ] **Step 3: Helpers**

```ts
// lib/db/queries/faqs-helpers.ts
import type { Faq } from '../types';

type Category = Faq['category'];

export type FaqGroups = Partial<Record<Category, Faq[]>>;

export function groupByCategory(faqs: Faq[]): FaqGroups {
  const out: FaqGroups = {};
  const sorted = [...faqs].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const f of sorted) {
    const arr = out[f.category] ?? [];
    arr.push(f);
    out[f.category] = arr;
  }
  return out;
}

export function searchFaqs(faqs: Faq[], query: string): Faq[] {
  const q = query.trim().toLocaleLowerCase('tr-TR');
  if (!q) return faqs;
  return faqs.filter((f) => {
    const hay = `${f.question} ${f.answer}`.toLocaleLowerCase('tr-TR');
    return hay.includes(q);
  });
}

export function mapFaqRow(row: {
  id: string;
  question: string;
  answer: string;
  category: Category;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}): Faq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

- [ ] **Step 4: Server query**

```ts
// lib/db/queries/faqs.ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { mapFaqRow } from './faqs-helpers';
import type { Faq } from '../types';

export async function listFaqs(): Promise<Faq[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('category')
    .order('sort_order');
  if (error || !data) return [];
  return data.map(mapFaqRow);
}
```

- [ ] **Step 5: Test geçsin + commit**

```bash
npx vitest run tests/lib/faqs-helpers.test.ts
git add lib/db/queries/faqs.ts lib/db/queries/faqs-helpers.ts tests/lib/faqs-helpers.test.ts
git commit -m "feat(db): add FAQ queries with category grouping and search"
```

---

## Task 7: Contact number generator + schema

**Files:**
- Create: `lib/utils/contact-number.ts`
- Create: `lib/validation/contact-schema.ts`
- Create: `tests/lib/contact-number.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/lib/contact-number.test.ts
import { describe, it, expect } from 'vitest';
import { generateContactNumber } from '@/lib/utils/contact-number';

describe('generateContactNumber', () => {
  it('starts with MSG- prefix', () => {
    expect(generateContactNumber()).toMatch(/^MSG-/);
  });

  it('includes current year', () => {
    expect(generateContactNumber()).toContain(`-${new Date().getFullYear()}-`);
  });

  it('produces 5-character suffix', () => {
    expect(generateContactNumber()).toMatch(/^MSG-\d{4}-[A-Z2-9]{5}$/);
  });

  it('produces different numbers across calls', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateContactNumber()));
    expect(set.size).toBeGreaterThan(40);
  });
});
```

- [ ] **Step 2: Test fail**

```bash
npx vitest run tests/lib/contact-number.test.ts
```

- [ ] **Step 3: Implementation**

```ts
// lib/utils/contact-number.ts
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateContactNumber(): string {
  const year = new Date().getFullYear();
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `MSG-${year}-${suffix}`;
}
```

- [ ] **Step 4: Zod schema**

```ts
// lib/validation/contact-schema.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Adınızı girin').max(120),
  email: z.email('Geçerli bir e-posta giriniz'),
  phone: z.string().max(30).optional().or(z.literal('')),
  subject: z.string().max(200).optional().or(z.literal('')),
  body: z.string().min(10, 'Mesaj en az 10 karakter olmalı').max(4000),
  kvkkAccepted: z
    .boolean()
    .refine((v) => v === true, { message: 'KVKK metnini onaylamanız gerekir' }),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 5: Test geçsin + commit**

```bash
npx vitest run tests/lib/contact-number.test.ts
git add lib/utils/contact-number.ts lib/validation/contact-schema.ts tests/lib/contact-number.test.ts
git commit -m "feat(iletisim): add contact number generator and Zod schema"
```

---

## Task 8: submitContact server action

**Files:**
- Create: `lib/server-actions/submit-contact.ts`

- [ ] **Step 1: Implementation**

```ts
'use server';

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { contactSchema } from '@/lib/validation/contact-schema';
import { generateContactNumber } from '@/lib/utils/contact-number';

export type SubmitContactResult =
  | { ok: true; messageNumber: string }
  | { ok: false; error: string };

export async function submitContact(input: unknown): Promise<SubmitContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Form verileri geçersiz, lütfen alanları kontrol edin.' };
  }
  const data = parsed.data;
  const supabase = await createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const messageNumber = generateContactNumber();
    const { error } = await supabase.from('contact_messages').insert({
      message_number: messageNumber,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      body: data.body,
    });
    if (!error) {
      return { ok: true, messageNumber };
    }
    if ((error as { code?: string }).code === '23505') {
      continue;
    }
    return {
      ok: false,
      error: 'Mesajınız kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.',
    };
  }

  return {
    ok: false,
    error: 'Mesajınız kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/server-actions/submit-contact.ts
git commit -m "feat(iletisim): add submitContact server action with retry"
```

---

## Task 9: BeforeAfterSlider component (TDD)

**Files:**
- Create: `components/galeri/before-after-slider.tsx`
- Create: `tests/components/galeri/before-after-slider.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// tests/components/galeri/before-after-slider.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BeforeAfterSlider } from '@/components/galeri/before-after-slider';

describe('BeforeAfterSlider', () => {
  it('renders both before and after images', () => {
    render(<BeforeAfterSlider before="/b.svg" after="/a.svg" alt="Test" />);
    const imgs = screen.getAllByAltText(/Test/i);
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute('src', '/b.svg');
    expect(imgs[1]).toHaveAttribute('src', '/a.svg');
  });

  it('renders the divider handle with role slider', () => {
    render(<BeforeAfterSlider before="/b.svg" after="/a.svg" alt="X" />);
    const handle = screen.getByRole('slider');
    expect(handle).toHaveAttribute('aria-label', expect.stringMatching(/Önce.*sonra/i));
  });
});
```

- [ ] **Step 2: Test fail**

```bash
npx vitest run tests/components/galeri/before-after-slider.test.tsx
```

- [ ] **Step 3: Implementation**

```tsx
'use client';

import * as React from 'react';
import Image from 'next/image';

interface Props {
  before: string;
  after: string;
  alt: string;
}

export function BeforeAfterSlider({ before, after, alt }: Props) {
  const [pos, setPos] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);

  function setFromClient(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, ratio)));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClient(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons === 0) return;
    setFromClient(e.clientX);
  }
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      className="relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black"
    >
      <Image src={before} alt={`${alt} — önce`} fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image src={after} alt={`${alt} — sonra`} fill sizes="100vw" className="object-cover" priority />
      </div>
      <div
        role="slider"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label="Önce / sonra karşılaştırması"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        className="absolute top-0 bottom-0 -translate-x-1/2 cursor-ew-resize"
        style={{ left: `${pos}%` }}
      >
        <div className="h-full w-1 bg-[var(--color-brand)]" />
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--color-brand)] bg-[var(--color-bg-elevated)] text-[var(--color-brand)]">
          ↔
        </div>
      </div>
      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
        Önce
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-[var(--color-brand)]/90 px-3 py-1 text-xs font-medium text-[var(--color-bg-base)]">
        Sonra
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Test geçsin + commit**

```bash
npx vitest run tests/components/galeri/before-after-slider.test.tsx
git add components/galeri/before-after-slider.tsx tests/components/galeri/before-after-slider.test.tsx
git commit -m "feat(galeri): add before/after slider with pointer + keyboard support"
```

---

## Task 10: Project card + filter tabs + lightbox + project gallery

**Files:**
- Create: `components/galeri/project-card.tsx`
- Create: `components/galeri/filter-tabs.tsx`
- Create: `components/galeri/lightbox.tsx`
- Create: `components/galeri/project-gallery.tsx`
- Create: `components/galeri/related-projects.tsx`

- [ ] **Step 1: project-card.tsx**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/lib/db/types';

const TYPE_LABEL: Record<Project['type'], string> = {
  konut: 'Konut',
  ticari: 'Ticari',
  tarim: 'Tarımsal',
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/galeri/${project.slug}`}
      className="glass group overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-brand)]/90 px-3 py-1 text-xs font-medium text-[var(--color-bg-base)]">
          {TYPE_LABEL[project.type]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold">{project.title}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">{project.location}</p>
        <p className="mt-2 font-mono text-sm text-[var(--color-brand)]">{project.capacityKwp} kWp</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: filter-tabs.tsx**

```tsx
'use client';

import { cn } from '@/lib/utils';
import type { ProjectTypeFilter } from '@/lib/db/queries/projects-helpers';

const TABS: { value: ProjectTypeFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'konut', label: 'Konut' },
  { value: 'ticari', label: 'Ticari' },
  { value: 'tarim', label: 'Tarımsal' },
];

interface Props {
  value: ProjectTypeFilter;
  onChange: (v: ProjectTypeFilter) => void;
}

export function FilterTabs({ value, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Proje tipi filtresi" className="flex flex-wrap gap-2">
      {TABS.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm transition-colors',
            value === t.value
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-bg-base)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: lightbox.tsx**

```tsx
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  open: boolean;
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onChangeIndex: (idx: number) => void;
}

export function Lightbox({ open, images, index, alt, onClose, onChangeIndex }: Props) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowLeft' && index > 0) onChangeIndex(index - 1);
      if (e.key === 'ArrowRight' && index < images.length - 1) onChangeIndex(index + 1);
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onChangeIndex, onClose]);

  const current = images[index];
  if (!current) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col">
          <Dialog.Title className="sr-only">Görsel önizleme</Dialog.Title>
          <header className="flex items-center justify-between p-4 text-white">
            <span className="text-sm">{index + 1} / {images.length}</span>
            <button type="button" onClick={onClose} aria-label="Kapat" className="rounded-full p-2 hover:bg-white/10">
              <X className="h-6 w-6" />
            </button>
          </header>
          <div className="relative flex-1">
            <Image src={current} alt={`${alt} ${index + 1}`} fill sizes="100vw" className="object-contain" />
            {index > 0 && (
              <button
                type="button"
                onClick={() => onChangeIndex(index - 1)}
                aria-label="Önceki"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {index < images.length - 1 && (
              <button
                type="button"
                onClick={() => onChangeIndex(index + 1)}
                aria-label="Sonraki"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 4: project-gallery.tsx**

```tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Lightbox } from './lightbox';

interface Props {
  images: string[];
  alt: string;
}

export function ProjectGallery({ images, alt }: Props) {
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setIdx(i);
              setOpen(true);
            }}
            className="relative aspect-square overflow-hidden rounded-xl"
            aria-label={`Görsel ${i + 1} önizle`}
          >
            <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="(max-width:640px) 50vw, 33vw" className="object-cover transition-transform hover:scale-105" />
          </button>
        ))}
      </div>
      <Lightbox open={open} images={images} index={idx} alt={alt} onClose={() => setOpen(false)} onChangeIndex={setIdx} />
    </>
  );
}
```

- [ ] **Step 5: related-projects.tsx**

```tsx
import { listRelatedProjects } from '@/lib/db/queries/projects';
import { ProjectCard } from './project-card';
import type { Project } from '@/lib/db/types';

interface Props {
  type: Project['type'];
  excludeSlug: string;
}

export async function RelatedProjects({ type, excludeSlug }: Props) {
  const projects = await listRelatedProjects(type, excludeSlug, 3);
  if (projects.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold">Benzer Projeler</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/galeri/
git commit -m "feat(galeri): add ProjectCard, FilterTabs, Lightbox, ProjectGallery, RelatedProjects"
```

---

## Task 11: /galeri page (filterable grid)

**Files:**
- Create: `app/galeri/page.tsx`
- Create: `app/galeri/loading.tsx`
- Create: `components/galeri/galeri-grid-client.tsx`
- Create: `tests/app/galeri/page.test.tsx`

- [ ] **Step 1: galeri-grid-client.tsx (interactive grid)**

```tsx
'use client';

import * as React from 'react';
import { FilterTabs } from './filter-tabs';
import { ProjectCard } from './project-card';
import { filterProjectsByType, type ProjectTypeFilter } from '@/lib/db/queries/projects-helpers';
import type { Project } from '@/lib/db/types';

export function GaleriGridClient({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = React.useState<ProjectTypeFilter>('all');
  const filtered = filterProjectsByType(projects, filter);
  return (
    <div className="space-y-8">
      <FilterTabs value={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Bu kategoride henüz proje yok.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: loading.tsx**

```tsx
export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: page.tsx**

```tsx
import type { Metadata } from 'next';
import { listProjects } from '@/lib/db/queries/projects';
import { GaleriGridClient } from '@/components/galeri/galeri-grid-client';

export const metadata: Metadata = {
  title: 'Galeri | Zolarr',
  description: 'Türkiye genelinde tamamladığımız güneş enerjisi projeleri.',
};

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  const projects = await listProjects();
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Tamamlanan Projeler</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Konut, ticari ve tarımsal alanda Türkiye genelinde uyguladığımız sistemlerden örnekler.
        </p>
      </header>
      <GaleriGridClient projects={projects} />
    </div>
  );
}
```

- [ ] **Step 4: Smoke test**

```tsx
// tests/app/galeri/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/galeri/galeri-grid-client', () => ({
  GaleriGridClient: () => <div data-testid="grid">grid</div>,
}));
vi.mock('@/lib/db/queries/projects', () => ({
  listProjects: vi.fn().mockResolvedValue([]),
}));

import GaleriPage from '@/app/galeri/page';

describe('GaleriPage', () => {
  it('renders header and grid client', async () => {
    const ui = await GaleriPage();
    render(ui);
    expect(screen.getByText(/Tamamlanan Projeler/i)).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Test geçsin + commit**

```bash
npx vitest run tests/app/galeri/page.test.tsx
git add app/galeri components/galeri/galeri-grid-client.tsx tests/app/galeri/page.test.tsx
git commit -m "feat(galeri): add /galeri filterable listing page"
```

---

## Task 12: /galeri/[slug] detail page

**Files:**
- Create: `app/galeri/[slug]/page.tsx`
- Create: `app/galeri/[slug]/not-found.tsx`

- [ ] **Step 1: not-found.tsx**

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProjectNotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">Proje bulunamadı</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">Aradığınız proje yayından kaldırılmış olabilir.</p>
      <Button asChild className="mt-6">
        <Link href="/galeri">Galeriye Dön</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: page.tsx**

```tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Calendar, MapPin, Zap } from 'lucide-react';
import { getProjectBySlug } from '@/lib/db/queries/projects';
import { BeforeAfterSlider } from '@/components/galeri/before-after-slider';
import { ProjectGallery } from '@/components/galeri/project-gallery';
import { RelatedProjects } from '@/components/galeri/related-projects';
import { Button } from '@/components/ui/button';
import { formatTry } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Proje Bulunamadı | Zolarr' };
  return {
    title: `${project.title} | Zolarr Galeri`,
    description: project.description?.slice(0, 160) ?? `${project.title} — ${project.location}`,
  };
}

const TYPE_LABEL = { konut: 'Konut', ticari: 'Ticari', tarim: 'Tarımsal' } as const;

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {project.beforeImage && project.afterImage ? (
        <BeforeAfterSlider before={project.beforeImage} after={project.afterImage} alt={project.title} />
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <Image src={project.coverImage} alt={project.title} fill sizes="100vw" className="object-cover" priority />
        </div>
      )}

      <header className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-[var(--color-brand)]/15 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
            {TYPE_LABEL[project.type]}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{project.title}</h1>
        </div>
        <Button asChild>
          <Link href="/teklif/al">Benzer bir teklif al <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </header>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4">
          <dt className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <MapPin className="h-4 w-4" /> Lokasyon
          </dt>
          <dd className="mt-1 font-medium">{project.location}</dd>
        </div>
        <div className="glass rounded-2xl p-4">
          <dt className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Zap className="h-4 w-4" /> Kapasite
          </dt>
          <dd className="mt-1 font-mono font-medium text-[var(--color-brand)]">{project.capacityKwp} kWp</dd>
        </div>
        {project.completionDate && (
          <div className="glass rounded-2xl p-4">
            <dt className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Calendar className="h-4 w-4" /> Tamamlanma
            </dt>
            <dd className="mt-1 font-medium">{new Date(project.completionDate).toLocaleDateString('tr-TR')}</dd>
          </div>
        )}
      </dl>

      {project.description && (
        <div className="prose prose-sm mt-8 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
        </div>
      )}

      {project.galleryImages.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Görseller</h2>
          <div className="mt-4">
            <ProjectGallery images={project.galleryImages} alt={project.title} />
          </div>
        </section>
      )}

      {project.customerQuote && (
        <blockquote className="mt-10 rounded-2xl border-l-4 border-[var(--color-brand)] bg-[var(--color-bg-elevated)] p-6">
          <p className="italic">&quot;{project.customerQuote}&quot;</p>
          {project.customerName && (
            <footer className="mt-2 text-sm text-[var(--color-text-muted)]">— {project.customerName}</footer>
          )}
        </blockquote>
      )}

      {project.annualSavingsTry !== null && (
        <div className="mt-10 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/5 p-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Yıllık tasarruf</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--color-brand)]">{formatTry(project.annualSavingsTry)}</p>
        </div>
      )}

      <RelatedProjects type={project.type} excludeSlug={project.slug} />
    </div>
  );
}
```

- [ ] **Step 3: Build temiz mi + commit**

```bash
npm run build
git add app/galeri/\[slug\]
git commit -m "feat(galeri): add project detail page with before/after, gallery, related"
```

---

## Task 13: Hakkımızda mock data

**Files:**
- Create: `lib/data/team-mock.ts`
- Create: `lib/data/brands-mock.ts`
- Create: `lib/data/values-mock.ts`

- [ ] **Step 1: team-mock.ts**

```ts
export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  photo: string;
}

export const TEAM_MOCK: TeamMember[] = [
  { name: 'Eren Arslan', title: 'Kurucu & CEO', bio: 'İTÜ Elektrik Mühendisliği. 15 yıl yenilenebilir enerji sektörü tecrübesi.', photo: '/images/placeholder-team-1.svg' },
  { name: 'Selin Demir', title: 'Teknik Direktör', bio: 'ODTÜ Enerji Sistemleri. Türkiye genelinde 50+ MW lik kurulum yönetti.', photo: '/images/placeholder-team-2.svg' },
  { name: 'Burak Çelik', title: 'Operasyon Müdürü', bio: 'Saha ekiplerinin koordinasyonu, malzeme tedariği ve süreç optimizasyonu.', photo: '/images/placeholder-team-3.svg' },
  { name: 'Aylin Yıldız', title: 'Müşteri Deneyimi Lideri', bio: 'Talep alma sürecinden bakım sonrası desteğe kadar müşteri yolculuğunu yönetir.', photo: '/images/placeholder-team-4.svg' },
];
```

- [ ] **Step 2: brands-mock.ts**

```ts
export interface Brand {
  name: string;
  logo: string;
  category: 'panel' | 'invertor';
}

export const BRANDS_MOCK: Brand[] = [
  { name: 'Longi', logo: '/images/placeholder-brand-1.svg', category: 'panel' },
  { name: 'Trina Solar', logo: '/images/placeholder-brand-2.svg', category: 'panel' },
  { name: 'Canadian Solar', logo: '/images/placeholder-brand-3.svg', category: 'panel' },
  { name: 'REC', logo: '/images/placeholder-brand-4.svg', category: 'panel' },
  { name: 'Huawei', logo: '/images/placeholder-brand-5.svg', category: 'invertor' },
  { name: 'SMA', logo: '/images/placeholder-brand-6.svg', category: 'invertor' },
  { name: 'Solis', logo: '/images/placeholder-brand-7.svg', category: 'invertor' },
  { name: 'Growatt', logo: '/images/placeholder-brand-8.svg', category: 'invertor' },
];
```

- [ ] **Step 3: values-mock.ts**

```ts
import { Eye, ShieldCheck, Sparkles, Sprout } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CompanyValue {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const VALUES_MOCK: CompanyValue[] = [
  { icon: Eye, title: 'Şeffaflık', description: 'Teklif aşamasından devreye almaya kadar her adımı yazılı belgelendiriyoruz.' },
  { icon: ShieldCheck, title: 'Kalite', description: 'Sadece TS EN sertifikalı malzeme; üretici garantisi haricinde kendi işçilik garantimizi sunuyoruz.' },
  { icon: Sparkles, title: 'Hız', description: 'Konutta 2-4 iş günü içinde sistemi devreye alıyoruz; bürokratik süreçleri biz yönetiyoruz.' },
  { icon: Sprout, title: 'Sürdürülebilirlik', description: 'Eski panel takip programıyla ekonomik ömrünü doldurmuş ekipmanları geri dönüştürüyoruz.' },
];
```

- [ ] **Step 4: Commit**

```bash
git add lib/data/team-mock.ts lib/data/brands-mock.ts lib/data/values-mock.ts
git commit -m "feat(hakkimizda): add team, brands, values mock data"
```

---

## Task 14: Hakkımızda components + page

**Files:**
- Create: `components/hakkimizda/values-grid.tsx`
- Create: `components/hakkimizda/team-grid.tsx`
- Create: `components/hakkimizda/brand-grid.tsx`
- Create: `app/hakkimizda/page.tsx`

- [ ] **Step 1: values-grid.tsx**

```tsx
import { VALUES_MOCK } from '@/lib/data/values-mock';

export function ValuesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {VALUES_MOCK.map((v) => (
        <div key={v.title} className="glass rounded-2xl p-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <v.icon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{v.description}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: team-grid.tsx**

```tsx
import Image from 'next/image';
import { TEAM_MOCK } from '@/lib/data/team-mock';

export function TeamGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {TEAM_MOCK.map((m) => (
        <div key={m.name} className="text-center">
          <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-2 border-[var(--color-brand)]/30">
            <Image src={m.photo} alt={m.name} fill sizes="128px" className="object-cover" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{m.name}</h3>
          <p className="text-sm text-[var(--color-brand)]">{m.title}</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{m.bio}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: brand-grid.tsx**

```tsx
import Image from 'next/image';
import { BRANDS_MOCK } from '@/lib/data/brands-mock';

export function BrandGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {BRANDS_MOCK.map((b) => (
        <div key={b.name} className="glass flex aspect-[3/2] items-center justify-center rounded-2xl p-4">
          <div className="relative h-12 w-full">
            <Image src={b.logo} alt={b.name} fill className="object-contain" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: app/hakkimizda/page.tsx**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ValuesGrid } from '@/components/hakkimizda/values-grid';
import { TeamGrid } from '@/components/hakkimizda/team-grid';
import { BrandGrid } from '@/components/hakkimizda/brand-grid';
import { CountUp } from '@/components/ui/count-up';

export const metadata: Metadata = {
  title: 'Hakkımızda | Zolarr',
  description: 'Zolarr — Türkiye’nin güneş enerjisi sistemleri firmasının hikayesi, ekibi ve değerleri.',
};

export default function HakkimizdaPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 space-y-16">
      <header>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Türkiye&apos;nin çatılarına güneş taşıyoruz</h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
          2018&apos;de İzmir&apos;de küçük bir mühendislik ekibiyle başladık. Bugün konut, ticari ve tarımsal projelerde toplam 12 MW kapasiteye ulaştık.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">Vizyon</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Türkiye&apos;nin her köşesindeki çatıyı bir enerji üreticisine dönüştürmek; vatandaşların elektrik faturasından bağımsız, kendi enerjisini ürettiği bir geleceğin kapısını aralamak.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Misyon</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Erişilebilir, güvenilir ve estetik güneş enerjisi sistemleri sunmak. Her müşteriye keşiften 25 yıllık performansa kadar tek elden hizmet vermek.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Değerlerimiz</h2>
        <div className="mt-6">
          <ValuesGrid />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-bg-elevated)] p-8">
        <h2 className="font-display text-2xl font-bold text-center">Sayılarla Başarımız</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-4 text-center">
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]"><CountUp end={500} suffix="+" /></p>
            <p className="text-sm text-[var(--color-text-muted)]">Tamamlanan Kurulum</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]"><CountUp end={12} suffix=" MW" /></p>
            <p className="text-sm text-[var(--color-text-muted)]">Toplam Kurulu Güç</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]"><CountUp end={7} suffix=" yıl" /></p>
            <p className="text-sm text-[var(--color-text-muted)]">Sektör Tecrübesi</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]"><CountUp end={4500} suffix=" ton" /></p>
            <p className="text-sm text-[var(--color-text-muted)]">CO₂ Tasarrufu</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Ekibimiz</h2>
        <div className="mt-6">
          <TeamGrid />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Çalıştığımız Markalar</h2>
        <div className="mt-6">
          <BrandGrid />
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--color-brand)]/5 p-10 text-center">
        <h2 className="font-display text-3xl font-bold">Bize katılın</h2>
        <p className="mt-2 text-[var(--color-text-muted)]">Bayi olarak Zolarr ailesinde yer almak ister misiniz?</p>
        <Button asChild className="mt-6">
          <Link href="/teklif/ver">Bayi Başvurusu</Link>
        </Button>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/hakkimizda app/hakkimizda
git commit -m "feat(hakkimizda): add about page with values, team, stats, brands"
```

---

## Task 15: ContactForm component (TDD)

**Files:**
- Create: `components/iletisim/contact-form.tsx`
- Create: `tests/components/iletisim/contact-form.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// tests/components/iletisim/contact-form.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/server-actions/submit-contact', () => ({
  submitContact: vi.fn().mockResolvedValue({ ok: true, messageNumber: 'MSG-2026-AAAAA' }),
}));

import { ContactForm } from '@/components/iletisim/contact-form';

describe('ContactForm', () => {
  it('shows error when KVKK is not accepted', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/Mesajınız/i), 'Bu en az on karakter mesaj.');
    await user.click(screen.getByRole('button', { name: /Gönder/i }));
    expect(await screen.findByText(/KVKK metnini onaylamanız gerekir/i)).toBeInTheDocument();
  });

  it('shows success state after successful submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/Mesajınız/i), 'Bu en az on karakter mesaj.');
    await user.click(screen.getByLabelText(/KVKK aydınlatma/i));
    await user.click(screen.getByRole('button', { name: /Gönder/i }));
    expect(await screen.findByText(/MSG-2026-AAAAA/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test fail**

```bash
npx vitest run tests/components/iletisim/contact-form.test.tsx
```

- [ ] **Step 3: Implementation**

```tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contactSchema, type ContactInput } from '@/lib/validation/contact-schema';
import { submitContact } from '@/lib/server-actions/submit-contact';

type Form = Omit<ContactInput, 'kvkkAccepted'> & { kvkkAccepted: boolean };

const INITIAL: Form = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  body: '',
  kvkkAccepted: false,
};

export function ContactForm() {
  const [form, setForm] = React.useState<Form>(INITIAL);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [messageNumber, setMessageNumber] = React.useState<string | null>(null);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = contactSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await submitContact(r.data);
      if (res.ok) setMessageNumber(res.messageNumber);
      else setErrors({ _form: res.error });
    } catch {
      setErrors({ _form: 'Beklenmeyen bir hata oluştu, lütfen tekrar deneyin.' });
    } finally {
      setPending(false);
    }
  }

  if (messageNumber) {
    return (
      <div className="flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand)]/15">
          <Check className="h-8 w-8 text-[var(--color-brand)]" strokeWidth={3} />
        </motion.div>
        <h3 className="mt-6 font-display text-2xl font-bold">Mesajınız iletildi!</h3>
        <p className="mt-2 text-[var(--color-text-muted)]">İletişim numaranız:</p>
        <p className="mt-3 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-bg-elevated)] px-5 py-2 font-mono text-lg text-[var(--color-brand)]">{messageNumber}</p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">2 iş günü içinde size dönüş yapılacak.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad Soyad *" htmlFor="c-name" error={errors.name}>
          <Input id="c-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="E-posta *" htmlFor="c-email" error={errors.email}>
          <Input id="c-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefon" htmlFor="c-phone" error={errors.phone}>
          <Input id="c-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+90..." />
        </Field>
        <Field label="Konu" htmlFor="c-subject" error={errors.subject}>
          <Input id="c-subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
        </Field>
      </div>
      <Field label="Mesajınız *" htmlFor="c-body" error={errors.body}>
        <textarea
          id="c-body"
          rows={5}
          maxLength={4000}
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.kvkkAccepted}
          onChange={(e) => set('kvkkAccepted', e.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
        />
        <span>KVKK aydınlatma metnini okudum ve verilerimin iletişim amacıyla işlenmesine onay veriyorum. *</span>
      </label>
      {errors.kvkkAccepted && <p className="text-sm text-[var(--color-danger)]">{errors.kvkkAccepted}</p>}
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Gönderiliyor…' : 'Gönder'}</Button>
    </form>
  );
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Test geçsin + commit**

```bash
npx vitest run tests/components/iletisim/contact-form.test.tsx
git add components/iletisim/contact-form.tsx tests/components/iletisim/contact-form.test.tsx
git commit -m "feat(iletisim): add contact form with Zod + server action"
```

---

## Task 16: /iletisim page (form + maps + info)

**Files:**
- Create: `components/iletisim/maps-embed.tsx`
- Create: `components/iletisim/contact-info-card.tsx`
- Create: `app/iletisim/page.tsx`

- [ ] **Step 1: maps-embed.tsx**

```tsx
export function MapsEmbed() {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-border)]">
      <iframe
        title="Zolarr ofis konumu"
        src="https://www.google.com/maps?q=Karşıyaka,İzmir&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full"
      />
    </div>
  );
}
```

- [ ] **Step 2: contact-info-card.tsx**

```tsx
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { CONTACT } from '@/lib/constants';

export function ContactInfoCard() {
  return (
    <ul className="space-y-4">
      <li className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <span>{CONTACT.address}</span>
      </li>
      <li className="flex items-start gap-3">
        <Phone className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <a href={`tel:${CONTACT.phone}`} className="hover:underline">{CONTACT.phone}</a>
      </li>
      <li className="flex items-start gap-3">
        <Mail className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <a href={`mailto:${CONTACT.email}`} className="hover:underline">{CONTACT.email}</a>
      </li>
      <li className="flex items-start gap-3">
        <MessageCircle className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand)]" />
        <a href={`https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
          WhatsApp ile iletişim
        </a>
      </li>
    </ul>
  );
}
```

- [ ] **Step 3: page.tsx**

```tsx
import type { Metadata } from 'next';
import { ContactForm } from '@/components/iletisim/contact-form';
import { MapsEmbed } from '@/components/iletisim/maps-embed';
import { ContactInfoCard } from '@/components/iletisim/contact-info-card';

export const metadata: Metadata = {
  title: 'İletişim | Zolarr',
  description: 'Zolarr ile iletişime geçin — adres, telefon, e-posta ve form.',
};

export default function IletisimPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">İletişim</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Sorularınız ve teklif talepleriniz için aşağıdaki formu doldurun veya doğrudan ulaşın.
        </p>
      </header>
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">Bize Yazın</h2>
          <ContactForm />
        </section>
        <aside className="space-y-8">
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Bize Ulaşın</h2>
            <ContactInfoCard />
          </section>
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Konum</h2>
            <MapsEmbed />
          </section>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build temiz mi + commit**

```bash
npm run build
git add components/iletisim/maps-embed.tsx components/iletisim/contact-info-card.tsx app/iletisim/page.tsx
git commit -m "feat(iletisim): add /iletisim page with form, maps, info"
```

---

## Task 17: SSS components (TDD search) + page

**Files:**
- Create: `components/sss/faq-search.tsx`
- Create: `components/sss/faq-category-tabs.tsx`
- Create: `components/sss/faq-list.tsx`
- Create: `components/sss/sss-client.tsx`
- Create: `app/sss/page.tsx`
- Create: `tests/components/sss/faq-search.test.tsx`
- Create: `tests/app/sss/page.test.tsx`

- [ ] **Step 1: faq-search.tsx + failing test**

```tsx
// tests/components/sss/faq-search.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FaqSearch } from '@/components/sss/faq-search';

describe('FaqSearch', () => {
  it('calls onChange after each keystroke', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FaqSearch value="" onChange={onChange} />);
    await user.type(screen.getByLabelText(/Soru ara/i), 'gar');
    expect(onChange).toHaveBeenCalledWith('g');
    expect(onChange).toHaveBeenCalledWith('a');
    expect(onChange).toHaveBeenCalledWith('r');
  });
});
```

- [ ] **Step 2: Test fail**

```bash
npx vitest run tests/components/sss/faq-search.test.tsx
```

- [ ] **Step 3: Implementation faq-search.tsx**

```tsx
'use client';

import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function FaqSearch({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
      <input
        type="search"
        aria-label="Soru ara"
        placeholder="Soru ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
      />
    </div>
  );
}
```

- [ ] **Step 4: faq-category-tabs.tsx**

```tsx
'use client';

import type { Faq } from '@/lib/db/types';
import { cn } from '@/lib/utils';

const CATEGORY_LABEL: Record<Faq['category'] | 'all', string> = {
  all: 'Tümü',
  genel: 'Genel',
  teknik: 'Teknik',
  fiyat: 'Fiyat',
  kurulum: 'Kurulum',
  garanti: 'Garanti',
};

const ORDER: ('all' | Faq['category'])[] = ['all', 'genel', 'teknik', 'fiyat', 'kurulum', 'garanti'];

export type FaqFilter = 'all' | Faq['category'];

export function FaqCategoryTabs({ value, onChange }: { value: FaqFilter; onChange: (v: FaqFilter) => void }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {ORDER.map((c) => (
        <button
          key={c}
          role="tab"
          type="button"
          aria-selected={value === c}
          onClick={() => onChange(c)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm transition-colors',
            value === c
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-bg-base)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
          )}
        >
          {CATEGORY_LABEL[c]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: faq-list.tsx**

```tsx
'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Faq } from '@/lib/db/types';

export function FaqList({ items }: { items: Faq[] }) {
  if (items.length === 0) {
    return <p className="text-[var(--color-text-muted)]">Sorunuz bulunamadı. Aramayı değiştirip tekrar deneyin.</p>;
  }
  return (
    <Accordion.Root type="multiple" className="divide-y divide-[var(--color-border-glass)]">
      {items.map((f) => (
        <Accordion.Item key={f.id} value={f.id}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left font-medium">
              {f.question}
              <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-4 prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{f.answer}</ReactMarkdown>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
```

- [ ] **Step 6: sss-client.tsx**

```tsx
'use client';

import * as React from 'react';
import { FaqSearch } from './faq-search';
import { FaqCategoryTabs, type FaqFilter } from './faq-category-tabs';
import { FaqList } from './faq-list';
import { searchFaqs } from '@/lib/db/queries/faqs-helpers';
import type { Faq } from '@/lib/db/types';

export function SssClient({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<FaqFilter>('all');

  const byCategory = category === 'all' ? faqs : faqs.filter((f) => f.category === category);
  const filtered = searchFaqs(byCategory, query);

  return (
    <div className="space-y-6">
      <FaqSearch value={query} onChange={setQuery} />
      <FaqCategoryTabs value={category} onChange={setCategory} />
      <FaqList items={filtered} />
    </div>
  );
}
```

- [ ] **Step 7: app/sss/page.tsx**

```tsx
import type { Metadata } from 'next';
import { listFaqs } from '@/lib/db/queries/faqs';
import { SssClient } from '@/components/sss/sss-client';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular | Zolarr',
  description: 'Güneş enerjisi, teklif süreci, kurulum ve garanti hakkında en çok sorulan sorular.',
};

export const dynamic = 'force-dynamic';

export default async function SssPage() {
  const faqs = await listFaqs();
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Sıkça Sorulan Sorular</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">Aklınıza takılanlara hızlı yanıtlar.</p>
      </header>
      <SssClient faqs={faqs} />
    </div>
  );
}
```

- [ ] **Step 8: page smoke test**

```tsx
// tests/app/sss/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/sss/sss-client', () => ({
  SssClient: () => <div data-testid="sss-client" />,
}));
vi.mock('@/lib/db/queries/faqs', () => ({
  listFaqs: vi.fn().mockResolvedValue([]),
}));

import SssPage from '@/app/sss/page';

describe('SssPage', () => {
  it('renders heading and client', async () => {
    const ui = await SssPage();
    render(ui);
    expect(screen.getByText(/Sıkça Sorulan Sorular/i)).toBeInTheDocument();
    expect(screen.getByTestId('sss-client')).toBeInTheDocument();
  });
});
```

- [ ] **Step 9: All tests pass + commit**

```bash
npx vitest run tests/components/sss tests/app/sss
git add components/sss app/sss tests/components/sss tests/app/sss
git commit -m "feat(sss): add /sss page with category tabs and search"
```

---

## Task 18: Ayarlar — section components + page

**Files:**
- Create: `components/ayarlar/section-card.tsx`
- Create: `components/ayarlar/theme-section.tsx`
- Create: `components/ayarlar/cookie-section.tsx`
- Create: `components/ayarlar/social-section.tsx`
- Create: `components/ayarlar/contact-info-section.tsx`
- Create: `components/ayarlar/legal-section.tsx`
- Create: `components/ayarlar/auth-deferred-section.tsx`
- Create: `app/ayarlar/page.tsx`

- [ ] **Step 1: section-card.tsx**

```tsx
import * as React from 'react';

export function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-6">
      <header>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: theme-section.tsx**

```tsx
'use client';

import { useTheme } from 'next-themes';
import { SectionCard } from './section-card';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Aydınlık' },
  { value: 'dark', label: 'Karanlık' },
  { value: 'system', label: 'Sistem' },
];

export function ThemeSection() {
  const { theme, setTheme } = useTheme();
  return (
    <SectionCard title="Tema" description="Sayfayı aydınlık veya karanlık modda görüntüleyin.">
      <div className="flex gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              theme === o.value
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-bg-base)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 3: cookie-section.tsx**

```tsx
'use client';

import * as React from 'react';
import { SectionCard } from './section-card';

interface Prefs {
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'zolarr-cookie-prefs';
const DEFAULT_PREFS: Prefs = { analytics: false, marketing: false };

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function CookieSection() {
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => setPrefs(loadPrefs()), []);

  function save() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Çerez Tercihleri" description="Hangi çerezlerin tarayıcınıza kaydedileceğini seçin.">
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span>
            <strong className="block">Zorunlu çerezler</strong>
            <span className="text-sm text-[var(--color-text-muted)]">Sayfa çalışması için gerekli, kapatılamaz.</span>
          </span>
          <input type="checkbox" checked disabled className="h-5 w-5 accent-[var(--color-brand)]" />
        </label>
        <label className="flex items-center justify-between">
          <span>
            <strong className="block">Analitik</strong>
            <span className="text-sm text-[var(--color-text-muted)]">Anonim ziyaretçi istatistikleri.</span>
          </span>
          <input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))} className="h-5 w-5 accent-[var(--color-brand)]" />
        </label>
        <label className="flex items-center justify-between">
          <span>
            <strong className="block">Pazarlama</strong>
            <span className="text-sm text-[var(--color-text-muted)]">Kişiselleştirilmiş tanıtımlar.</span>
          </span>
          <input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))} className="h-5 w-5 accent-[var(--color-brand)]" />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={save} className="rounded-2xl bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-bg-base)]">
          Tercihlerimi Kaydet
        </button>
        {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 4: social-section.tsx**

```tsx
import { Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';
import { SectionCard } from './section-card';
import { CONTACT } from '@/lib/constants';

const LINKS = [
  { Icon: Instagram, label: 'Instagram', href: CONTACT.social?.instagram ?? '#' },
  { Icon: Linkedin, label: 'LinkedIn', href: CONTACT.social?.linkedin ?? '#' },
  { Icon: Youtube, label: 'YouTube', href: CONTACT.social?.youtube ?? '#' },
  { Icon: Facebook, label: 'Facebook', href: CONTACT.social?.facebook ?? '#' },
];

export function SocialSection() {
  return (
    <SectionCard title="Sosyal Medya">
      <ul className="grid gap-2 sm:grid-cols-2">
        {LINKS.map(({ Icon, label, href }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2 hover:border-[var(--color-brand)]/40">
              <Icon className="h-4 w-4 text-[var(--color-brand)]" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
```

- [ ] **Step 5: contact-info-section.tsx**

```tsx
import { SectionCard } from './section-card';
import { ContactInfoCard } from '@/components/iletisim/contact-info-card';
import { MapsEmbed } from '@/components/iletisim/maps-embed';

export function ContactInfoSection() {
  return (
    <SectionCard title="İletişim Bilgileri">
      <ContactInfoCard />
      <div className="mt-6">
        <MapsEmbed />
      </div>
    </SectionCard>
  );
}
```

- [ ] **Step 6: legal-section.tsx**

```tsx
import Link from 'next/link';
import { SectionCard } from './section-card';

const LINKS = [
  { href: '/yasal/kvkk', label: 'KVKK Metni' },
  { href: '/yasal/gizlilik', label: 'Gizlilik Politikası' },
  { href: '/yasal/mesafeli-satis', label: 'Mesafeli Satış Sözleşmesi' },
];

export function LegalSection() {
  return (
    <SectionCard title="Yasal" description="Yasal metinlere erişim ve veri talepleri.">
      <ul className="space-y-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-[var(--color-brand)] hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
        <li className="pt-2 text-sm text-[var(--color-text-muted)]">
          Verilerimi indir / Hesabımı sil işlemleri Faz 7&apos;de aktif olacak.
        </li>
      </ul>
    </SectionCard>
  );
}
```

- [ ] **Step 7: auth-deferred-section.tsx**

```tsx
import { SectionCard } from './section-card';

export function AuthDeferredSection({ title, description }: { title: string; description: string }) {
  return (
    <SectionCard title={title}>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      <p className="mt-2 inline-block rounded-full border border-dashed border-[var(--color-brand)]/40 px-3 py-1 text-xs text-[var(--color-brand)]">
        Faz 7&apos;de aktif olacak
      </p>
    </SectionCard>
  );
}
```

- [ ] **Step 8: app/ayarlar/page.tsx**

```tsx
import type { Metadata } from 'next';
import { ThemeSection } from '@/components/ayarlar/theme-section';
import { CookieSection } from '@/components/ayarlar/cookie-section';
import { SocialSection } from '@/components/ayarlar/social-section';
import { ContactInfoSection } from '@/components/ayarlar/contact-info-section';
import { LegalSection } from '@/components/ayarlar/legal-section';
import { AuthDeferredSection } from '@/components/ayarlar/auth-deferred-section';

export const metadata: Metadata = {
  title: 'Ayarlar | Zolarr',
  description: 'Tema, çerezler, iletişim bilgileri ve hesap ayarları.',
};

export default function AyarlarPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Ayarlar</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">Tercihlerinizi yönetin.</p>
      </header>
      <AuthDeferredSection title="Hesap Bilgileri" description="Ad, soyad, telefon ve şifre değiştirme." />
      <ThemeSection />
      <AuthDeferredSection title="Bildirimler" description="E-posta ve push bildirim tercihleri." />
      <CookieSection />
      <SocialSection />
      <ContactInfoSection />
      <LegalSection />
    </div>
  );
}
```

- [ ] **Step 9: Build temiz mi + commit**

```bash
npm run build
git add components/ayarlar app/ayarlar
git commit -m "feat(ayarlar): add settings page with theme, cookies, social, legal sections"
```

---

## Task 19: lib/constants.ts'e social field ekle (yoksa)

**Files:**
- Modify: `lib/constants.ts`

- [ ] **Step 1: Mevcut CONTACT objesini incele, gerekiyorsa social alt-objesini ekle**

Beklenen şekil:

```ts
export const CONTACT = {
  phone: '+90 232 ... ...',
  whatsapp: '+90 5..',
  email: 'info@zolarr.com.tr',
  address: 'Karşıyaka, İzmir',
  social: {
    instagram: 'https://instagram.com/zolarr',
    linkedin: 'https://linkedin.com/company/zolarr',
    youtube: 'https://youtube.com/@zolarr',
    facebook: 'https://facebook.com/zolarr',
  },
} as const;
```

Eğer `social` zaten varsa step'i atla. Yoksa, mevcut alanları koruyarak `social` ekle.

- [ ] **Step 2: TypeScript temiz mi, commit**

```bash
npx tsc --noEmit
git add lib/constants.ts
git commit -m "feat: add social media URLs to CONTACT constant"
```

---

## Task 20: Header navigation güncelle (yeni sayfa linkleri)

**Files:**
- Modify: `components/layout/header.tsx`

- [ ] **Step 1: Header nav menüsüne yeni linkleri ekle**

Mevcut nav öğelerine ek olarak: Galeri (`/galeri`), Hakkımızda (`/hakkimizda`), İletişim (`/iletisim`).

Mevcut header.tsx'i oku, NAV_LINKS dizisine yeni öğeleri ekle. Order: Anasayfa, Mağaza, Teklif, Galeri, Hakkımızda, İletişim. (`/sss` ve `/ayarlar` footer'da.)

- [ ] **Step 2: Footer Hızlı Linkler bölümü güncelle**

`components/layout/footer.tsx`'i oku, hızlı linkler sütununa SSS (`/sss`) ve Ayarlar (`/ayarlar`) ekle.

- [ ] **Step 3: Build temiz mi + commit**

```bash
npm run build
git add components/layout/header.tsx components/layout/footer.tsx
git commit -m "feat(layout): add Galeri/Hakkımızda/İletişim/SSS/Ayarlar to nav"
```

---

## Task 21: Final verification + completion report

**Files:**
- Create: `docs/superpowers/plans/2026-05-06-faz-6-completion.md`

- [ ] **Step 1: Doğrulama**

```bash
npm test
npx tsc --noEmit
npm run build
```

Beklenen: tüm testler PASS, tsc 0 hata, build clean. Yeni rotalar listede: `/galeri`, `/galeri/[slug]`, `/hakkimizda`, `/iletisim`, `/sss`, `/ayarlar`.

- [ ] **Step 2: Completion report yaz**

```md
# Faz 6 — Galeri + Hakkımızda + İletişim + SSS + Ayarlar: Completion Report

**Tarih:** 2026-05-06
**Branch:** master
**Plan:** docs/superpowers/plans/2026-05-06-faz-6-galeri-hakkimizda-iletisim-sss-ayarlar.md

## Özet

Beş yeni public sayfa eklendi: filtreli galeri + before/after slider'lı detay,
hakkımızda (vizyon/misyon/değerler/ekip/sayılar/markalar/CTA), iletişim formu +
Google Maps + iletişim bilgileri, kategorili SSS + arama, ayarlar paneli (tema,
çerezler, sosyal, iletişim bilgileri, yasal — auth bölümleri Faz 7'de aktifleşecek).

## Sayılar

- Görev: 21
- Test: <NNN> / <NNN> ✅
- TypeScript: temiz
- Build: temiz
- Yeni rota: 6 (/galeri, /galeri/[slug], /hakkimizda, /iletisim, /sss, /ayarlar)

## Bilinen sınırlamalar

- Hesap Bilgileri, Bildirimler ayarları → Faz 7'de aktif olacak
- "Verilerimi indir / Hesabımı sil" → Faz 7'de aktif olacak
- Admin CRUD (proje/SSS/iletişim mesajları) → Faz 8'de
- Yasal sayfalar (KVKK, Gizlilik, Mesafeli Satış) → Faz 10'da içerikleri yazılacak

## Kullanıcı eylemi gerekli

1. `supabase/migrations/combined_for_paste_v4.sql`'i Supabase Studio SQL Editor'a
   yapıştırıp Run — `projects` (12 satır), `faqs` (15 satır), `contact_messages` tabloları.
```

- [ ] **Step 3: Push + commit**

```bash
git add docs/superpowers/plans/2026-05-06-faz-6-completion.md
git commit -m "docs: Phase 6 completion report"
```

---

## Self-Review

**Spec coverage (§9, §10, §11, §SSS):**
- (9.1) Galeri filtre + grid: ✅ Task 11
- (9.2) Proje detay before/after, açıklama, görseller, ürünler, müşteri görüşü, tasarruf, benzer projeler: ✅ Task 12
- (10) Hakkımızda hikaye, vizyon, misyon, değerler, ekip, sertifikalar, sayılarla başarı, markalar, "Bize katılın" CTA: ✅ Task 14 (sertifikalar markalarla aynı grid'de yer aldı; ayrı grid eklenmedi — YAGNI)
- (11.1.1) Hesap bilgileri: ⏳ Faz 7
- (11.1.2) Tema: ✅
- (11.1.3) Bildirimler: ⏳ Faz 7
- (11.1.4) Çerez politikaları: ✅
- (11.1.5) Sosyal medya: ✅
- (11.1.6) İletişim bilgileri + Maps: ✅
- (11.1.7) KVKK/Yasal: ✅ (linkler), Verilerimi indir/Sil: ⏳ Faz 7
- İletişim sayfası (form + Maps): ✅ Tasks 15, 16
- SSS (kategorili + arama): ✅ Task 17

**Placeholder scan:** Tüm task'larda kod tam, "TODO" yok. "Faz 7'de aktif olacak" placeholder'lar bilinçli — auth gerektiren bölümler.

**Type consistency:**
- `Project` interface (lib/db/types.ts) ile `mapProjectRow` çıktısı tutarlı (Task 4 + Task 5)
- `Faq` interface ile `mapFaqRow` çıktısı tutarlı (Task 4 + Task 6)
- `ContactInput` zod inferred type ile `submitContact` arg uyumlu (Task 7 + Task 8)
- `ProjectTypeFilter` Task 5'te tanımlandı, Task 10'da `FilterTabs` ve Task 11'de `GaleriGridClient` aynı tipi kullanıyor
- `FaqFilter` Task 17'de `'all' | Faq['category']` olarak tanımlandı, hem `FaqCategoryTabs` hem `SssClient` aynı tipi kullanıyor

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-06-faz-6-galeri-hakkimizda-iletisim-sss-ayarlar.md`. Subagent-Driven ile yürütülecek.**
