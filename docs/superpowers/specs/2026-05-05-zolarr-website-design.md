# Zolarr — Güneş Enerjisi Sistemleri Web Sitesi Tasarım Belgesi (v2)

**Tarih:** 2026-05-05
**Durum:** Onaylandı (kullanıcı onayı: 2026-05-05) — `ges.txt` dokümanına göre revize edildi
**Yazar:** Claude (Opus 4.7) ile birlikte hazırlandı
**Hedef:** Full-stack, çok fonksiyonlu, profesyonel, AI-destekli güneş enerjisi e-ticaret + iş web sitesi
**Kaynak:** Kullanıcının `C:\Users\Lenovo\Desktop\ges.txt` dokümanı + önceki onaylı plan

---

## 1. Genel Bakış

**Zolarr**, hem konut hem ticari müşterilere yönelik bir güneş enerjisi sistemleri (GES) firmasıdır. Bu site, Zolarr'ın kurumsal kimliğini tanıtan, ürünlerini satışa sunan, AI asistan üzerinden müşteri sorularını yanıtlayan, projelerini sergileyen, teklif toplayan ve admin paneli üzerinden tedarikçi fiyat/stok bilgileriyle otomatik senkronize olan kapsamlı bir dijital platform olacaktır.

### 1.1 Birincil Hedefler

1. Ziyaretçileri **lead'e** (teklif talebi) dönüştürmek
2. AI asistan ile **kullanıcı sorularını anında** cevaplamak ve kabataslak fiyat tahmini sunmak
3. Ürün satışlarını "Talep Oluştur" mekanizmasıyla başlatmak
4. Şirketin **güvenilirlik** algısını maksimize etmek (sertifikalar, projeler, yorumlar)
5. Bayi/yüklenici başvurularını sistematik olarak toplamak
6. Admin paneli üzerinden **tedarikçi fiyat/stok bilgilerini otomatik senkronize** etmek (manuel iş yükü minimum)
7. Tüm içeriği şirketin kendi yönetebilmesi (sınırsız admin yetkisi)

### 1.2 Hedef Kitle

| Segment | Açıklama |
|---------|----------|
| **Konut** | Ev sahipleri, müstakil ev veya çatı sahipleri |
| **Ticari** | İşyeri, fabrika, mağaza sahipleri |
| **Tarımsal** | Çiftlik, sera, tarımsal sulama |
| **Bayi/Yüklenici** | Zolarr ile çalışmak isteyen firmalar |

### 1.3 Karar Verilen Kapsam

✅ Full-stack (frontend + backend + admin paneli)
✅ Sadece Türkçe (ileride İngilizce eklenebilir)
✅ Ödeme entegrasyonu **YOK** — sepet "Talep Oluştur" akışıyla çalışır
✅ Dark mode varsayılan + Light mode (geçişlerde görünürlük problemi YOK)
✅ Mobile-first responsive
✅ KVKK uyumlu
✅ AI asistan (Anthropic Claude API) — sesli okuma destekli
✅ Tedarikçi fiyat/stok senkronizasyonu (admin URL eklediğinde otomatik)
✅ Push notification (web push) — "stokta yoksa haber ver" özelliği için
✅ Cyber Lime + Glassmorphism görsel kimlik
✅ Mouse takip imleç efekti + tıklama animasyonları
✅ Admin paneli — gizli (sadece doğru e-posta ile erişim)

### 1.4 Kapsam Dışı (YAGNI)

❌ Çoklu dil (sadece TR)
❌ Online ödeme (iyzico/PayTR sonradan eklenebilir)
❌ Mobil uygulama (sadece responsive web)
❌ Canlı destek (chat) — yerine AI asistan + WhatsApp + iletişim formu
❌ Blog modülü (galeri var, ileride eklenebilir)

---

## 2. Aşamalı Geliştirme Yaklaşımı

Doküman gereksinimi: **"aşamalara ayırarak adım adım oluşturacağız"**

### 2.1 Ana Aşamalar (10 Faz)

