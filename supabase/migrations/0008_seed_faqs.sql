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
