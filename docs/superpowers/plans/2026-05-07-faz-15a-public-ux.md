# Faz 15A — Public UX Overhaul (Solar Editorial × Trust) Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Anasayfa ve diğer public sayfaları editorial dergi tasarımına yükseltmek. Solar müşterisinin "hikaye" gördüğü, güven hissettiği, eylem geçmek istediği bir site.

**Tasarım dili:**
- Display: **Fraunces** variable serif (`@next/font/google`)
- Body: **Manrope** (`@next/font/google`)
- Mono: **JetBrains Mono** (sayı/spec aksenti)
- Renk: existing Cyber Lime + new Warm Gold `#F4A82C` + Deep Sky `#0A1628`
- Layout: asimetrik, full-bleed bölümler, generous whitespace
- Motion: framer-motion (orchestrated stagger reveals)

---

## Task 1: Font + tema sistem genişletmesi

**Files:**
- Modify: `app/layout.tsx` (font yüklemeleri)
- Modify: `app/globals.css` (font değişkenleri + yeni renkler)
- Create: `lib/design/fonts.ts` (font setup)

- [ ] **Step 1: next/font yükle**

```ts
// lib/design/fonts.ts
import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';

export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

export const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
```

- [ ] **Step 2: app/layout.tsx — body class'a ekle**

```tsx
import { fraunces, manrope, jetbrains } from '@/lib/design/fonts';
// <body className={`${fraunces.variable} ${manrope.variable} ${jetbrains.variable}`}>
```

- [ ] **Step 3: globals.css — yeni token'lar**

```css
@theme {
  --font-display: 'var(--font-display)', serif;
  --font-body: 'var(--font-body)', sans-serif;
  --font-mono: 'var(--font-mono)', monospace;

  --color-warm-gold: #F4A82C;
  --color-warm-gold-soft: #F4A82C20;
  --color-deep-sky: #0A1628;
  --color-deep-sky-soft: #0A162810;
}

body {
  font-family: var(--font-body);
}

.font-display {
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 0;
  font-feature-settings: 'ss01';
  letter-spacing: -0.02em;
}
```

- [ ] **Step 4: Build clean + commit**

```powershell
git commit -m "feat(design): add Fraunces/Manrope/JetBrains fonts + warm gold + deep sky tokens"
```

---

## Task 2: Hero component (full-bleed + savings widget)

**Files:**
- Create: `components/landing/hero.tsx`
- Create: `components/landing/savings-calculator-widget.tsx`
- Public asset: `/public/images/hero-solar.jpg` — Unsplash curated (geniş yatay solar kurulum, golden hour)

**Tasarım:**
- Full viewport height (`min-h-[80vh]`)
- Full-bleed background image (next/image priority)
- Sol tarafta: büyük `font-display` başlık (50-72px), sub-headline, primary CTA
- Sağ tarafta: glass card içinde "Faturanız ne kadar düşer?" widget'ı:
  - Aylık fatura input (TL)
  - Şehir dropdown (mevcut irradiance data ile)
  - "Hesapla" butonu → tahmini sistem boyutu + yıllık tasarruf inline
- Alt strip: küçük metrikler ("500+ kurulum", "10 yıl garanti", "TSE sertifikalı")
- Motion: stagger reveal (h1 → sub → cta → widget), 100ms aralıkla

**Görsel:** Unsplash:
```
https://images.unsplash.com/photo-1509391366360-2e959784a276 (solar farm)
veya
https://images.unsplash.com/photo-1583345107565-c0d97f0e99c2 (solar panels golden hour)
```

İndirip `public/images/hero-solar.jpg` (1920×1080, optimize via next/image).

- [ ] **Step 1: Image indir + asset koy**
- [ ] **Step 2: Hero component (server)**
- [ ] **Step 3: SavingsCalculatorWidget (client)**
- [ ] **Step 4: app/page.tsx'te eski hero'yu Hero ile değiştir**
- [ ] **Step 5: Build + visual check**
- [ ] **Step 6: Commit**

