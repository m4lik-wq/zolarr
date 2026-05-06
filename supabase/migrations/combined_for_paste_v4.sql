-- ============================================================
-- combined_for_paste_v4.sql
-- Faz 6 Batch A — projects + faqs + contact_messages
-- Includes: 0006 (schema) + 0007 (seed projects) + 0008 (seed faqs)
-- Paste this entire file into Supabase Studio SQL editor.
-- ============================================================

-- ============================================================
-- 0006_projects_faqs_contact.sql
-- ============================================================

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

-- ============================================================
-- 0007_seed_projects.sql
-- 12 örnek proje (4 konut + 4 ticari + 4 tarım)
-- ============================================================

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

-- ============================================================
-- 0008_seed_faqs.sql
-- 5 kategori × 3 soru = 15
-- ============================================================

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

-- ============================================================
-- VERIFICATION
-- ============================================================
select 'projects' as table_name, count(*) from public.projects
union all
select 'faqs', count(*) from public.faqs
union all
select 'contact_messages', count(*) from public.contact_messages;