| Faz | Aşama | Süre | Kritik Çıktı |
|-----|-------|------|--------------|
| **Faz 0** | Setup ve altyapı | 0.5 gün | Next.js init, Supabase, Drizzle, design tokens |
| **Faz 1** | Tasarım sistemi + Layout | 1 gün | Header, Footer, glassmorphism, cursor efekti, tema toggle |
| **Faz 2** | Anasayfa | 1.5 gün | Hero banner, ürün/kampanya yatay slider, ürün kartları, tüm anasayfa bölümleri |
| **Faz 3** | E-Mağaza + Ürün Detay | 1.5 gün | Ürün listesi, kategori/filtre, ürün detay (slider, PDF, video, etiketler), sepet, talep oluştur |
| **Faz 4** | Teklif Al/Ver | 1 gün | Detaylı teklif wizard, bayi başvurusu, otomatik admin/email yönlendirme |
| **Faz 5** | AI Asistan | 1 gün | Floating panel, sohbet, TTS, markdown render, RAG (admin'in eklediği dokümanlar) |
| **Faz 6** | Galeri + Hakkımızda + İletişim + Ayarlar + SSS | 1 gün | Galeri/proje detay, hakkımızda, iletişim + Google Maps, ayarlar paneli, SSS |
| **Faz 7** | Auth & Hesap (admin gizli) | 1 gün | Email/şifre giriş, profil, sipariş/teklif takibi, admin gizli erişim mantığı |
| **Faz 8** | Admin Paneli | 2 gün | Dashboard + analytics, ürün/kategori/proje/SSS CRUD, sipariş/teklif yönetimi, bildirim merkezi, AI bilgi yönetimi, kullanıcı/moderatör yönetimi, tedarikçi senkronizasyon arayüzü |
| **Faz 9** | Tedarikçi Senkronizasyonu | 1 gün | URL'den fiyat/stok scraping, cron job, % marj uygulama, otomatik bildirim üretimi |
| **Faz 10** | KVKK + Polish + QA | 1 gün | Yasal sayfalar, çerez consent, performans, accessibility, tema geçiş QA |

**Toplam tahmini süre:** ~12-13 gün

### 2.2 Faz Bitiş Kriterleri

Her faz sonunda doğrulanacak:
- [ ] Tüm butonlar çalışıyor
- [ ] Buton, ikon ve yazılar iç içe girmiyor / taşmıyor
- [ ] Dark/Light geçişlerinde hiçbir öğe görünmez olmuyor
- [ ] Mobile'da (320px, 768px) düzgün
- [ ] Keyboard navigasyonu çalışıyor
- [ ] Hata durumları (boş listeler, network hata) kapsanmış

---

## 3. Teknoloji Yığını

### 3.1 Frontend

| Bileşen | Versiyon | Görev |
|---------|----------|-------|
| **Next.js** | 15.x (App Router) | Sayfa altyapısı, SSR, SEO |
| **TypeScript** | 5.x | Tip güvenliği |
| **Tailwind CSS** | 4.x | Utility-first CSS, design tokens |
| **shadcn/ui** | en güncel | UI bileşen kütüphanesi (Radix UI tabanlı) |
| **Framer Motion** | 11.x | Animasyonlar, sayfa geçişleri, scroll-triggered |
| **next-themes** | 0.3.x | Dark/Light mode yönetimi |
| **Lucide React** | en güncel | İkon seti |
| **React Hook Form** | 7.x | Form yönetimi |
| **Zod** | 3.x | Şema doğrulama |
| **Embla Carousel** | 8.x | Slider/carousel (ürün galeri, kampanyalar) |
| **TanStack Query** | 5.x | Server state yönetimi |
| **React Markdown** + **remark-gfm** + **rehype-raw** | en güncel | AI yanıtlarını düzgün render etmek (`***kalın***` çalışacak) |
| **Recharts** | 2.x | Admin analytics grafikleri |
| **react-pdf-viewer** | en güncel | Ürün PDF'lerini sitede görüntüleme |
| **zustand** | 4.x | Cart, AI chat state, cursor state |

### 3.2 Backend

| Bileşen | Görev |
|---------|-------|
| **Next.js Server Actions / API Routes** | İş mantığı, veri okuma/yazma |
| **Supabase (PostgreSQL)** | Veritabanı |
| **Supabase Auth** | Kullanıcı kimlik doğrulama (email + Google OAuth) |
| **Supabase Storage** | Görsel/PDF/video yükleme |
| **Supabase Realtime** | Admin paneline canlı bildirim akışı |
| **Drizzle ORM** | TypeScript-güvenli veritabanı sorguları |
| **Resend** | Transactional e-posta (sipariş, teklif, şifre sıfırlama, admin bildirim) |
| **Anthropic SDK** (`@anthropic-ai/sdk`) | AI asistan — Claude Haiku 4.5 (hızlı + ucuz, prompt cache aktif) |
| **Cheerio** + **node-cron** + **Vercel Cron Jobs** | Tedarikçi sayfa fetch + parse + zamanlanmış güncelleme |
| **web-push** (VAPID) | Browser push notification — "stokta gelince haber ver" |

### 3.3 AI Asistan Detay (Anthropic Claude)

- **Model:** `claude-haiku-4-5-20251001` — hızlı, ucuz, Türkçesi iyi
- **Sistem prompt'u:** Zolarr şirket bilgileri, ürün bilgileri, fiyat aralıkları, teknik bilgiler — RAG ile genişletilebilir
- **Prompt caching:** AKTİF (sistem prompt'u + ürün katalogu cache'lenir, %90 maliyet düşüşü)
- **Tool use:** AI'ın ürün arama, fiyat hesaplama gibi araçları çağırma yetkisi
- **Streaming:** AKTİF (kullanıcı yanıtı kelime kelime görür)
- **Maliyet sınırı:** Kullanıcı başına günde max 50 mesaj (rate limiting)

### 3.4 Hosting ve DevOps

- **Vercel** — frontend + serverless backend (Cron Jobs Pro plan ile aylık birkaç USD'ye)
- **Supabase Cloud** — veritabanı + storage (ücretsiz tier başlangıç)
- **GitHub** — kaynak kod yönetimi
- **Vercel Analytics** — temel sayfa görüntüleme metrikleri
- **Anthropic API** — kullandıkça öde (Haiku 4.5 ile aylık birkaç USD'ye sınırlı kullanım)

---

## 4. Tasarım Sistemi — Cyber Lime + Glassmorphism

### 4.1 Görsel Felsefe

**Cyber Lime** — vurgu rengi olarak parlak yeşil-lime (sağladığınız `#5DD62C`) neon glow ile kullanılır
**Glassmorphism** — kartlar, modal'lar, header üzerinde **blur + yarı saydam arka plan** efekti:
- `backdrop-filter: blur(16px)`
- Arka plan: `rgba(15, 15, 15, 0.6)` dark mode, `rgba(255, 255, 255, 0.6)` light mode
- İnce kenarlık: `1px solid rgba(255, 255, 255, 0.1)`
- Hafif iç parıltı: `inset 0 1px 0 rgba(255, 255, 255, 0.05)`

### 4.2 Renk Paleti (Design Tokens)

**Dark Mode (varsayılan):**
```
bg-base       → #0F0F0F   (sayfa arka planı)
bg-elevated   → #202020   (kartlar)
bg-glass      → rgba(20, 20, 20, 0.6)  (cam efektli yüzeyler)
bg-overlay    → #2A2A2A
border        → #2F2F2F
border-glass  → rgba(255, 255, 255, 0.1)
text-primary  → #F8F8F8
text-muted    → #A0A0A0
brand         → #5DD62C   (Cyber Lime)
brand-dark    → #337418
brand-glow    → rgba(93, 214, 44, 0.40)
brand-neon    → #B6F36C   (highlight, focus ring)
success       → #5DD62C
warning       → #F4B400
danger        → #E94B4B
info          → #4B9BE9
```

**Light Mode:**
```
bg-base       → #F8F8F8
bg-elevated   → #FFFFFF
bg-glass      → rgba(255, 255, 255, 0.7)
bg-overlay    → #F0F0F0
border        → #E5E5E5
border-glass  → rgba(0, 0, 0, 0.08)
text-primary  → #0F0F0F
text-muted    → #555555
brand         → #2D6912   (light'ta okunaklı koyu yeşil)
brand-dark    → #5DD62C
brand-glow    → rgba(45, 105, 18, 0.25)
```

**Tema geçişi garantisi (kritik):**
- Tüm bileşenler `text-primary` / `bg-base` gibi semantik token'ları kullanır
- Hardcoded `text-white` veya `bg-black` YOK
- Geçiş animasyonu: 200ms — kullanıcı flicker görmesin
- Her PR/commit öncesi: hem dark hem light'ta gözle test
- Sticky button, badge gibi öğelerde kontrast oranı ≥ 4.5:1 (WCAG AA)

### 4.3 Tipografi

| Kullanım | Font | Ağırlık |
|----------|------|---------|
| Başlıklar (H1–H3) | **Space Grotesk** | 700, 600 (Semibold) |
| Alt başlıklar (H4–H6) | Space Grotesk | 500 |
| Gövde metni | **Inter** | 400, 500 |
| Sayılar, fiyat, kapasite (kWp) | **JetBrains Mono** | 500 |
| AI yanıt metni | Inter | 400 |

**Türkçe karakter desteği:** Tüm fontlar Latin Extended desteği var (ç, ğ, ı, ö, ş, ü). `next/font` ile self-hosted.

### 4.4 Buton Sistemi (Referans Görsele Bağlı)

Verilen ikon referansındaki yumuşak köşeli kare (squircle) DNA'sı tüm sitede kullanılacak:

| Buton tipi | Stil |
|------------|------|
| **Primary** | `bg-brand text-bg-base rounded-2xl px-6 py-3 hover:bg-brand-dark hover:shadow-glow active:scale-95 transition` |
| **Secondary (glass)** | `backdrop-blur-md bg-bg-glass text-brand border border-border-glass rounded-2xl hover:border-brand` |
| **Icon (squircle)** | `w-12 h-12 rounded-2xl bg-bg-elevated flex items-center justify-center hover:bg-bg-overlay` |
| **Tab (aktif)** | `bg-brand text-bg-base rounded-xl` |
| **Ghost** | `text-text-primary hover:bg-bg-overlay rounded-xl` |
| **Destructive** | `bg-danger text-white rounded-2xl` |

**Border radius:** `rounded-2xl` (16px)
**Shadow glow:** Primary butonlar hover'da: `box-shadow: 0 0 24px rgba(93,214,44,0.4)`
**Tıklama animasyonu:** `active:scale-95` + hafif ripple (Framer Motion ile)

### 4.5 Kart Sistemi (Glassmorphism)

```css
.card-glass {
  backdrop-filter: blur(16px);
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 300ms ease;
}
.card-glass:hover {
  border-color: rgba(93, 214, 44, 0.3);
  box-shadow: 0 8px 32px rgba(93, 214, 44, 0.15);
  transform: translateY(-2px);
}
```

### 4.6 Mouse İmleç Efekti

- Default cursor gizlenir (`cursor: none`)
- Custom cursor:
  - **Outer ring:** 32px, `border: 2px solid #5DD62C`, mouse'u 50ms gecikmeyle takip eder (lerp animasyonu)
  - **Inner dot:** 6px, `bg-brand`, mouse pozisyonunda anlık
  - **Hover (clickable üstünde):** Outer ring 56px'e büyür, dot solar
- **Tıklama animasyonu:**
  - Tıklandığı yerde 80px yeşil dalga efekti (1 saniyelik fade out)
  - Outer ring kısa süreliğine `scale: 0.7`
- **Mobile:** Bu efekt kapalı (touch device'larda anlamsız)
- Performans: `transform: translate3d` ile GPU üzerinde

### 4.7 Animasyon Prensipleri

- **Sayfa geçişi:** Fade + 8px aşağıdan yukarı slide (Framer Motion `AnimatePresence`)
- **Scroll-triggered:** Bölümler ekrana girdikçe `opacity 0 → 1` ve `y: 20 → 0`
- **Yatay slider:** Ürün/kampanya kartları smooth-scroll, mobile'da swipe + drag
- **Hover:** Kartlar `scale-[1.02]` + border glow
- **Loading:** Shimmer (skeleton) — yeşil pulse
- **AI mesaj animasyonu:** Yazma efekti (typewriter)
- **prefers-reduced-motion:** Animasyonlar otomatik kapatılır

### 4.8 Logo Kullanımı

- Header sol üstte: 32px logo + "Zolarr" yazısı (Space Grotesk Bold)
- Hero arkasında: 600px logo, `opacity: 0.04`, dekoratif watermark
- Footer: 40px logo + slogan
- Logo SVG'ye dönüştürülerek `currentColor` ile dinamik renk geçişi sağlanır

---

## 5. Site Mimarisi

### 5.1 Sayfa Listesi

#### Ana Akış (Header'da Görünür)
| # | Yol | Sayfa |
|---|-----|-------|
| 1 | `/` | Anasayfa |
| 2 | `/magaza` | E-Mağaza (kategori + filtre) |
| 3 | `/magaza/kategori/[slug]` | Kategori sayfası |
| 4 | `/magaza/[slug]` | Ürün detay |
| 5 | `/sepet` | Sepet |
| 6 | `/talep-olustur` | Talep oluştur (4 adım) |
| 7 | `/teklif` | Teklif Al/Ver (sekmeli landing) |
| 8 | `/teklif/al` | Detaylı Teklif Al sihirbazı |
| 9 | `/teklif/ver` | Bayi başvurusu |
| 10 | `/galeri` | Galeri & Projeler |
| 11 | `/galeri/[slug]` | Proje detay |
| 12 | `/hakkimizda` | Hakkımızda |

#### Kullanıcı Hesabı + Auth
| # | Yol | Sayfa |
|---|-----|-------|
| 13 | `/giris` | Giriş |
| 14 | `/kayit` | Kayıt |
| 15 | `/sifremi-unuttum` | Şifre sıfırlama talebi |
| 16 | `/sifre-yenile` | Şifre yenileme |
| 17 | `/hesap` | Profil |
| 18 | `/hesap/siparisler` | Sipariş geçmişi |
| 19 | `/hesap/teklifler` | Teklif takibi |
| 20 | `/hesap/favoriler` | Favoriler |
| 21 | `/hesap/bildirimler` | Stok haber ver / push abonelikler |
| 22 | `/siparis-takibi/[id]` | Public sipariş takibi |

#### Bilgi ve Yasal
| # | Yol | Sayfa |
|---|-----|-------|
| 23 | `/iletisim` | İletişim + Google Maps |
| 24 | `/sss` | Sıkça Sorulan Sorular |
| 25 | `/ayarlar` | Ayarlar paneli |
| 26 | `/kvkk` | KVKK Aydınlatma Metni |
| 27 | `/gizlilik` | Gizlilik Politikası |
| 28 | `/cerez-politikasi` | Çerez Politikası |
| 29 | `/mesafeli-satis` | Mesafeli Satış Sözleşmesi |
| - | `/404` | Hata sayfası |

#### Admin Panel (Gizli)
**Erişim mantığı:** Belirli e-posta adresleriyle giriş yapan kullanıcılarda otomatik açılır. Header'da admin için ekstra "Admin" butonu görünür. URL: `/admin/...`. Diğer kullanıcılar URL'i bilse bile 404 görür.

| Yol | Sayfa |
|-----|-------|
| `/admin` | Dashboard (analytics + bildirim merkezi) |
| `/admin/urunler` | Ürün CRUD |
| `/admin/urunler/yeni` | Ürün ekleme (uzun form) |
| `/admin/urunler/[id]` | Ürün düzenleme |
| `/admin/kategoriler` | Kategori CRUD |
| `/admin/kampanyalar` | Kampanya yönetimi |
| `/admin/projeler` | Proje CRUD |
| `/admin/siparisler` | Sipariş yönetimi |
| `/admin/teklifler` | Teklif talepleri (detay + hesaplama aracı) |
| `/admin/bayiler` | Bayi başvuruları |
| `/admin/sss` | SSS yönetimi |
| `/admin/yorumlar` | Müşteri yorumları |
| `/admin/iletisim` | İletişim mesajları |
| `/admin/kullanicilar` | Kullanıcı + moderatör yönetimi |
| `/admin/ai-bilgi` | AI asistan bilgi tabanı (RAG dokümanları, linkler, PDF'ler) |
| `/admin/tedarikci` | Tedarikçi senkronizasyon paneli |
| `/admin/raporlar` | Haftalık/aylık raporlar |
| `/admin/bildirimler` | Bildirim merkezi |
| `/admin/ayarlar` | Site ayarları (iletişim, sosyal medya, AI sistem prompt'u) |

### 5.2 Anasayfa Bölümleri (Sıralı, Detaylı)

```
┌─────────────────────────────────────────────────┐
│ 1. HERO BANNER                                  │
│   - Slogan + alt slogan + 2 CTA                 │
│   - Sağda: Hızlı tasarruf hesaplayıcı widget    │
│   - Arkada: Glassmorphism + animasyonlu güneş   │
│     parıltısı + logo watermark                  │
├─────────────────────────────────────────────────┤
│ 2. ÜRÜN TANITIMI + KAMPANYALAR (yatay slider)   │
│   - Yana doğru kaydırılabilir kartlar           │
│   - Her kart: görsel + başlık + buton           │
│   - Stokta varsa: "İncele/Satın Al" → ürün det. │
│   - Stokta yoksa: "Gelince Haber Ver" (push)    │
│   - Kampanya ise: "Kampanyaya Git" → kampanya   │
│     sayfası + sepet kuralı uygulanır            │
├─────────────────────────────────────────────────┤
│ 3. 3 YOL KARTI (Konut / İşyeri / Tarım)         │
│   - Glass kart, hover'da brand glow             │
│   - Her biri ilgili teklif akışına yönlendirir  │
├─────────────────────────────────────────────────┤
│ 4. NEDEN ZOLARR?                                │
│   - 6 fayda kartı (yumuşak kare ikon, lime)     │
│   - Kalite, hız, garanti, anahtar teslim,       │
│     finansman, 7/24 destek                      │
├─────────────────────────────────────────────────┤
│ 5. ÇALIŞMA SÜRECİ                               │
│   - 1.Keşif → 2.Teklif → 3.Kurulum → 4.İzleme  │
│   - Yatay timeline, scroll-triggered animasyon  │
├─────────────────────────────────────────────────┤
│ 6. STOKTAKİ ÜRÜNLER                             │
│   - Ürün kartları (5 görsel slider, ad, fiyat)  │
│   - Tıklayınca ürün detay sayfasına             │
│   - 8-12 kart grid                              │
├─────────────────────────────────────────────────┤
│ 7. TEKLİF AL ÖNİZLEMESİ                         │
│   - Slogan: "Bize söyleyin, biz sizin yerinize  │
│     hesaplayalım"                               │
│   - Slayt tarzı görseller (fade carousel)       │
│   - "Detaylı Teklif Al" CTA → /teklif/al        │
├─────────────────────────────────────────────────┤
│ 8. SON PROJELER (galeri önizleme)               │
│   - 6 proje kartı (lokasyon + kapasite)         │
│   - "Tüm Projeleri Gör" → /galeri               │
├─────────────────────────────────────────────────┤
│ 9. SAYILARLA ZOLARR                             │
│   - 4 sayaç animasyonu (CountUp)                │
│   - Kurulu MW, müşteri, proje, tasarruf         │
├─────────────────────────────────────────────────┤
│ 10. MÜŞTERİ YORUMLARI (carousel)                │
├─────────────────────────────────────────────────┤
│ 11. SSS ÖZETİ (5 soru accordion)                │
├─────────────────────────────────────────────────┤
│ 12. CTA BANDI + BÜLTEN KAYIT                    │
└─────────────────────────────────────────────────┘
```

**Not (doküman gereği):** Anasayfa **uzun ve profesyonel**. Akıcı scroll. Kasma/donma yok — bu için image lazy load, code split, virtualization (gerekirse).

### 5.3 Header Bileşeni

**Desktop:**
```
[Zolarr Logo]  [Anasayfa] [E-Mağaza] [Teklif Al/Ver] [Galeri] [Hakkımızda]   [🌙/☀️] [🔍] [👤] [🛒(2)]
```

**Davranışlar:**
- Sticky, glassmorphism (scroll'da blur arka plan)
- Mobile: Logo + sepet + hamburger
- Hamburger: Tam ekran sağdan kayan drawer

### 5.4 Footer Bileşeni

**4 sütun:** Logo+sosyal | Hızlı Linkler | Yasal | İletişim+Bülten

### 5.5 Sabit (Floating) Bileşenler

| Bileşen | Konum | Açıklama |
|---------|-------|----------|
| **AI Asistan** | Sağ altta, floating button + açılır panel | Glassmorphism, kapatma butonu erişilebilir |
| **WhatsApp** | Sağ altta (AI üstünde) | Sabit yeşil buton |
| **Mobil sticky CTA** | Alt bar (sadece mobile) | "Ücretsiz Teklif Al" |
| **Çerez bildirimi** | Alt çubuk (ilk girişte) | Kabul/Reddet/Ayarlar |
| **Push notification toast** | Sağ üst | Stokta gelen ürün bildirimleri |

---

## 6. E-Mağaza Detayları

### 6.1 Ürün Listesi Sayfası (`/magaza`)

**Sol panel (filtreler — accordion):**
- Kategori (radyo butonlu ağaç yapısı)
- Marka (multi-select)
- Fiyat aralığı (slider, min-max)
- Güç (kWp / Watt — slider)
- Akım (A — slider)
- Voltaj (V — slider)
- Stok durumu (sadece stokta olanlar)
- Etiketler (Kargo Bedava, Tercih Edilen, vb.)

**Üst bar:**
- Arama input
- Sıralama: Önerilen, Fiyat (artan/azalan), Yeni eklenen, En çok satan
- Görünüm: Grid / Liste
- Aktif filtre rozetleri (X ile kaldırılabilir)

**Ürün kartı:**
```
┌──────────────────────────┐
│ [GÖRSEL SLIDER (max 5)]  │  ← swipe + ok butonları
│  • • • • •                │
│ [Etiketler: KARGO BED.]  │
├──────────────────────────┤
│ Ürün Adı                 │
│ ⭐⭐⭐⭐⭐ (12 yorum)      │
│ ₺12.500 (₺15.000 üstü çizili) │
│ [Sepete Ekle] [İncele]   │
└──────────────────────────┘
```

### 6.2 Kategori Hiyerarşisi (Şablon)

- **Güneş Panelleri**
  - Monokristal
  - Polikristal
  - Bifacial
  - TOPCon N-Type
- **Bataryalar**
  - Jel
  - Lityum (LiFePO4)
  - AGM
- **İnvertörler**
  - Tam sinüs
  - Modifiye sinüs
  - On-grid
  - Hibrit
- **Aydınlatma**
  - Solar sokak lambası
  - Solar bahçe lambası
- **Hazır Paket Sistemler**
  - 6 kW sistem
  - 10 kW sistem
  - 50 kW sistem
  - 100 kW sistem
- **Aksesuarlar**
  - Şarj kontrol cihazları
  - Kablolar
  - Konektörler
  - Montaj kitleri

**NOT:** Kategori ataması ürün eklenirken admin tarafından yapılır.

### 6.3 Ürün Detay Sayfası (`/magaza/[slug]`)

**Üst bölüm:**
```
┌────────────────────────┬──────────────────────────┐
│                        │ [Etiketler: KARGO BEDAVA]│
│                        │                          │
│   GÖRSEL/VIDEO SLIDER  │ Ürün Adı                 │
│   (max 5 görsel +      │ Marka • Model            │
│    1 video)            │ ⭐⭐⭐⭐⭐ (12 yorum)      │
│                        │                          │
│   • • • • •            │ ₺12.500                  │
│                        │ ₺15.000 (üstü çizili)    │
│   [< Önceki] [Sonraki >] │ %16 indirim              │
│                        │                          │
│                        │ Stok: ✅ 24 adet hazır   │
│                        │                          │
│                        │ [- 1 +] adet             │
│                        │ [Sepete Ekle (büyük)]    │
│                        │ [Hemen Al / Talep Oluştur]│
│                        │                          │
│                        │ ❤️ Favori | 📤 Paylaş    │
└────────────────────────┴──────────────────────────┘
```

**Stok yoksa:**
- "Sepete Ekle" yerine: **"Gelince Haber Ver"** butonu (yeşil, prominent)
- Tıklayınca: push notification izni istenir + e-posta input
- Kayıt olur → ürün stoğa girince otomatik bildirim gönderilir

**Alt bölüm (sekmeler):**
- **Açıklama** — kısa açıklama
- **Detaylı Açıklama** — markdown destekli, görsel/video gömülebilir
- **Teknik Özellikler** — tablo (güç, akım, voltaj, boyut, ağırlık, garanti süresi vb.)
- **PDF Dokümanlar** — react-pdf-viewer ile sitede önizleme + indirme butonu
- **Yorumlar** — kullanıcı yorumları + yıldız
- **Soru-Cevap** — kullanıcılar soru sorabilir, admin/moderatör cevaplar
- **İlgili Ürünler** — aynı kategoriden 4-6 ürün carousel

### 6.4 Ürün Etiketleri

Admin ürün eklerken/düzenlerken seçer:
- 🚚 **Kargo Bedava**
- 🏆 **Tercih Edilen**
- ⭐ **Yeni**
- 🔥 **Çok Satan**
- 💎 **Premium**
- 📅 **{X} Yıl Garantili** (sayı admin tarafından girilir)
- 🎁 **Kampanyada**

Etiketler kart üstünde küçük badge olarak görünür (glassmorphism + brand color).

### 6.5 Sepet (`/sepet`)

```
[Ürün Görseli] [Ürün Adı]                    [Adet -1+] [Toplam]  [🗑]
[Ürün Görseli] [Ürün Adı (Kampanyada)]        [Adet -1+] [Toplam]  [🗑]
                                              ─────────────
                                              Ara toplam: ₺X
                                              Kampanya indirimi: -₺Y
                                              Kargo: Ücretsiz
                                              ═════════════
                                              Toplam: ₺Z

[Alışverişe Devam Et]                        [Talep Oluştur →]
```

**Kampanya kuralları motoru (otomatik):**
- "4 alana 5.si %70 indirim" → sepete 5 panel eklendiğinde 5.si otomatik %70 indirimli
- "X alana Y bedava" → sepete X eklendiğinde Y otomatik eklenir, fiyatı 0
- "Yüzdeli kategori indirimi" → seçili kategori ürünlerine x% indirim

### 6.6 Kampanya Yönetimi

Admin paneli üzerinden oluşturulur. Şema:
- Kampanya adı (örn. "Bahar Kampanyası")
- Banner görseli
- Açıklama
- Kural tipi:
  - `BUY_X_GET_Y_DISCOUNT` (X adet alana Y. ürün %Z indirim)
  - `BUY_X_GET_Y_FREE` (X adet alana Y adet bedava)
  - `CATEGORY_PERCENTAGE` (kategori ürünlerine % indirim)
  - `CART_THRESHOLD` (sepet tutarı X üstünde Y indirim)
- Kapsam: Tüm ürünler / Belirli ürünler / Belirli kategori
- Başlangıç-bitiş tarihi
- Aktif/pasif

---

## 7. Teklif Sistemi (Detaylı)

### 7.1 Teklif Al Sihirbazı (`/teklif/al`)

Doküman gereği detaylı akış:

```
[Adım 1] Hoş geldin + slogan
  "Bize söyleyin, biz sizin yerinize hesaplayalım."
  Slayt görseller (3-4 slayt fade ile döner)
  [Devam Et]

[Adım 2] Kişisel bilgi
  İsim* | Soyisim*
  İl* (81 il dropdown) | İlçe* (dinamik)

[Adım 3] Kurulum yeri
  ◯ Çatı (eğimli/düz alt seçim)
  ◯ Arazi
  ◯ Carport (otopark üzeri)
  ◯ Cephe
  Yer açıklaması (opsiyonel textarea)

[Adım 4] Çalıştırılacak ürünler
  + Ürün ekle butonu (modal açılır):
    - Ürün adı (örn. Buzdolabı)
    - Elektrik tüketimi (kWh/ay) — opsiyonel
    - Güç (W) — opsiyonel
    - Voltaj (V) — opsiyonel
  Eklenen ürünler liste halinde gösterilir, silinebilir
  
[Adım 5] Detaylı açıklama
  Textarea, max 2000 karakter
  Karakter sayacı altında

[Adım 6] İletişim bilgileri
  Telefon* | E-posta*
  Tercih edilen iletişim saati (dropdown)
  ☑ KVKK aydınlatma metnini okudum

[Adım 7] ✅ Tik animasyonu + onay
  "Teklifiniz başarıyla gönderildi!"
  Teklif numarası: ZQT-2026-XXXXX
  "Uzmanımız 24 saat içinde size dönüş yapacak."
  [Anasayfaya Dön] [Geri]
```

**Adım göstergesi (tüm adımlarda üstte):**
```
●━━━━●━━━━●━━━━○━━━━○━━━━○━━━━○
1    2    3    4    5    6    7
```

**Davranışlar:**
- Geri butonu her adımda var (form state korunur — zustand)
- Form yarıda kapatılırsa: localStorage'a save, geri dönüldüğünde "Kaldığınız yerden devam etmek ister misiniz?"
- Tik animasyonu: Lottie veya SVG path animasyonu (yeşil tik, glow)

**Otomatik aksiyonlar (gönderim sonrası):**
1. `quotes` tablosuna kaydet
2. Admin'e Resend ile e-posta gönder
3. Admin paneli bildirim merkezine push (Supabase Realtime)
4. Müşteriye onay e-postası

### 7.2 Teklif Ver (Bayi Başvurusu) (`/teklif/ver`)

Sekmeli form (önceki spec'tekiyle aynı):
- Firma bilgisi → Yetkili → Hizmet → Belgeler → Onay

### 7.3 Talep Oluştur Akışı (Sepetten)

4 adım: Adres → Kurulum talebi → Notlar → Onay (önceki spec'tekiyle aynı, sipariş numarası `ZLR-2026-XXXXX`)

---

## 8. Yapay Zeka Asistanı (Detaylı)

### 8.1 Genel Davranış

- Sağ alt köşede floating button (AI ikon, glassmorphism)
- Tıklayınca: 380px x 600px panel açılır (mobile: tam ekran)
- Üstte: "Zolarr AI Asistan" + kapat butonu (büyük, erişilebilir)
- Açılır panel daha az yer kaplar, kapatma kolay

### 8.2 Yetenekler

1. **Genel sorulara cevap** — şirket, ürünler, kurulum, garanti vb.
2. **Sistem boyutu hesaplama** — kullanıcı faturasını/cihazlarını söyler, AI önerir
3. **Kabataslak fiyat tahmini** — admin'in eklediği fiyat aralıklarına göre
4. **Ürün önerisi** — ihtiyaca göre uygun ürünleri linkler
5. **Teknik bilgi** — admin'in yüklediği PDF/dokümanlardan RAG ile cevap
6. **Yönlendirme** — "Detaylı teklif için /teklif/al sayfasına yönlendireyim mi?"

### 8.3 Yanıt Kalitesi (Doküman Gereği)

- Markdown render: `***kalın***`, `*italik*`, `# başlık`, `- liste` doğru çalışır (React Markdown + remark-gfm)
- Emoji destekli ama abartısız (örn. "🔆 Güneş paneliniz için..." OK)
- Düzgün formatlı: paragraf, başlık, liste yapısı
- Yanıt uzunluğu: gereksiz uzun değil — özet + detay yapısı

### 8.4 Sesli Okuma (TTS)

Her AI yanıtının altında:
- 🔊 **Sesli oku** butonu
- Tıklanınca metin Web Speech API (`speechSynthesis`) ile okunur
- Ses: `lang: 'tr-TR'`, kullanılabilir Türkçe ses
- Çalarken buton ⏸️ **Duraklat** olur
- Duraklat'a basılınca ⏯️ **Devam Et** olur
- ⏹️ **Durdur** butonu da var
- **Emojiler okunmaz** — text temizlemesi yapılır:
  - Emoji regex ile çıkartılır
  - Markdown sembolleri (`*`, `**`, `#`, `-`) kaldırılır
  - URL'ler "link" olarak okunur veya atlanır

### 8.5 Bilgi Tabanı (RAG) — Admin Tarafından Yönetilir

Admin paneli `/admin/ai-bilgi` sayfasından:
- **Doküman ekle:** PDF yükle (içerik chunk'lara ayrılır)
- **Link ekle:** URL → içerik fetch + parse
- **Manuel metin ekle:** Editör ile direkt bilgi gir
- **Sistem prompt'u düzenle:** AI'a verilen ana yönerge
- **Eski verileri kaldır:** Listeden seç, sil

**Teknik:**
- Doküman → embedding (Voyage AI veya OpenAI embeddings) → Supabase pgvector
- Sorgu geldiğinde: en yakın 3-5 chunk getir, prompt'a inject et
- Anthropic Claude'a prompt cache aktif

### 8.6 Sınırlandırma

- Anonim kullanıcı: günde 10 mesaj
- Kayıtlı kullanıcı: günde 50 mesaj
- Rate limit aşılınca: kibarca uyar + giriş/kayıt önerisi

---

## 9. Galeri & Projeler

### 9.1 Galeri Sayfası (`/galeri`)

- Üstte filtre butonları: Tümü / Konut / Ticari / Sanayi / Tarımsal
- Grid (3 kolon desktop, 1 kolon mobile)
- Her kart: büyük görsel + lokasyon + kapasite + tıklayınca detay

### 9.2 Proje Detay (`/galeri/[slug]`)

```
┌─────────────────────────────┐
│  ÖNCE / SONRA SLIDER        │  ← swipe karşılaştırma
└─────────────────────────────┘
Proje Başlığı | Lokasyon | Kapasite (kWp) | Tarih
─────────────────────────────────
Açıklama (markdown)
─────────────────────────────────
[Görsel galerisi (lightbox)]
─────────────────────────────────
Kullanılan Ürünler (mağazadan ilgili linkler)
─────────────────────────────────
Müşteri görüşü (varsa)
─────────────────────────────────
Yıllık tasarruf rakamı (varsa)
─────────────────────────────────
[Benzer Projeler] | [Teklif Al CTA]
```

---

## 10. Hakkımızda

- Şirket hikayesi (uzun metin, görsellerle)
- Vizyon, misyon, değerler
- Ekip (foto + isim + ünvan + bio)
- Sertifikalar (ikon grid)
- Sayılarla başarımız (CountUp)
- Çalıştığımız markalar (logo grid)
- "Bize Katılın" CTA

---

## 11. Ayarlar (`/ayarlar`)

Doküman gereği detaylı ayarlar paneli:

### 11.1 Bölümler

1. **Hesap Bilgileri**
   - Giriş yapılmış e-posta (read-only)
   - Ad/Soyad değiştir
   - Telefon değiştir
   - Şifre değiştir

2. **Tema**
   - Karanlık / Aydınlık / Sistem ile uyumlu
   - Önizleme

3. **Bildirimler**
   - E-posta bildirimleri (✓ kampanyalar / ✓ siparişler / ✓ yorumlar)
   - Push bildirimleri (✓ stok gelince haber ver / ✓ kampanyalar)

4. **Çerez Politikaları**
   - Zorunlu (kapatılamaz)
   - Analitik (toggle)
   - Pazarlama (toggle)
   - "Tercihlerimi Kaydet"

5. **Sosyal Medya Adreslerimiz** (read-only, şirket bilgisi)
   - Instagram, LinkedIn, X, YouTube, TikTok, Facebook
   - Her biri ikonu + tıklanabilir link

6. **İletişim Bilgilerimiz** (read-only)
   - Adres + Google Maps embed (mini)
   - Telefon
   - E-posta
   - WhatsApp

7. **KVKK ve Yasal**
   - KVKK metni link
   - Gizlilik link
   - Mesafeli satış link
   - Verilerimi indir (KVKK)
   - Hesabımı sil (KVKK)

---

## 12. Admin Paneli (Detaylı)

### 12.1 Erişim Mantığı (Gizli)

- Admin e-postaları `users.role = 'admin'` ile işaretli
- Bu kullanıcı normal `/giris`'ten giriş yapar
- Giriş sonrası header'a "🛡️ Admin" butonu eklenir
- `/admin` URL'i normal kullanıcılarda 404 döner
- İlk admin: env değişkeniyle bootstrap edilir (`SEED_ADMIN_EMAIL`)
- Sonraki admin'leri mevcut admin ekler

### 12.2 Dashboard (`/admin`)

```
┌─────────────────────────────────────┐
│ HOŞGELDİN, [Admin Adı]              │
├─────────────────────────────────────┤
│ ┌─KPI─┐ ┌─KPI─┐ ┌─KPI─┐ ┌─KPI─┐  │
│ │ 12  │ │ 5   │ │ 47  │ │ 3   │  │
│ │Bek. │ │Yeni │ │Üye  │ │Oto. │  │
│ │teklif││sip. │ │     │ │bild.│  │
│ └─────┘ └─────┘ └─────┘ └─────┘  │
├─────────────────────────────────────┤
│ HAFTALIK SATIŞ GRAFİĞİ (Recharts)   │
├─────────────────────────────────────┤
│ EN ÇOK İLGİ GÖREN ÜRÜNLER (top 5)   │
├─────────────────────────────────────┤
│ SON BİLDİRİMLER (canlı feed)        │
└─────────────────────────────────────┘
```

### 12.3 Bildirim Merkezi

**İki bildirim türü (doküman gereği):**

**1. Gelen Teklifler:**
- Üstte rozet sayacı (header'da admin butonunda)
- Tıklanınca panel açılır, listede:
  ```
  🔔 [Yeni] Mehmet Y. — Konut, Ankara — 5kW sistem
     Geliş: 2 saat önce        [Görüntüle]
  ```
- Tıklayınca: tam ekran modal — tüm detay + müşteri bilgileri + admin'in:
  - Hesaplama yapma aracı (kullanıcı bilgilerine göre tahmini sistem)
  - Müşteriye e-posta gönder
  - WhatsApp linki (`https://wa.me/{phone}`)
  - "Dönüş yapıldı" etiketi
  - Sil

**2. Otomatik Bildirimler (Sistem):**
- Tedarikçi fiyat değişti
- Tedarikçi stok 0'a düştü
- Tedarikçi ürün kaldırdı
- Liste:
  ```
  📈 Ürün X fiyatı %12 arttı  → [İncele]
  📉 Ürün Y fiyatı %5 düştü   → [İncele]
  📦 Ürün Z stoktan kaldırıldı → [İncele]
  ```
- "İncele" tıklanınca ilgili ürün düzenleme sayfasına gider, üstte değişim banner'ı

### 12.4 Ürün Yönetimi (`/admin/urunler`)

**Liste sayfası:** Tablo, arama, filtre (kategori, stok), sıralama. Her satırda: görsel, ad, kategori, fiyat, stok, durum (aktif/pasif), işlemler (düzenle/sil).

**Ürün Ekleme/Düzenleme Formu:**

```
┌─ TEMEL BİLGİLER ────────────────────┐
│ Ürün adı*                           │
│ Slug (URL — otomatik üretilir)      │
│ Kategori* (dropdown)                │
│ Marka                               │
│ SKU (stok kodu)                     │
└─────────────────────────────────────┘

┌─ AÇIKLAMA ──────────────────────────┐
│ Kısa açıklama (max 200 char)        │
│ Detaylı açıklama (markdown editör)  │
└─────────────────────────────────────┘

┌─ MEDYA ─────────────────────────────┐
│ [+ Görsel ekle] (5 görsele kadar)   │
│ [+ Video ekle] (1 video, opsiyonel) │
│ [+ PDF ekle] (teknik dokümanlar)    │
└─────────────────────────────────────┘

┌─ TEKNİK ÖZELLİKLER ─────────────────┐
│ + Yeni özellik ekle                 │
│ Anahtar (örn. Güç) | Değer (450W)   │
│ Tablo halinde gösterilecek          │
└─────────────────────────────────────┘

┌─ FİYAT VE STOK ─────────────────────┐
│ Fiyat (TL)*                         │
│ İndirimli fiyat (opsiyonel)         │
│ Stok adedi*                         │
│ Stok takibini durdur ☐               │
└─────────────────────────────────────┘

┌─ TEDARİKÇİ ENTEGRASYONU ────────────┐
│ ☐ Tedarikçi sayfasına bağla         │
│ Tedarikçi URL*                      │
│ Kar marjı (%)*                      │
│ Senkronizasyon sıklığı:             │
│   ◯ Saatlik ◯ Günlük ◯ Haftalık     │
│ [Şimdi Senkronize Et] (test)        │
│ Son senkronizasyon: 2 saat önce ✓   │
└─────────────────────────────────────┘

┌─ ETİKETLER ─────────────────────────┐
│ ☐ Kargo Bedava                       │
│ ☐ Tercih Edilen                      │
│ ☐ Yeni                               │
│ ☐ Çok Satan                          │
│ ☐ Premium                            │
│ ☐ Garantili — [____] yıl             │
└─────────────────────────────────────┘

┌─ KAMPANYA ──────────────────────────┐
│ Aktif kampanyalar (multi-select)    │
└─────────────────────────────────────┘

┌─ SEO ───────────────────────────────┐
│ Meta title                          │
│ Meta description                    │
│ Anahtar kelimeler                   │
└─────────────────────────────────────┘

[İptal]                    [Kaydet ✓]
```

### 12.5 Diğer Admin Sayfaları

- **Kategoriler:** Hiyerarşik CRUD (parent kategori desteği)
- **Kampanyalar:** Kural tipi seçimli kampanya oluşturma
- **Projeler:** Proje galerisi CRUD (öncesi/sonrası, ürün ilişkilendirme)
- **Siparişler:** Liste + detay + durum güncelleme + müşteriye e-posta
- **Teklifler:** Liste + detay + hesaplama aracı + dönüş işaretleme
- **Bayiler:** Başvuru listesi + onay/red
- **SSS:** Kategori bazlı CRUD
- **Yorumlar:** Bekleyen / onaylanmış / reddedilmiş
- **İletişim:** Mesaj listesi + cevap işaretleme
- **Kullanıcılar:** Liste + rol değiştirme (customer/moderator/admin)
- **Moderatörler:** Sınırlı yetkili kullanıcılar (sadece yorum onay, soru cevap, vb.)
- **AI Bilgi:** Doküman/link/metin yönetimi + sistem prompt
- **Tedarikçi:** Tüm bağlı ürünlerin senkronizasyon durumu + manuel "Hepsini yenile" butonu
- **Raporlar:** Haftalık/aylık satış, teklif, ziyaretçi raporları (PDF/Excel export)
- **Ayarlar:** Site iletişim bilgileri, sosyal medya, AI sistem prompt'u, hosting ayarları

### 12.6 Roller ve Yetkiler

| Rol | Yetkiler |
|-----|----------|
| **customer** | Profil, sipariş, teklif takibi, favoriler, yorum yapma |
| **moderator** | Customer + yorum onay/red, soru cevap, iletişim mesajı yanıtlama |
| **assistant** | Moderator + sipariş durumu güncelleme, teklif yanıtlama, ürün stok güncelleme |
| **admin** | Tüm yetkiler (sınırsız) |

---

## 13. Tedarikçi Entegrasyonu (Detaylı)

### 13.1 Çalışma Mantığı

```
1. Admin ürün eklerken:
   - Tedarikçi URL'i girer (örn. https://tedarikci.com/urun/abc)
   - Kar marjı yüzdesi girer (örn. %25)
   - Senkronizasyon sıklığı seçer

2. Sistem:
   - URL'i hemen fetch eder (test)
   - Sayfa yapısından fiyat ve stok bilgisini parse eder
   - Tedarikçi fiyatı * (1 + kar marjı) = Zolarr fiyatı
   - Tedarikçi stoğu = Zolarr stoğu
   - Bilgileri ürüne kaydeder

3. Cron job (Vercel Cron):
   - Saatlik / günlük / haftalık olarak çalışır
   - Tüm "tedarikçi bağlı" ürünleri günceller
   - Her ürün için:
     • Yeni fiyat eski fiyattan farklıysa → bildirim üret
     • Yeni stok 0 ise → ürün durumu "stokta yok" 
     • Tedarikçide URL artık yoksa (404) → "kaldırıldı" bildirim üret
```

### 13.2 Parse Stratejisi

**Sorun:** Her tedarikçi sitesi farklı yapıda. Selector hardcode etmek kırılgan.

**Çözüm:** Şablon sistem
- Admin URL eklerken **selector seç** modu açılır
- Sistem sayfayı önizler, admin tıklayarak fiyatı ve stoğu işaretler
- Sistem CSS selector'ünü kaydeder
- Cron job bu selector'ü kullanır
- Selector çalışmazsa → "Senkronizasyon başarısız" bildirim, manual müdahale

**Alternatif:** Admin elle "tedarikçinin sitesini açayım kontrol edeyim" — manuel "şimdi senkronize et" butonu

### 13.3 Bildirim Tetikleyiciler

```typescript
// Cron job içinde:
if (newPrice > oldPrice) {
  notify('PRICE_INCREASE', { product, oldPrice, newPrice, percent: ((newPrice - oldPrice) / oldPrice * 100).toFixed(1) });
}
if (newPrice < oldPrice) {
  notify('PRICE_DECREASE', { ... });
}
if (newStock === 0 && oldStock > 0) {
  notify('OUT_OF_STOCK', { product });
  product.is_active = false;
}
if (fetchFailed) {
  notify('SUPPLIER_PAGE_GONE', { product });
}
```

---

## 14. Veritabanı Şeması

```typescript
// users (Supabase Auth ile entegre)
id (uuid, pk)
email (unique)
name, phone
role: 'customer' | 'moderator' | 'assistant' | 'admin'
avatar_url
created_at, updated_at

// addresses
id, user_id (fk), label, full_name, phone
city, district, postal_code, address, is_default

// categories (hiyerarşik)
id, slug, name, description, parent_id (nullable), icon, sort_order

// products
id, slug, name, short_description, description (markdown)
category_id (fk)
brand, sku
price, discount_price
stock, track_stock (bool)
is_active, is_featured
power_w, power_kwp, current_a, voltage_v  // filtreler için
specs (jsonb)  // { "key": "value" }
images (text[])
videos (text[])
pdfs (text[])
tags (text[])  // ['kargo_bedava', 'premium']
warranty_years (int, nullable)
supplier_url, supplier_margin_percent, supplier_selector_price, supplier_selector_stock
supplier_last_sync, supplier_sync_frequency
created_at, updated_at

// stock_alerts (gelince haber ver)
id, user_id (nullable), email, product_id, push_subscription (jsonb), notified (bool), created_at

// campaigns
id, name, slug, banner_image, description
rule_type: 'BUY_X_GET_Y_DISCOUNT' | 'BUY_X_GET_Y_FREE' | 'CATEGORY_PERCENTAGE' | 'CART_THRESHOLD'
rule_config (jsonb)  // { "buy_count": 4, "get_count": 1, "discount": 70 }
scope_type: 'ALL' | 'PRODUCTS' | 'CATEGORY'
scope_ids (uuid[])
starts_at, ends_at, is_active

// orders
id, order_number, user_id (nullable for guest)
status (enum)
subtotal, discount_total, total
delivery_address (jsonb), notes, contact_preference, needs_installation
applied_campaigns (uuid[])
created_at, updated_at

// order_items
id, order_id, product_id, quantity, unit_price, subtotal, campaign_applied (nullable)

// quotes (teklif talepleri — DETAYLI)
id, quote_number
contact_name, contact_phone, contact_email, contact_time_preference
city, district
installation_location: 'roof' | 'roof_flat' | 'land' | 'carport' | 'facade'
location_notes
appliances (jsonb)  // [{ "name": "Buzdolabı", "consumption_kwh": 50, "power_w": 200, "voltage_v": 220 }]
description (text, max 2000)
estimated_kwp, estimated_savings, estimated_payback  // hesaplama sonucu
status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
admin_notes
responded (bool), responded_at, responded_by (user_id)
created_at, updated_at

// dealer_applications (önceki spec'tekiyle aynı)

// projects
id, slug, title, description (markdown)
project_type: 'residential' | 'commercial' | 'industrial' | 'agricultural'
location_city, location_district
capacity_kwp, panel_count
completion_date
images (text[]), before_image, after_image
products_used (uuid[]), customer_quote, customer_name, yearly_savings
created_at

// testimonials
id, customer_name, location, rating, quote, avatar_url
project_id (nullable), is_approved, is_featured, created_at

// faqs
id, category, question, answer (markdown), sort_order, is_active

// product_reviews
id, product_id, user_id, rating, comment, is_approved, created_at

// product_questions
id, product_id, user_id, question, answer (nullable), answered_by (user_id), created_at

// contact_messages
id, name, email, phone, subject, message, status, created_at

// favorites
id, user_id, product_id, created_at

// notifications (admin paneli için)
id, type: 'NEW_QUOTE' | 'NEW_ORDER' | 'PRICE_INCREASE' | 'PRICE_DECREASE' | 'OUT_OF_STOCK' | 'SUPPLIER_GONE' | ...
payload (jsonb)
target_user_id (nullable, eğer null ise tüm admin)
is_read (bool)
created_at

// push_subscriptions
id, user_id (nullable), email, endpoint, p256dh, auth, created_at

// ai_conversations
id, user_id (nullable), session_id, started_at

// ai_messages
id, conversation_id, role: 'user' | 'assistant' | 'system'
content, tokens_in, tokens_out
created_at

// ai_knowledge_documents (RAG)
id, title, content_type: 'pdf' | 'url' | 'text'
source_url (nullable), uploaded_file (nullable)
content (text)
chunks (jsonb)  // { "id": ..., "text": ..., "embedding": [...] }
is_active, created_at, updated_at

// ai_settings (key-value)
key (unique)  // 'system_prompt', 'max_messages_per_day_anonymous', vs.
value (jsonb)

// site_settings (key-value)
key (unique)  // 'address', 'phone', 'whatsapp', 'social_instagram', 'maps_lat', 'maps_lng', vs.
value (jsonb)

// analytics_events (basit)
id, event_type, page_path, user_id (nullable), session_id, payload (jsonb), created_at
```

### 14.2 İndeksler

`products(slug)`, `products(category_id, is_active)`, `products(is_featured)`, `products(supplier_url)` (unique partial), `orders(user_id, status)`, `quotes(status, created_at)`, `notifications(target_user_id, is_read)`, `ai_messages(conversation_id, created_at)`

---

## 15. Hesaplama Formülleri

`lib/constants.ts` ve `site_settings` üzerinden:
- `ELECTRICITY_UNIT_PRICE` — 3.20 TL/kWh varsayılan
- `SYSTEM_EFFICIENCY` — 0.85 verim katsayısı
- `SYSTEM_COST_PER_KWP` — 14.000 TL/kWp varsayılan
- `INFLATION_FACTOR` — 1.05 yıllık ortalama

`lib/data/irradiance.ts` — il bazlı yıllık güneşlenme tablosu (kWh/m²/yıl)

**Formüller:**
- Tahmini sistem (kWp) = (Aylık fatura × 12) / (`UNIT_PRICE` × `IRRADIANCE` × `EFFICIENCY`)
- Yıllık tasarruf = Sistem kWp × `IRRADIANCE` × `UNIT_PRICE` × `EFFICIENCY`
- Geri ödeme (yıl) = Sistem maliyeti / Yıllık tasarruf
- 25 yıl tasarruf = Yıllık tasarruf × 25 × `INFLATION_FACTOR`

---

## 16. SEO ve Performans

### 16.1 SEO

- Her sayfada özel `<title>`, `<meta description>`
- Open Graph + Twitter Card
- `sitemap.xml` (otomatik)
- `robots.txt`
- JSON-LD structured data (LocalBusiness, Product, FAQPage, Review)
- Türkçe semantik HTML
- Canonical URL'ler

### 16.2 Performans Hedefleri

- Lighthouse Performance ≥ 90
- LCP < 2.5s
- TTI < 3.5s
- Görsel: Next.js `<Image>` + WebP/AVIF
- Font: `next/font` self-hosting
- Code splitting + dynamic imports
- Cursor efekti: GPU-only, throttle (16ms)

### 16.3 Erişilebilirlik

- WCAG AA
- Klavye navigasyonu
- ARIA etiketleri
- Renk kontrastı ≥ 4.5:1
- `prefers-reduced-motion` desteği (cursor efekti dahil otomatik kapatılır)

---

## 17. KVKK ve Yasal

- Çerez bildirimi (kabul/reddet/ayarlar) — KVKK uyumlu
- KVKK aydınlatma metni `/kvkk`
- Açık rıza checkbox'ları (pazarlama varsayılan kapalı)
- Veri silme talebi (iletişim formu üzerinden)
- Mesafeli satış sözleşmesi
- Verilerimi indir (KVKK)
- Hesabımı sil (KVKK)

---

## 18. Test Stratejisi

- **Unit:** Hesaplayıcı, kampanya kuralları motoru, AI metin temizleme (TTS için), Zod şemalar
- **Integration:** Server Actions (sipariş, teklif, ürün senkronizasyon)
- **E2E (manuel veya Playwright):** Teklif al wizard, talep oluştur, AI sohbet, admin ürün ekleme
- **Tema geçiş QA:** Her sayfada hem dark hem light mode görsel kontrol — buton/yazı görünürlüğü
- **Mobile QA:** 320px, 768px, 1024px, 1440px
- **Cursor efekt QA:** Performans (60fps), `prefers-reduced-motion`, mobile'da otomatik kapalı

---

## 19. Şablon Veriler

**İletişim (placeholder):**
- Adres: Örnek Mah. Güneş Sok. No:42 Beşiktaş/İstanbul
- Telefon: +90 (212) 555 0 555
- E-posta: info@zolarr.com.tr
- WhatsApp: +90 555 555 55 55
- Sosyal medya: Instagram, LinkedIn, X, YouTube, TikTok, Facebook

**İçerik:**
- 12-15 örnek ürün (panel, batarya, inverter, paket, aksesuar)
- 6-8 örnek proje
- 12-15 SSS sorusu
- 6-8 müşteri yorumu
- 2-3 örnek kampanya (Bahar, Sıcak Yaz, vb.)

---

## 20. Açık Konular ve Kullanıcıdan Beklenenler

### 20.1 Sonradan Alınacak (Site teslim aşamasında)

- [ ] Gerçek şirket adresi
- [ ] Gerçek telefon, e-posta, WhatsApp
- [ ] Sosyal medya bağlantıları
- [ ] Logo'nun alternatif versiyonları (varsa)
- [ ] Google Maps konumu (lat/lng)
- [ ] Anthropic API key (AI asistan için)
- [ ] Resend API key (e-posta için)
- [ ] Supabase proje + key'leri
- [ ] Vercel hesabı / deployment

### 20.2 Kapsam Dışı (İleride Eklenebilecek)

- iyzico/PayTR ile online ödeme
- İngilizce dil desteği
- Blog modülü
- Mobil uygulama
- Gelişmiş analytics (PostHog, Mixpanel)
- A/B testing

---

## 21. Onay

**Onaylayan:** Kullanıcı (m4likiletisim@gmail.com)
**Onay tarihi:** 2026-05-05 (`ges.txt` revizyonu sonrası)
**Onay türü:** Açık onay ("onayladım, spec dosyasını yaz" + "buna göre oluştur")

**Sonraki adım:** Bu spec'in onayından sonra `superpowers:writing-plans` skill'i ile detaylı implementation plan yazılacak ve kademeli (faz faz) uygulamaya geçilecek.