---

## Task 3: Trust strip (sertifikalar + partner logoları)

**Files:**
- Create: `components/landing/trust-strip.tsx`
- Public assets: `public/images/badges/{tse,iec,gunder,tedas}.svg` (basit SVG mark'lar — Wikimedia / firma siteleri)

**Tasarım:**
- Hero'dan hemen sonra ince yatay strip
- "Sertifikalı kurulum partneri" başlığı + 4-6 grayscale logo
- Hover'da renkli olur

- [ ] Component yaz, page.tsx'e ekle, commit

---

## Task 4: "Nasıl Çalışır?" section

**Files:**
- Create: `components/landing/how-it-works.tsx`
- Create: `components/landing/how-it-works-step.tsx`

**Tasarım:**
- 4 adım: 1) Keşif, 2) Tasarım, 3) Kurulum, 4) İşletim
- Her adım: numara (büyük, font-display, warm gold), illustrasyon (lucide icon → büyük), başlık, açıklama
- Layout: 4-column grid desktop, 1-column mobile, dikey çizgi connector
- Motion: scroll-into-view ile staggered reveal

- [ ] Component yaz + 4 step content + page.tsx ekle + commit

---

## Task 5: Campaign banner (admin-yönetilebilir)

**Files:**
- Create: `components/landing/campaign-banner.tsx`
- Create: `lib/db/queries/campaigns.ts`
- Migration: `0014_campaigns.sql` (campaigns tablosu)
- Admin UI: `app/admin/kampanyalar/page.tsx` + form

**Schema:**
```sql
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text,
  cta_href text,
  bg_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);
```

**Tasarım:**
- Geniş yatay banner, full-bleed
- Sol: başlık + alt-başlık + CTA buton
- Sağ: dramatik görsel (admin yüklüyor)
- "Bu hafta" gibi etiket sol üstte (warm gold pill)

- [ ] Migration + queries + admin CRUD + landing component + commit

(Admin form image upload'u Faz 15B'de bağlanacak; şimdilik URL field'ı.)

---

## Task 6: Featured products carousel

**Files:**
- Create: `components/landing/featured-products.tsx`
- Modify: `lib/db/queries/products.ts` (`getFeaturedProducts(limit=6)`)

**Tasarım:**
- Section başlığı: "Öne Çıkan Ürünler" (font-display, large)
- 4-6 ürün large card grid (mevcut `is_featured=true` ürünlerden)
- Card: büyük görsel, badge ("İndirim", "Stokta", "Yeni"), isim, fiyat, "Sepete Ekle" + "İncele"
- Hover: scale + shadow
- Layout: desktop 3-column grid, tablet 2-column, mobile horizontal scroll snap

- [ ] Query + component + page.tsx ekle + commit

---

## Task 7: Customer stories (editorial case studies)

**Files:**
- Create: `components/landing/customer-stories.tsx`

**Tasarım:**
- 2-3 proje, magazine-style spread
- Her biri: büyük foto (proje), sol tarafta editorial başlık (font-display), 2-3 paragraf metin, alt rakamsal sonuç ("5.4 kWp", "%72 tasarruf"), müşteri sözü (italic, font-display)
- Motion: parallax scroll (görsel yavaş, metin normal)
- Mevcut `projects` tablosundan ilk 2-3 published proje

- [ ] Component + page.tsx + commit

---

## Task 8: Impact counter

**Files:**
- Create: `components/landing/impact-counter.tsx`
- Create: `lib/db/queries/impact-stats.ts`

**Tasarım:**
- Deep Sky (#0A1628) bg, warm gold accent
- 3-4 büyük rakam: kurulum sayısı, toplam kWp, yıllık üretilen kWh, azaltılan ton CO2
- font-display + font-mono mix
- Mevcut CountUp component'i kullan
- Stats hesaplanır: `select count(*), sum(capacity_kwp) from projects where is_published=true`

- [ ] Query + component + page.tsx + commit

---

## Task 9: FAQ snippet on homepage

**Files:**
- Create: `components/landing/faq-snippet.tsx`

**Tasarım:**
- 5 popüler SSS, accordion (mevcut Radix accordion kullan)
- Sağ tarafta "Daha fazla soru?" CTA + /sss linki
- Section başlığı: "Sıkça Sorulan Sorular"

- [ ] Component + page.tsx + commit

---

## Task 10: Final CTA + sticky banner

**Files:**
- Create: `components/landing/final-cta.tsx`
- Create: `components/landing/sticky-cta.tsx`

**Tasarım:**
- Final CTA: full-bleed deep sky bg, dramatic background gradient/illustration, büyük başlık ("Bugün başlayın"), iki CTA (teklif al, iletişim)
- Sticky CTA: sayfa scroll edildikçe alt sağda küçük "Teklif Al" pill button (mobile'da hidden — zaten WhatsApp button var)

- [ ] Componentler + page.tsx + commit

---

## Task 11: app/page.tsx orchestration

Tüm yeni section'ları doğru sıraya diz, motion timeline'ı ayarla, mobile responsive doğrula.

- [ ] page.tsx final montaj + commit

---

## Task 12: Mağaza sayfası polish

**Files:**
- Modify: `app/magaza/page.tsx`
- Modify: `components/magaza/product-card.tsx` (varsa)

- Üst hero'ya küçük bir banner (kategori illüstrasyonu)
- Filter sidebar redesign (sticky, daha clean)
- Grid card'ları daha "shop-like" yap (badge'ler, hover)

- [ ] Polish + commit

---

## Task 13: Galeri sayfası polish

- Üst hero
- Project card hover effect (zoom + overlay)
- Filter chip'leri pill design

- [ ] Polish + commit

---

## Task 14: Hakkımızda sayfası polish

- Editorial story format (büyük başlık + kurucu paragrafı + zaman çizelgesi + ekip + sayılarla başarımız)
- Mevcut sayfa zaten var, sadece editorial typography ile yeniden hizala

- [ ] Polish + commit

---

## Task 15: Animation orchestration audit

- Tüm landing component'lerinde framer-motion stagger doğru mu?
- Reduce-motion preference'i uygulanıyor mu?
- Mobile'da animasyonlar perf düşürmüyor mu?

- [ ] Audit + fix + commit

---

## Task 16: Final QA + completion report

- npm run build temiz
- Tests pass
- Mobile responsive (3 viewport: 375 / 768 / 1440)
- Light/dark her ikisinde işliyor
- Screenshot pass'i yenile (npm run qa:screenshot)

- [ ] Completion report + push

---

## Self-Review

- [ ] Yeni font'lar yüklendi (display=Fraunces, body=Manrope, mono=JetBrains)
- [ ] Yeni renkler tema'ya eklendi (warm-gold, deep-sky)
- [ ] Hero full-bleed + savings widget functional
- [ ] Tüm yeni section'lar mobile responsive
- [ ] Motion preference'lara saygılı (reduce-motion)
- [ ] next/image her yerde (LCP optimize)
- [ ] Lighthouse: A11y > 90, LCP < 2.5s

## Kapsam Dışı (Faz 15B/15C)

- Image upload (Faz 15B)
- Admin polish (Faz 15C)
- Real customer photos (15B sonrası kullanıcı yükler)
- Internationalization

## Bilinen Riskler

- Fraunces variable font ağır olabilir (~80kb) — `display: 'swap'` ve `subset: 'latin-ext'` ile optimize
- Unsplash placeholder'lar geçici, production'da legal kullanım için lisans kontrolü gerekebilir; alternatif: kullanıcı kendi fotoğraflarını yüklesin (15B)
- Editorial layout mobile'da düzgün scroll etmeyebilir → her component için mobile breakpoint test
