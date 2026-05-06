# Faz 2 — Anasayfa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec §5.2'deki 12 bölümlük anasayfayı tamamen kurmak — Hero + tasarruf hesaplayıcı, ürün/kampanya slider, 3 yol kartı, Neden Zolarr, çalışma süreci, stoktaki ürünler, teklif önizleme, son projeler, sayılar, yorumlar, SSS ve CTA bandı + bülten.

**Architecture:** Anasayfa server component, içine yerleştirilen küçük bölüm component'lari (hero/path-cards/why/...). Etkileşimli parçalar (`hero-savings-widget`, `product-card`, `count-up`, `accordion`, `newsletter-form`) `'use client'`. Veriler şimdilik `lib/data/*.ts` mock dosyalarından gelir (Faz 3'te DB'ye bağlanacak). Hesaplamalar `lib/calculator.ts`'de; il bazlı güneşlenme `lib/data/irradiance.ts`'de.

**Tech Stack:** Next.js 16.2.4 App Router (server components default), React 19, TypeScript strict, Tailwind 4 (semantic tokens), Framer Motion (scroll/fade/count-up), Radix Accordion, embla-carousel-react (yorumlar + ürün slider), next/image (lazy), Vitest + React Testing Library + jsdom.

**Notlar (kritik kurallar):**
- AGENTS.md: Next.js 16 — yeni API'lar için `node_modules/next/dist/docs/` oku.
- Hardcoded `text-white` / `bg-black` YOK — yalnızca semantic token (`text-[var(--color-text-primary)]`, `bg-[var(--color-bg-base)]`).
- Tüm metin Türkçe; apostrof JSX içinde `&apos;` ile escape.
- `prefers-reduced-motion` saygısı: animasyon hook'larında early-return.
- Her bölüm scroll'da fade+slide-up (Framer Motion `whileInView`).
- TDD: önce test, sonra implementation. Her task sonu commit.

---

## File Structure

**Yeni dosyalar:**

```
lib/
  calculator.ts                 — savings hesaplama formülleri
  data/
    irradiance.ts               — il bazlı kWh/m²/yıl
    products-mock.ts            — 12 stok ürün
    campaigns-mock.ts           — 4 kampanya
    projects-mock.ts            — 6 proje
    testimonials-mock.ts        — 5 müşteri yorumu
    faq-mock.ts                 — 5 SSS
    benefits-mock.ts            — 6 fayda kartı
    process-mock.ts             — 4 süreç adımı
    stats-mock.ts               — 4 sayaç
    paths-mock.ts               — 3 yol kartı (Konut/İşyeri/Tarım)

components/
  ui/
    accordion.tsx               — Radix Accordion wrapper
    count-up.tsx                — sayı animasyonu (intersection observer)
    newsletter-form.tsx         — e-posta validasyon + submit (no-op)
    product-card.tsx            — 5 görsel slider + ad + fiyat
  home/
    hero.tsx                    — slogan + CTA'lar + savings widget
    hero-savings-widget.tsx     — il + fatura input → tahmini tasarruf
    product-slider.tsx          — yatay kampanya/ürün slider
    path-cards.tsx              — 3 yol kartı
    why-zolarr.tsx              — 6 fayda kartı
    process-timeline.tsx        — 4 adım scroll-triggered
    stock-products.tsx          — 8-12 ürün grid (ProductCard)
    quote-preview.tsx           — fade carousel + CTA
    recent-projects.tsx         — 6 proje kartı
    stats-counters.tsx          — 4 CountUp
    testimonials.tsx            — embla carousel
    faq-accordion.tsx           — 5 SSS Radix Accordion
    cta-newsletter.tsx          — büyük CTA bandı + Newsletter

tests/
  lib/calculator.test.ts
  components/ui/count-up.test.tsx
  components/ui/accordion.test.tsx
  components/ui/newsletter-form.test.tsx
  components/ui/product-card.test.tsx
  components/home/hero-savings-widget.test.tsx
  components/home/faq-accordion.test.tsx
  components/home/path-cards.test.tsx
  app/page.test.tsx             — anasayfa smoke (replaces existing)
```

**Değişen dosyalar:**

```
app/page.tsx                    — geçici hero kaldırılır, 12 bölüm assemble
lib/constants.ts                — gerekirse FAQ_TOPICS gibi sabitler
package.json                    — embla-carousel-react zaten var (no change)
```

---

## Task Sequencing Notes

- Görev 1-3: veri katmanı (calculator + irradiance + mock data) — diğer her şeyin temeli.
- Görev 4-7: UI primitive'ler (CountUp, Accordion, NewsletterForm, ProductCard) — sectionlar bunları kullanır.
- Görev 8-19: 12 anasayfa bölümü, spec sırasına göre.
- Görev 20: assemble + smoke test + tam build/test verification.

---

## Task 1: Calculator (formüller)

**Files:**
- Create: `lib/calculator.ts`
- Test: `tests/lib/calculator.test.ts`

- [ ] **Step 1: Failing test yaz**

`tests/lib/calculator.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { estimateSystem, annualSavings, paybackYears, twentyFiveYearSavings } from '@/lib/calculator';

describe('calculator', () => {
  // İstanbul: ~1450 kWh/m²/yıl, fatura 800 TL/ay, UNIT 3.20, EFF 0.85
  // Sistem kWp = (800*12) / (3.20 * 1450 * 0.85) = 9600 / 3944 ≈ 2.434
  it('estimateSystem matches formula for İstanbul + 800 TL', () => {
    const kwp = estimateSystem({ monthlyBillTry: 800, irradiance: 1450 });
    expect(kwp).toBeCloseTo(2.434, 2);
  });

  it('annualSavings = kWp * irradiance * unit_price * efficiency', () => {
    const try_ = annualSavings({ systemKwp: 2.434, irradiance: 1450 });
    // 2.434 * 1450 * 3.20 * 0.85 ≈ 9600
    expect(try_).toBeCloseTo(9600, 0);
  });

  it('paybackYears = system_cost / annual_savings', () => {
    // cost = 2.434 * 14000 = 34076 ; savings = 9600 ; payback ≈ 3.55
    const years = paybackYears({ systemKwp: 2.434, annualSavingsTry: 9600 });
    expect(years).toBeCloseTo(3.55, 1);
  });

  it('twentyFiveYearSavings applies inflation factor', () => {
    // 9600 * 25 * 1.05 = 252000
    const total = twentyFiveYearSavings({ annualSavingsTry: 9600 });
    expect(total).toBeCloseTo(252000, 0);
  });

  it('rounds gracefully for zero bill', () => {
    expect(estimateSystem({ monthlyBillTry: 0, irradiance: 1450 })).toBe(0);
  });
});
```

- [ ] **Step 2: Test fail olsun** — `npm test -- tests/lib/calculator.test.ts` → "Cannot find module"

- [ ] **Step 3: Implementation yaz**

`lib/calculator.ts`:

```ts
import { CALC } from './constants';

export interface EstimateInput {
  monthlyBillTry: number;
  irradiance: number; // kWh/m²/yıl
}

export function estimateSystem({ monthlyBillTry, irradiance }: EstimateInput): number {
  if (monthlyBillTry <= 0 || irradiance <= 0) return 0;
  const annualKwh = monthlyBillTry * 12;
  const denom = CALC.ELECTRICITY_UNIT_PRICE * irradiance * CALC.SYSTEM_EFFICIENCY;
  return annualKwh / denom;
}

export function annualSavings({
  systemKwp,
  irradiance,
}: {
  systemKwp: number;
  irradiance: number;
}): number {
  return systemKwp * irradiance * CALC.ELECTRICITY_UNIT_PRICE * CALC.SYSTEM_EFFICIENCY;
}

export function paybackYears({
  systemKwp,
  annualSavingsTry,
}: {
  systemKwp: number;
  annualSavingsTry: number;
}): number {
  if (annualSavingsTry <= 0) return 0;
  return (systemKwp * CALC.SYSTEM_COST_PER_KWP) / annualSavingsTry;
}

export function twentyFiveYearSavings({ annualSavingsTry }: { annualSavingsTry: number }): number {
  return annualSavingsTry * 25 * CALC.INFLATION_FACTOR;
}
```

- [ ] **Step 4: Test geçsin**

Run: `npm test -- tests/lib/calculator.test.ts`
Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/calculator.ts tests/lib/calculator.test.ts
git commit -m "feat(home): add solar savings calculator formulas"
```

---

## Task 2: İl bazlı güneşlenme verisi

**Files:**
- Create: `lib/data/irradiance.ts`

- [ ] **Step 1: Veriyi yaz**

`lib/data/irradiance.ts`:

```ts
// Yıllık ortalama global yatay güneşlenme (kWh/m²/yıl).
// Kaynak: PVGIS / GEPA verilerinin yaklaşık ortalaması — şablon değerlerdir,
// gerçek mühendislik için müşteri konumu PVGIS ile yeniden hesaplanmalıdır.

export interface IrradianceRow {
  province: string;
  kWhPerM2Year: number;
}

export const IRRADIANCE: IrradianceRow[] = [
  { province: 'Adana', kWhPerM2Year: 1700 },
  { province: 'Ankara', kWhPerM2Year: 1500 },
  { province: 'Antalya', kWhPerM2Year: 1750 },
  { province: 'Aydın', kWhPerM2Year: 1700 },
  { province: 'Balıkesir', kWhPerM2Year: 1500 },
  { province: 'Bursa', kWhPerM2Year: 1450 },
  { province: 'Denizli', kWhPerM2Year: 1650 },
  { province: 'Diyarbakır', kWhPerM2Year: 1700 },
  { province: 'Eskişehir', kWhPerM2Year: 1500 },
  { province: 'Gaziantep', kWhPerM2Year: 1700 },
  { province: 'Hatay', kWhPerM2Year: 1700 },
  { province: 'İstanbul', kWhPerM2Year: 1450 },
  { province: 'İzmir', kWhPerM2Year: 1700 },
  { province: 'Kayseri', kWhPerM2Year: 1600 },
  { province: 'Kocaeli', kWhPerM2Year: 1400 },
  { province: 'Konya', kWhPerM2Year: 1700 },
  { province: 'Manisa', kWhPerM2Year: 1700 },
  { province: 'Mersin', kWhPerM2Year: 1750 },
  { province: 'Muğla', kWhPerM2Year: 1700 },
  { province: 'Sakarya', kWhPerM2Year: 1400 },
  { province: 'Samsun', kWhPerM2Year: 1300 },
  { province: 'Şanlıurfa', kWhPerM2Year: 1750 },
  { province: 'Tekirdağ', kWhPerM2Year: 1450 },
  { province: 'Trabzon', kWhPerM2Year: 1250 },
  { province: 'Van', kWhPerM2Year: 1700 },
];

export const DEFAULT_IRRADIANCE = 1500;

export function findIrradiance(province: string): number {
  const row = IRRADIANCE.find((r) => r.province.toLocaleLowerCase('tr-TR') === province.toLocaleLowerCase('tr-TR'));
  return row?.kWhPerM2Year ?? DEFAULT_IRRADIANCE;
}
```

- [ ] **Step 2: Tip kontrolü**

Run: `npx tsc --noEmit`
Expected: errors yok.

- [ ] **Step 3: Commit**

```bash
git add lib/data/irradiance.ts
git commit -m "feat(home): add provincial solar irradiance dataset"
```

---

## Task 3: Mock data dosyaları (products, projects, testimonials, faq, benefits, process, stats, paths, campaigns)

**Files:**
- Create: `lib/data/products-mock.ts`
- Create: `lib/data/campaigns-mock.ts`
- Create: `lib/data/projects-mock.ts`
- Create: `lib/data/testimonials-mock.ts`
- Create: `lib/data/faq-mock.ts`
- Create: `lib/data/benefits-mock.ts`
- Create: `lib/data/process-mock.ts`
- Create: `lib/data/stats-mock.ts`
- Create: `lib/data/paths-mock.ts`

- [ ] **Step 1: products-mock.ts**

```ts
export interface MockProduct {
  slug: string;
  name: string;
  category: 'panel' | 'invertor' | 'batarya' | 'kit';
  priceTry: number;
  capacityKwp?: number;
  inStock: boolean;
  images: string[]; // 5 placeholder
  badges: ('Yeni' | 'Kampanya' | 'Çok Satan' | 'Stokta')[];
}

const placeholderImgs = [
  '/images/placeholder-panel-1.svg',
  '/images/placeholder-panel-2.svg',
  '/images/placeholder-panel-3.svg',
  '/images/placeholder-panel-4.svg',
  '/images/placeholder-panel-5.svg',
];

export const PRODUCTS_MOCK: MockProduct[] = [
  { slug: 'monokristal-550w', name: 'Monokristal 550W Panel', category: 'panel', priceTry: 6_900, capacityKwp: 0.55, inStock: true, images: placeholderImgs, badges: ['Çok Satan', 'Stokta'] },
  { slug: 'monokristal-450w', name: 'Monokristal 450W Panel', category: 'panel', priceTry: 5_400, capacityKwp: 0.45, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'invertor-5kw', name: 'Hibrit İnvertör 5kW', category: 'invertor', priceTry: 36_000, inStock: true, images: placeholderImgs, badges: ['Yeni'] },
  { slug: 'invertor-10kw', name: 'On-Grid İnvertör 10kW', category: 'invertor', priceTry: 64_000, inStock: false, images: placeholderImgs, badges: [] },
  { slug: 'batarya-5kwh', name: 'Lityum Batarya 5kWh', category: 'batarya', priceTry: 78_000, inStock: true, images: placeholderImgs, badges: ['Kampanya', 'Stokta'] },
  { slug: 'batarya-10kwh', name: 'Lityum Batarya 10kWh', category: 'batarya', priceTry: 145_000, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'kit-3kwp', name: 'Konut Kit 3kWp Anahtar Teslim', category: 'kit', priceTry: 89_000, capacityKwp: 3, inStock: true, images: placeholderImgs, badges: ['Çok Satan'] },
  { slug: 'kit-5kwp', name: 'Konut Kit 5kWp Anahtar Teslim', category: 'kit', priceTry: 139_000, capacityKwp: 5, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'kit-10kwp', name: 'Ticari Kit 10kWp', category: 'kit', priceTry: 269_000, capacityKwp: 10, inStock: false, images: placeholderImgs, badges: [] },
  { slug: 'panel-tracker', name: 'Tek Eksenli Tracker Sistemi', category: 'kit', priceTry: 42_000, inStock: true, images: placeholderImgs, badges: ['Yeni'] },
  { slug: 'kablo-set', name: 'Solar Kablo + Konnektör Seti', category: 'kit', priceTry: 4_500, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
  { slug: 'mc4-konnektor', name: 'MC4 Konnektör (10 Çift)', category: 'kit', priceTry: 850, inStock: true, images: placeholderImgs, badges: ['Stokta'] },
];
```

- [ ] **Step 2: campaigns-mock.ts**

```ts
export interface MockCampaign {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: 'Kampanyaya Git' | 'İncele';
  href: string;
}

export const CAMPAIGNS_MOCK: MockCampaign[] = [
  { slug: 'bahar-3kwp', title: 'Bahar Kampanyası: 3kWp Sistem', subtitle: '%15 indirim + ücretsiz keşif', badge: 'Kampanya', cta: 'Kampanyaya Git', href: '/magaza/kampanya/bahar-3kwp' },
  { slug: 'tarim-paketi', title: 'Tarım Sulama Paketi', subtitle: 'Pompa + panel set', badge: 'Yeni', cta: 'İncele', href: '/magaza/kampanya/tarim-paketi' },
  { slug: 'ticari-10kwp', title: 'Ticari 10kWp Çözüm', subtitle: 'KOBİ\'ler için', badge: 'Popüler', cta: 'Kampanyaya Git', href: '/magaza/kampanya/ticari-10kwp' },
  { slug: 'batarya-yaz', title: 'Batarya Yaz İndirimi', subtitle: '5kWh batarya %20 indirim', badge: 'Kampanya', cta: 'Kampanyaya Git', href: '/magaza/kampanya/batarya-yaz' },
];
```

- [ ] **Step 3: projects-mock.ts**

```ts
export interface MockProject {
  slug: string;
  title: string;
  location: string;
  capacityKwp: number;
  type: 'Konut' | 'Ticari' | 'Tarım';
  coverImage: string;
}

export const PROJECTS_MOCK: MockProject[] = [
  { slug: 'antalya-villa', title: 'Antalya Villa', location: 'Antalya / Konyaaltı', capacityKwp: 12, type: 'Konut', coverImage: '/images/placeholder-project-1.svg' },
  { slug: 'konya-fabrika', title: 'Konya Mobilya Fabrikası', location: 'Konya / Selçuklu', capacityKwp: 250, type: 'Ticari', coverImage: '/images/placeholder-project-2.svg' },
  { slug: 'aydin-sera', title: 'Aydın Sera Sulama', location: 'Aydın / Söke', capacityKwp: 30, type: 'Tarım', coverImage: '/images/placeholder-project-3.svg' },
  { slug: 'istanbul-cati', title: 'İstanbul Çatı GES', location: 'İstanbul / Beykoz', capacityKwp: 15, type: 'Konut', coverImage: '/images/placeholder-project-4.svg' },
  { slug: 'kayseri-otel', title: 'Kayseri Termal Otel', location: 'Kayseri / Kocasinan', capacityKwp: 180, type: 'Ticari', coverImage: '/images/placeholder-project-5.svg' },
  { slug: 'sanliurfa-pompa', title: 'Şanlıurfa Tarımsal Pompaj', location: 'Şanlıurfa / Harran', capacityKwp: 50, type: 'Tarım', coverImage: '/images/placeholder-project-6.svg' },
];
```

- [ ] **Step 4: testimonials-mock.ts**

```ts
export interface MockTestimonial {
  name: string;
  role: string;
  city: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export const TESTIMONIALS_MOCK: MockTestimonial[] = [
  { name: 'Mehmet Y.', role: 'Konut sahibi', city: 'Antalya', quote: 'Faturam 1200 TL\'den 110 TL\'ye indi. Kurulum 2 günde bitti, ekip son derece profesyoneldi.', rating: 5 },
  { name: 'Ayşe K.', role: 'KOBİ sahibi', city: 'Konya', quote: 'Fabrikamız için 250kW sistem kurduk; geri ödeme süresini 4 yılda kapatacağız. Mühendislik desteği harika.', rating: 5 },
  { name: 'Hasan D.', role: 'Çiftçi', city: 'Şanlıurfa', quote: 'Tarımsal sulamada elektrik faturası kalmadı. Pompa sistemi sorunsuz çalışıyor.', rating: 5 },
  { name: 'Zeynep T.', role: 'Konut sahibi', city: 'İzmir', quote: 'Online teklif sürecinden kuruluma kadar her şey şeffaftı. Kesinlikle tavsiye ediyorum.', rating: 5 },
  { name: 'Ali R.', role: 'Otel işletmecisi', city: 'Muğla', quote: '180kW sistemimiz yazın tüm ihtiyacımızı karşılıyor. 7/24 destek hattı her zaman ulaşılabilir.', rating: 5 },
];
```

- [ ] **Step 5: faq-mock.ts**

```ts
export interface MockFaq {
  question: string;
  answer: string;
}

export const FAQ_MOCK: MockFaq[] = [
  { question: 'Çatımda güneş paneli için yeterli alan var mı?', answer: '1 kWp sistem yaklaşık 5–6 m² alana ihtiyaç duyar. 10 kWp\'lik bir konut sistemi 50–60 m² çatı alanı ister. Ücretsiz keşif ile sizin çatınız için net rakam veriyoruz.' },
  { question: 'Geri ödeme süresi ne kadar?', answer: 'Türkiye\'de ortalama 4–6 yıldır. Konut, fatura tutarına ve bölgeye göre değişir; ticari işletmelerde KDV avantajı sayesinde 3–4 yıla iner.' },
  { question: 'Bulutlu havalarda sistem çalışır mı?', answer: 'Evet, sistem yağmurlu/bulutlu havada da düşük verimle çalışmaya devam eder. Yıllık ortalama üretim hesabı bu koşulları içerir.' },
  { question: 'Bakım gerekiyor mu?', answer: 'Yılda 1–2 kez panel temizliği yeterlidir. İnvertör ve bağlantı kontrolünü 2 yılda bir uzman bakım ekibimiz ücretsiz yapıyor (garanti süresince).' },
  { question: 'Devletten teşvik var mı?', answer: 'Mesken aboneliklerinde 10 kW\'a kadar mahsuplaşma uygulanır. Ticari sistemlerde KDV %1, ek olarak yatırım teşvik belgesi alınabilir. Detaylı bilgilendirmeyi teklif sürecinde sunuyoruz.' },
];
```

- [ ] **Step 6: benefits-mock.ts**

```ts
export interface MockBenefit {
  iconName: 'shield-check' | 'zap' | 'wrench' | 'leaf' | 'phone' | 'badge-percent';
  title: string;
  description: string;
}

export const BENEFITS_MOCK: MockBenefit[] = [
  { iconName: 'shield-check', title: 'Tier-1 Panel Kalitesi', description: 'Sadece üretim garantili, dünya çapında akredite üreticilerden panel kullanıyoruz.' },
  { iconName: 'zap', title: 'Hızlı Kurulum', description: 'Konut sistemi 2 günde, ticari 2 haftada kuruluma hazır. Süreç tamamen şeffaf.' },
  { iconName: 'badge-percent', title: '25 Yıl Üretim Garantisi', description: 'Panel performansı 25 yıl boyunca garantili, invertör 5 yıl ücretsiz değişim.' },
  { iconName: 'wrench', title: 'Anahtar Teslim', description: 'Keşiften ruhsata, kurulumdan dağıtım şirketi onayına tüm süreci biz yönetiyoruz.' },
  { iconName: 'leaf', title: 'Esnek Finansman', description: 'Banka kredisi, leasing veya peşin alternatifleri için uygun seçenekler sunuyoruz.' },
  { iconName: 'phone', title: '7/24 Destek Hattı', description: 'Mobil uygulama ile gerçek zamanlı izleme + uzman destek hattı her zaman aktif.' },
];
```

- [ ] **Step 7: process-mock.ts**

```ts
export interface MockProcessStep {
  number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  iconName: 'search' | 'file-text' | 'hammer' | 'activity';
}

export const PROCESS_MOCK: MockProcessStep[] = [
  { number: 1, title: 'Keşif & Analiz', description: 'Konumunuzu, çatınızı ve faturanızı inceleriz. Ücretsiz yerinde ya da uzaktan keşif.', iconName: 'search' },
  { number: 2, title: 'Detaylı Teklif', description: 'Sistem boyutu, geri ödeme süresi ve finansman seçeneklerini şeffaf raporla sunarız.', iconName: 'file-text' },
  { number: 3, title: 'Profesyonel Kurulum', description: 'Sertifikalı ekibimiz panelleri ve invertörü 1–2 günde kurar, dağıtım şirketi onayını alır.', iconName: 'hammer' },
  { number: 4, title: 'İzleme & Bakım', description: 'Mobil uygulama ile üretimi anlık izleyin; yıllık ücretsiz bakım garantisi ile gönül rahatlığı.', iconName: 'activity' },
];
```

- [ ] **Step 8: stats-mock.ts**

```ts
export interface MockStat {
  label: string;
  value: number;
  suffix: string;
}

export const STATS_MOCK: MockStat[] = [
  { label: 'Kurulu Güç', value: 28, suffix: ' MW' },
  { label: 'Mutlu Müşteri', value: 1450, suffix: '+' },
  { label: 'Tamamlanan Proje', value: 320, suffix: '+' },
  { label: 'Yıllık Tasarruf', value: 42, suffix: ' Milyon TL' },
];
```

- [ ] **Step 9: paths-mock.ts**

```ts
export interface MockPath {
  slug: 'konut' | 'isyeri' | 'tarim';
  title: string;
  description: string;
  iconName: 'home' | 'building-2' | 'sprout';
  href: string;
}

export const PATHS_MOCK: MockPath[] = [
  { slug: 'konut', title: 'Konutum İçin', description: 'Çatınıza özel sistem, faturanızı sıfıra indirelim.', iconName: 'home', href: '/teklif/al?tip=konut' },
  { slug: 'isyeri', title: 'İşyerim İçin', description: 'Ticari ve endüstriyel sistemler, KDV avantajı dahil.', iconName: 'building-2', href: '/teklif/al?tip=ticari' },
  { slug: 'tarim', title: 'Tarımım İçin', description: 'Pompaj ve sulama için güvenilir off-grid çözümler.', iconName: 'sprout', href: '/teklif/al?tip=tarim' },
];
```

- [ ] **Step 10: tsc kontrolü**

Run: `npx tsc --noEmit`
Expected: errors yok.

- [ ] **Step 11: Commit**

```bash
git add lib/data/
git commit -m "feat(home): add mock data sets for homepage sections"
```

---

## Task 4: CountUp component (intersection observer + Framer)

**Files:**
- Create: `components/ui/count-up.tsx`
- Test: `tests/components/ui/count-up.test.tsx`

- [ ] **Step 1: Failing test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CountUp } from '@/components/ui/count-up';

describe('CountUp', () => {
  beforeEach(() => {
    // IntersectionObserver mock — fire 'inView' immediately
    class IO {
      callback: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) { this.callback = cb; }
      observe(el: Element) {
        this.callback([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      disconnect() {}
      unobserve() {}
      takeRecords(): IntersectionObserverEntry[] { return []; }
      root = null; rootMargin = ''; thresholds = [];
    }
    vi.stubGlobal('IntersectionObserver', IO);
  });

  it('renders the final value once visible', async () => {
    render(<CountUp value={42} suffix=" MW" />);
    expect(await screen.findByText(/42\s*MW/)).toBeInTheDocument();
  });

  it('renders 0 initially when not intersecting', () => {
    class StaticIO {
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return []; }
      root = null; rootMargin = ''; thresholds = [];
    }
    vi.stubGlobal('IntersectionObserver', StaticIO);
    render(<CountUp value={42} suffix=" MW" />);
    expect(screen.getByText(/0\s*MW/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test fail olsun**

Run: `npm test -- tests/components/ui/count-up.test.tsx`
Expected: "Cannot find module".

- [ ] **Step 3: Implementation yaz**

`components/ui/count-up.tsx`:

```tsx
'use client';

import * as React from 'react';

interface CountUpProps {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export function CountUp({ value, suffix = '', durationMs = 1500, className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || started) return;
    const node = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            setStarted(true);
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / durationMs, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
              setDisplay(Math.round(eased * value));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, durationMs, started]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString('tr-TR')}{suffix}
    </span>
  );
}
```

- [ ] **Step 4: Test geçsin**

Run: `npm test -- tests/components/ui/count-up.test.tsx`
Expected: 2/2 PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/count-up.tsx tests/components/ui/count-up.test.tsx
git commit -m "feat(ui): add CountUp animation component"
```

---

## Task 5: Accordion primitive (Radix wrapper)

**Files:**
- Create: `components/ui/accordion.tsx`
- Test: `tests/components/ui/accordion.test.tsx`

- [ ] **Step 1: Failing test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

describe('Accordion', () => {
  it('expands and collapses an item', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>Soru 1</AccordionTrigger>
          <AccordionContent>Cevap içeriği</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: /Soru 1/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Cevap içeriği')).toBeVisible();
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation yaz**

`components/ui/accordion.tsx`:

```tsx
'use client';

import * as React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Accordion = RadixAccordion.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Item>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(({ className, ...props }, ref) => (
  <RadixAccordion.Item
    ref={ref}
    className={cn('border-b border-[var(--color-border-glass)]', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Header className="flex">
    <RadixAccordion.Trigger
      ref={ref}
      className={cn(
        'group flex w-full items-center justify-between py-5 text-left font-display text-lg font-medium transition-colors hover:text-[var(--color-brand)] data-[state=open]:text-[var(--color-brand)]',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Content>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className="overflow-hidden text-[var(--color-text-muted)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-5 pr-8 leading-relaxed', className)}>{children}</div>
  </RadixAccordion.Content>
));
AccordionContent.displayName = 'AccordionContent';
```

- [ ] **Step 4: Test geçsin**

Run: `npm test -- tests/components/ui/accordion.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/accordion.tsx tests/components/ui/accordion.test.tsx
git commit -m "feat(ui): add Radix Accordion wrapper"
```

---

## Task 6: NewsletterForm component

**Files:**
- Create: `components/ui/newsletter-form.tsx`
- Test: `tests/components/ui/newsletter-form.test.tsx`

- [ ] **Step 1: Failing test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NewsletterForm } from '@/components/ui/newsletter-form';

describe('NewsletterForm', () => {
  it('shows error for invalid email', async () => {
    const user = userEvent.setup();
    render(<NewsletterForm />);
    await user.type(screen.getByLabelText(/E-posta/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /Abone ol/i }));
    expect(await screen.findByText(/Geçerli bir e-posta/)).toBeInTheDocument();
  });

  it('calls onSubmit and shows success on valid email', async () => {
    const user = userEvent.setup();
    const handler = vi.fn().mockResolvedValue(undefined);
    render(<NewsletterForm onSubscribe={handler} />);
    await user.type(screen.getByLabelText(/E-posta/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /Abone ol/i }));
    expect(handler).toHaveBeenCalledWith('test@example.com');
    expect(await screen.findByText(/Aboneliğiniz alındı/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation yaz**

`components/ui/newsletter-form.tsx`:

```tsx
'use client';

import * as React from 'react';
import { Button } from './button';
import { Input } from './input';

interface Props {
  onSubscribe?: (email: string) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ onSubscribe }: Props) {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_REGEX.test(email)) {
      setError('Geçerli bir e-posta giriniz.');
      return;
    }
    setPending(true);
    try {
      if (onSubscribe) await onSubscribe(email);
      setSuccess(true);
      setEmail('');
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <p className="text-sm text-[var(--color-brand)]">
        Aboneliğiniz alındı. Teşekkürler!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
      <label className="sr-only" htmlFor="newsletter-email">E-posta</label>
      <Input
        id="newsletter-email"
        type="email"
        placeholder="ornek@firma.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!error}
        disabled={pending}
        aria-invalid={!!error}
      />
      <Button type="submit" disabled={pending}>
        {pending ? 'Gönderiliyor…' : 'Abone ol'}
      </Button>
      {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 4: Test geçsin**

Run: `npm test -- tests/components/ui/newsletter-form.test.tsx`
Expected: 2/2 PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/newsletter-form.tsx tests/components/ui/newsletter-form.test.tsx
git commit -m "feat(ui): add NewsletterForm with email validation"
```

---

## Task 7: ProductCard with 5-image slider

**Files:**
- Create: `components/ui/product-card.tsx`
- Test: `tests/components/ui/product-card.test.tsx`
- Modify: `next.config.ts` — placeholder SVG'lere izin (gerekmez, local SVG)

- [ ] **Step 1: Failing test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ProductCard } from '@/components/ui/product-card';
import { PRODUCTS_MOCK } from '@/lib/data/products-mock';

const sampleProduct = PRODUCTS_MOCK[0]!;

describe('ProductCard', () => {
  it('renders name, price and badges', () => {
    render(<ProductCard product={sampleProduct} />);
    expect(screen.getByText(sampleProduct.name)).toBeInTheDocument();
    expect(screen.getByText(/6\.900/)).toBeInTheDocument();
    expect(screen.getByText('Çok Satan')).toBeInTheDocument();
  });

  it('shows "Stokta yok" + "Gelince Haber Ver" when out of stock', () => {
    const outOfStock = { ...sampleProduct, inStock: false, badges: [] as never[] };
    render(<ProductCard product={outOfStock} />);
    expect(screen.getByText(/Stokta yok/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gelince Haber Ver/i })).toBeInTheDocument();
  });

  it('cycles through images via next/prev controls', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={sampleProduct} />);
    const next = screen.getByRole('button', { name: /Sonraki görsel/i });
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('placeholder-panel-1'));
    await user.click(next);
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('placeholder-panel-2'));
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation yaz**

`components/ui/product-card.tsx`:

```tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BellPlus } from 'lucide-react';
import type { MockProduct } from '@/lib/data/products-mock';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Props {
  product: MockProduct;
  className?: string;
}

const priceFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });

export function ProductCard({ product, className }: Props) {
  const [idx, setIdx] = React.useState(0);
  const total = product.images.length;

  function prev() {
    setIdx((i) => (i - 1 + total) % total);
  }
  function next() {
    setIdx((i) => (i + 1) % total);
  }

  const currentImage = product.images[idx] ?? product.images[0];

  return (
    <article
      className={cn(
        'glass group relative flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/30',
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg-overlay)]">
        {currentImage && (
          <Image
            src={currentImage}
            alt={`${product.name} görseli ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Önceki görsel"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Sonraki görsel"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {product.images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    i === idx ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-text-muted)]/40'
                  )}
                />
              ))}
            </div>
          </>
        )}

        {product.badges.length > 0 && (
          <ul className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.badges.map((b) => (
              <li
                key={b}
                className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--color-bg-base)]"
              >
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-medium leading-tight">{product.name}</h3>
        <p className="font-mono text-lg font-semibold text-[var(--color-brand)]">
          {priceFmt.format(product.priceTry)}
        </p>
        <div className="mt-auto pt-2">
          {product.inStock ? (
            <Button asChild size="sm" className="w-full">
              <Link href={`/magaza/${product.slug}`}>İncele</Link>
            </Button>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)]">Stokta yok</p>
              <Button type="button" variant="secondary" size="sm" className="w-full">
                <BellPlus className="h-4 w-4" />
                Gelince Haber Ver
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Placeholder SVG'leri oluştur**

`public/images/placeholder-panel-1.svg` ile `placeholder-panel-5.svg` (basit gradient + güneş ikonu). Ayrıca `placeholder-project-1.svg`–`6.svg`. Birer örnek:

```bash
mkdir -p public/images
cat > public/images/placeholder-panel-1.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#202020"/><stop offset="1" stop-color="#0F0F0F"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><g stroke="#5DD62C" stroke-width="2" fill="none"><rect x="80" y="80" width="240" height="240" rx="8"/><line x1="80" y1="160" x2="320" y2="160"/><line x1="80" y1="240" x2="320" y2="240"/><line x1="160" y1="80" x2="160" y2="320"/><line x1="240" y1="80" x2="240" y2="320"/></g><circle cx="200" cy="200" r="32" fill="#5DD62C" opacity=".4"/></svg>
EOF
```

(Plan executor: 5 panel + 6 project varyantları için sadece accent rengini ya da ikonun pozisyonunu değiştir.)

- [ ] **Step 5: Test geçsin**

Run: `npm test -- tests/components/ui/product-card.test.tsx`
Expected: 3/3 PASS.

- [ ] **Step 6: Commit**

```bash
git add components/ui/product-card.tsx tests/components/ui/product-card.test.tsx public/images/
git commit -m "feat(ui): add ProductCard with 5-image slider and placeholder images"
```

---

## Task 8: Hero — savings widget (interactive)

**Files:**
- Create: `components/home/hero-savings-widget.tsx`
- Test: `tests/components/home/hero-savings-widget.test.tsx`

- [ ] **Step 1: Failing test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { HeroSavingsWidget } from '@/components/home/hero-savings-widget';

describe('HeroSavingsWidget', () => {
  it('computes estimate when user fills bill and selects city', async () => {
    const user = userEvent.setup();
    render(<HeroSavingsWidget />);
    await user.type(screen.getByLabelText(/Aylık fatura/i), '800');
    await user.selectOptions(screen.getByLabelText(/Şehir/i), 'İstanbul');
    await user.click(screen.getByRole('button', { name: /Hesapla/i }));
    expect(await screen.findByText(/Tahmini sistem.*kWp/i)).toBeInTheDocument();
    expect(screen.getByText(/Yıllık tasarruf/i)).toBeInTheDocument();
    expect(screen.getByText(/Geri ödeme/i)).toBeInTheDocument();
  });

  it('shows validation error for empty bill', async () => {
    const user = userEvent.setup();
    render(<HeroSavingsWidget />);
    await user.click(screen.getByRole('button', { name: /Hesapla/i }));
    expect(await screen.findByText(/Aylık faturanızı/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation yaz**

`components/home/hero-savings-widget.tsx`:

```tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IRRADIANCE, findIrradiance } from '@/lib/data/irradiance';
import { estimateSystem, annualSavings, paybackYears } from '@/lib/calculator';

interface Result {
  systemKwp: number;
  savingsTry: number;
  paybackYears: number;
}

const tryFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

export function HeroSavingsWidget() {
  const [bill, setBill] = React.useState('');
  const [city, setCity] = React.useState('İstanbul');
  const [result, setResult] = React.useState<Result | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function handleCompute(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const billNum = Number(bill.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!billNum || billNum <= 0) {
      setError('Aylık faturanızı TL cinsinden giriniz.');
      setResult(null);
      return;
    }
    const irr = findIrradiance(city);
    const kwp = estimateSystem({ monthlyBillTry: billNum, irradiance: irr });
    const sav = annualSavings({ systemKwp: kwp, irradiance: irr });
    const yrs = paybackYears({ systemKwp: kwp, annualSavingsTry: sav });
    setResult({ systemKwp: kwp, savingsTry: sav, paybackYears: yrs });
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-[var(--shadow-glass)]">
      <h3 className="mb-1 font-display text-xl font-semibold">Tasarrufunuzu hesaplayın</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        Aylık faturanızı yazın, sizi 30 saniyede bilgilendirelim.
      </p>

      <form onSubmit={handleCompute} className="space-y-3" noValidate>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="bill">Aylık fatura (TL)</label>
          <Input
            id="bill"
            inputMode="numeric"
            placeholder="örn. 800"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            error={!!error}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="city">Şehir</label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            {IRRADIANCE.map((r) => (
              <option key={r.province} value={r.province}>{r.province}</option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">Hesapla</Button>
        {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
      </form>

      {result && (
        <dl className="mt-5 space-y-3 border-t border-[var(--color-border-glass)] pt-4">
          <div className="flex justify-between font-mono">
            <dt className="text-sm text-[var(--color-text-muted)]">Tahmini sistem</dt>
            <dd className="text-base font-semibold text-[var(--color-brand)]">{numFmt.format(result.systemKwp)} kWp</dd>
          </div>
          <div className="flex justify-between font-mono">
            <dt className="text-sm text-[var(--color-text-muted)]">Yıllık tasarruf</dt>
            <dd className="text-base font-semibold">{tryFmt.format(result.savingsTry)}</dd>
          </div>
          <div className="flex justify-between font-mono">
            <dt className="text-sm text-[var(--color-text-muted)]">Geri ödeme</dt>
            <dd className="text-base font-semibold">{numFmt.format(result.paybackYears)} yıl</dd>
          </div>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/teklif/al">Detaylı teklif al</Link>
          </Button>
        </dl>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Test geçsin**

Run: `npm test -- tests/components/home/hero-savings-widget.test.tsx`
Expected: 2/2 PASS.

- [ ] **Step 5: Commit**

```bash
git add components/home/hero-savings-widget.tsx tests/components/home/hero-savings-widget.test.tsx
git commit -m "feat(home): add hero savings widget"
```

---

## Task 9: Hero section (slogan + CTA + widget + watermark)

**Files:**
- Create: `components/home/hero.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/hero.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSavingsWidget } from './hero-savings-widget';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border-glass)] py-16 sm:py-24" aria-labelledby="hero-heading">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={600}
          height={600}
          className="opacity-[0.04] dark:opacity-[0.06]"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-[var(--color-brand-glow)] blur-3xl"
      />

      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-glass)] bg-[var(--color-bg-glass)] px-4 py-1 text-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]" />
            Anahtar teslim güneş enerjisi
          </span>
          <h1
            id="hero-heading"
            className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          >
            Güneşten geleceğe — <span className="text-[var(--color-brand)]">Zolarr</span> ile.
          </h1>
          <p className="max-w-xl text-lg text-[var(--color-text-muted)]">
            Türkiye&apos;nin her yerinde konut, ticari ve tarımsal güneş enerjisi sistemleri.
            Keşiften kuruluma ve 25 yıl üretim garantisine kadar tek elden.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/teklif/al">
                Ücretsiz teklif al
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="#tasarruf">
                <Calculator className="h-5 w-5" />
                Tasarrufumu hesapla
              </Link>
            </Button>
          </div>
        </div>

        <div id="tasarruf">
          <HeroSavingsWidget />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build kontrolü**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add components/home/hero.tsx
git commit -m "feat(home): add hero section with savings widget and watermark"
```

---

## Task 10: 3 Yol Kartı bölümü (Konut/İşyeri/Tarım)

**Files:**
- Create: `components/home/path-cards.tsx`
- Test: `tests/components/home/path-cards.test.tsx`

- [ ] **Step 1: Failing test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PathCards } from '@/components/home/path-cards';

describe('PathCards', () => {
  it('renders three path cards with hrefs', () => {
    render(<PathCards />);
    expect(screen.getByRole('link', { name: /Konutum İçin/i })).toHaveAttribute('href', '/teklif/al?tip=konut');
    expect(screen.getByRole('link', { name: /İşyerim İçin/i })).toHaveAttribute('href', '/teklif/al?tip=ticari');
    expect(screen.getByRole('link', { name: /Tarımım İçin/i })).toHaveAttribute('href', '/teklif/al?tip=tarim');
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation yaz**

`components/home/path-cards.tsx`:

```tsx
import Link from 'next/link';
import { Home, Building2, Sprout, ArrowRight } from 'lucide-react';
import { PATHS_MOCK } from '@/lib/data/paths-mock';

const ICONS = { home: Home, 'building-2': Building2, sprout: Sprout } as const;

export function PathCards() {
  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="paths-heading">
      <h2 id="paths-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">
        Hangi yoldan başlamak istersiniz?
      </h2>
      <p className="mb-10 max-w-2xl text-[var(--color-text-muted)]">
        İhtiyacınıza uygun teklif akışını seçin; sizi 24 saat içinde uzman bir mühendisle eşleştirelim.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {PATHS_MOCK.map((p) => {
          const Icon = ICONS[p.iconName];
          return (
            <Link
              key={p.slug}
              href={p.href}
              className="glass group flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40 hover:shadow-[var(--shadow-glow)]"
              aria-label={p.title}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mb-6 flex-1 text-sm text-[var(--color-text-muted)]">{p.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand)] transition-transform group-hover:translate-x-1">
                Devam et
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Test geçsin**

Run: `npm test -- tests/components/home/path-cards.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/home/path-cards.tsx tests/components/home/path-cards.test.tsx
git commit -m "feat(home): add 3 path cards (Konut/İşyeri/Tarım)"
```

---

## Task 11: Neden Zolarr? (6 fayda kartı)

**Files:**
- Create: `components/home/why-zolarr.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/why-zolarr.tsx`:

```tsx
import { ShieldCheck, Zap, Wrench, Leaf, Phone, BadgePercent } from 'lucide-react';
import { BENEFITS_MOCK } from '@/lib/data/benefits-mock';

const ICONS = {
  'shield-check': ShieldCheck,
  zap: Zap,
  wrench: Wrench,
  leaf: Leaf,
  phone: Phone,
  'badge-percent': BadgePercent,
} as const;

export function WhyZolarr() {
  return (
    <section className="border-t border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 py-16" aria-labelledby="why-heading">
      <div className="container mx-auto px-4">
        <h2 id="why-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">Neden Zolarr?</h2>
        <p className="mb-10 max-w-2xl text-[var(--color-text-muted)]">
          Sade bir teklifin ardındaki 6 nedenle başlayın.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS_MOCK.map((b) => {
            const Icon = ICONS[b.iconName];
            return (
              <article key={b.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-base)] p-6 transition-colors hover:border-[var(--color-brand)]/40">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 font-display text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{b.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: tsc kontrolü** (Run: `npx tsc --noEmit`)

- [ ] **Step 3: Commit**

```bash
git add components/home/why-zolarr.tsx
git commit -m "feat(home): add Why Zolarr section with 6 benefits"
```

---

## Task 12: Çalışma Süreci (4 adım, scroll-triggered)

**Files:**
- Create: `components/home/process-timeline.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/process-timeline.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import { Search, FileText, Hammer, Activity } from 'lucide-react';
import { PROCESS_MOCK } from '@/lib/data/process-mock';

const ICONS = { search: Search, 'file-text': FileText, hammer: Hammer, activity: Activity } as const;

export function ProcessTimeline() {
  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="process-heading">
      <h2 id="process-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">
        4 adımda anahtar teslim
      </h2>
      <p className="mb-10 max-w-2xl text-[var(--color-text-muted)]">
        Süreci size anlatalım — her aşama şeffaf ve takip edilebilir.
      </p>
      <ol className="grid gap-6 md:grid-cols-4">
        {PROCESS_MOCK.map((s, i) => {
          const Icon = ICONS[s.iconName];
          return (
            <motion.li
              key={s.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass relative rounded-2xl p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-[var(--color-brand)]">
                  {String(s.number).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-brand)]/40 to-transparent" />
                <Icon className="h-5 w-5 text-[var(--color-brand)]" aria-hidden />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{s.description}</p>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/home/process-timeline.tsx
git commit -m "feat(home): add 4-step process timeline with scroll animation"
```

---

## Task 13: Stoktaki Ürünler grid'i

**Files:**
- Create: `components/home/stock-products.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/stock-products.tsx`:

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ui/product-card';
import { PRODUCTS_MOCK } from '@/lib/data/products-mock';

export function StockProducts() {
  const stock = PRODUCTS_MOCK.filter((p) => p.inStock).slice(0, 8);

  return (
    <section className="border-t border-[var(--color-border-glass)] py-16" aria-labelledby="stock-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="stock-heading" className="font-display text-3xl font-bold sm:text-4xl">
              Stoktaki ürünler
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Hemen kargolanmaya hazır panel, invertör ve batarya seçenekleri.
            </p>
          </div>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/magaza">
              Tüm ürünler
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {stock.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="secondary">
            <Link href="/magaza">Tüm ürünler</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/home/stock-products.tsx
git commit -m "feat(home): add stock products grid (8 cards)"
```

---

## Task 14: Ürün/Kampanya yatay slider

**Files:**
- Create: `components/home/product-slider.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/product-slider.tsx`:

```tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CAMPAIGNS_MOCK } from '@/lib/data/campaigns-mock';
import { Button } from '@/components/ui/button';

export function ProductSlider() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: 'start', dragFree: true });

  const scrollPrev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = React.useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="border-t border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 py-16" aria-labelledby="campaigns-heading">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="campaigns-heading" className="font-display text-3xl font-bold sm:text-4xl">
              Öne çıkan ürün ve kampanyalar
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Sınırlı süreli fırsatları kaçırmayın.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button type="button" variant="icon" size="icon" onClick={scrollPrev} aria-label="Önceki">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button type="button" variant="icon" size="icon" onClick={scrollNext} aria-label="Sonraki">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex gap-4">
            {CAMPAIGNS_MOCK.map((c) => (
              <li
                key={c.slug}
                className="glass group relative flex min-w-[260px] flex-col gap-2 rounded-2xl p-6 sm:min-w-[320px]"
              >
                <span className="inline-flex w-fit rounded-full bg-[var(--color-brand)]/15 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
                  {c.badge}
                </span>
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <p className="flex-1 text-sm text-[var(--color-text-muted)]">{c.subtitle}</p>
                <Button asChild size="sm" className="mt-2 w-fit">
                  <Link href={c.href}>{c.cta}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: build + commit**

```bash
npm run build
git add components/home/product-slider.tsx
git commit -m "feat(home): add product/campaign horizontal slider via embla"
```

---

## Task 15: Teklif Önizleme bölümü (fade carousel)

**Files:**
- Create: `components/home/quote-preview.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/quote-preview.tsx`:

```tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
  { src: '/images/placeholder-project-1.svg', alt: 'Konut çatı GES kurulumu' },
  { src: '/images/placeholder-project-2.svg', alt: 'Ticari fabrika çatısı' },
  { src: '/images/placeholder-project-3.svg', alt: 'Tarımsal sera sulama' },
];

export function QuotePreview() {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center" aria-labelledby="quote-heading">
      <div className="space-y-6">
        <h2 id="quote-heading" className="font-display text-3xl font-bold sm:text-4xl">
          Bize söyleyin, biz sizin yerinize hesaplayalım.
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Konum, çatınız ve faturanızı paylaşın; uzman mühendislerimiz sistem boyutunu, geri ödeme süresini
          ve finansman seçeneklerini şeffaf bir raporla sunsun.
        </p>
        <Button asChild size="lg">
          <Link href="/teklif/al">
            Detaylı Teklif Al
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--color-border-glass)]">
        <AnimatePresence mode="wait">
          {SLIDES.map((s, i) =>
            i === idx ? (
              <motion.div
                key={s.src}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Image src={s.src} alt={s.alt} fill className="object-cover" />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={
                i === idx
                  ? 'h-1.5 w-6 rounded-full bg-[var(--color-brand)] transition-all'
                  : 'h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)]/40 transition-all'
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: build + commit**

```bash
npm run build
git add components/home/quote-preview.tsx
git commit -m "feat(home): add quote preview with fade carousel"
```

---

## Task 16: Son Projeler bölümü

**Files:**
- Create: `components/home/recent-projects.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/recent-projects.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PROJECTS_MOCK } from '@/lib/data/projects-mock';

export function RecentProjects() {
  return (
    <section className="border-t border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 py-16" aria-labelledby="projects-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="projects-heading" className="font-display text-3xl font-bold sm:text-4xl">Son projeler</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Konut, ticari ve tarımsal kurulumlardan örnekler.</p>
          </div>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/galeri">
              Tüm projeleri gör
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS_MOCK.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/galeri/${p.slug}`}
                className="glass group block overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image src={p.coverImage} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--color-bg-base)]/80 px-3 py-1 font-mono text-xs">{p.type}</span>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-display text-base font-semibold">{p.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {p.location} · <span className="font-mono text-[var(--color-brand)]">{p.capacityKwp} kWp</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="secondary">
            <Link href="/galeri">Tüm projeleri gör</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: build + commit**

```bash
npm run build
git add components/home/recent-projects.tsx
git commit -m "feat(home): add recent projects section (6 cards)"
```

---

## Task 17: Sayılarla Zolarr

**Files:**
- Create: `components/home/stats-counters.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/stats-counters.tsx`:

```tsx
import { CountUp } from '@/components/ui/count-up';
import { STATS_MOCK } from '@/lib/data/stats-mock';

export function StatsCounters() {
  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="mb-10 font-display text-3xl font-bold sm:text-4xl">
        Sayılarla Zolarr
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_MOCK.map((s) => (
          <li key={s.label} className="glass rounded-2xl p-6">
            <p className="font-mono text-4xl font-bold text-[var(--color-brand)]">
              <CountUp value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{s.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/home/stats-counters.tsx
git commit -m "feat(home): add animated stats counters"
```

---

## Task 18: Müşteri Yorumları (embla carousel)

**Files:**
- Create: `components/home/testimonials.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/testimonials.tsx`:

```tsx
'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS_MOCK } from '@/lib/data/testimonials-mock';
import { Button } from '@/components/ui/button';

export function Testimonials() {
  const [ref, embla] = useEmblaCarousel({ loop: true, align: 'start' });

  const prev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const next = React.useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="border-t border-[var(--color-border-glass)] py-16" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="testimonials-heading" className="font-display text-3xl font-bold sm:text-4xl">
              Müşterilerimiz ne diyor?
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Türkiye genelinden 1.450+ memnun müşteri.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button type="button" variant="icon" size="icon" onClick={prev} aria-label="Önceki">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button type="button" variant="icon" size="icon" onClick={next} aria-label="Sonraki">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div ref={ref} className="overflow-hidden">
          <ul className="flex gap-4">
            {TESTIMONIALS_MOCK.map((t) => (
              <li key={t.name} className="glass min-w-[280px] rounded-2xl p-6 sm:min-w-[360px]">
                <Quote className="mb-3 h-6 w-6 text-[var(--color-brand)]" aria-hidden />
                <p className="mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between border-t border-[var(--color-border-glass)] pt-3">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t.role} · {t.city}</p>
                  </div>
                  <div className="flex gap-0.5" aria-label={`${t.rating} yıldız`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[var(--color-brand)] text-[var(--color-brand)]" />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: build + commit**

```bash
npm run build
git add components/home/testimonials.tsx
git commit -m "feat(home): add customer testimonials carousel"
```

---

## Task 19: SSS Accordion

**Files:**
- Create: `components/home/faq-accordion.tsx`
- Test: `tests/components/home/faq-accordion.test.tsx`

- [ ] **Step 1: Failing test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from '@/components/home/faq-accordion';

describe('FaqAccordion', () => {
  it('renders 5 questions and reveals answer on click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion />);
    const triggers = screen.getAllByRole('button');
    expect(triggers.length).toBe(5);
    await user.click(triggers[0]!);
    expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
  });
});
```

- [ ] **Step 2: Test fail olsun**

- [ ] **Step 3: Implementation yaz**

`components/home/faq-accordion.tsx`:

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { FAQ_MOCK } from '@/lib/data/faq-mock';

export function FaqAccordion() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-16" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">
        Sık sorulan sorular
      </h2>
      <p className="mb-8 text-[var(--color-text-muted)]">
        En çok merak edilen 5 başlık. Daha fazlası için <Link className="text-[var(--color-brand)] underline" href="/sss">SSS sayfası</Link>.
      </p>
      <Accordion type="single" collapsible className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
        {FAQ_MOCK.map((q, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{q.question}</AccordionTrigger>
            <AccordionContent>{q.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-6 text-center">
        <Button asChild variant="secondary">
          <Link href="/sss">
            Tüm sorular
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Test geçsin**

Run: `npm test -- tests/components/home/faq-accordion.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/home/faq-accordion.tsx tests/components/home/faq-accordion.test.tsx
git commit -m "feat(home): add FAQ accordion (5 Q)"
```

---

## Task 20: CTA Bandı + Newsletter

**Files:**
- Create: `components/home/cta-newsletter.tsx`

- [ ] **Step 1: Implementation yaz**

`components/home/cta-newsletter.tsx`:

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsletterForm } from '@/components/ui/newsletter-form';

export function CtaNewsletter() {
  return (
    <section className="border-t border-[var(--color-border-glass)] bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-base)] py-16" aria-labelledby="cta-heading">
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h2 id="cta-heading" className="font-display text-3xl font-bold sm:text-4xl">
            Faturanızdan kurtulmak için <span className="text-[var(--color-brand)]">bugün</span> başlayın.
          </h2>
          <p className="max-w-xl text-[var(--color-text-muted)]">
            Ücretsiz keşif ve teklif sürecimiz 24 saat içinde başlar. Yatırımınız ortalama 4-6 yılda
            kendini öder, sonrasında 25 yıl kâra geçer.
          </p>
          <Button asChild size="lg">
            <Link href="/teklif/al">
              Ücretsiz Teklif Al
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="glass space-y-3 rounded-2xl p-6">
          <h3 className="font-display text-xl font-semibold">Gelişmelerden haberdar olun</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Yeni kampanyalar ve enerji ipuçları için bültenimize abone olun. (Pazarlama metni KVKK kapsamındadır; istediğiniz zaman çıkabilirsiniz.)
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add components/home/cta-newsletter.tsx
git commit -m "feat(home): add CTA banner with newsletter signup"
```

---

## Task 21: app/page.tsx assemble + smoke test

**Files:**
- Modify: `app/page.tsx`
- Modify: `tests/app/page.test.tsx` (eğer mevcut Faz 0+1 smoke test'i bu pathde varsa onu güncelle)

- [ ] **Step 1: app/page.tsx'i tüm bölümlerle değiştir**

```tsx
import { Hero } from '@/components/home/hero';
import { ProductSlider } from '@/components/home/product-slider';
import { PathCards } from '@/components/home/path-cards';
import { WhyZolarr } from '@/components/home/why-zolarr';
import { ProcessTimeline } from '@/components/home/process-timeline';
import { StockProducts } from '@/components/home/stock-products';
import { QuotePreview } from '@/components/home/quote-preview';
import { RecentProjects } from '@/components/home/recent-projects';
import { StatsCounters } from '@/components/home/stats-counters';
import { Testimonials } from '@/components/home/testimonials';
import { FaqAccordion } from '@/components/home/faq-accordion';
import { CtaNewsletter } from '@/components/home/cta-newsletter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductSlider />
      <PathCards />
      <WhyZolarr />
      <ProcessTimeline />
      <StockProducts />
      <QuotePreview />
      <RecentProjects />
      <StatsCounters />
      <Testimonials />
      <FaqAccordion />
      <CtaNewsletter />
    </>
  );
}
```

- [ ] **Step 2: Smoke test yaz/güncelle**

`tests/app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '@/app/page';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));
vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), { scrollPrev: vi.fn(), scrollNext: vi.fn() }],
}));

describe('HomePage', () => {
  it('renders all 12 main section landmarks', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: /Güneşten geleceğe/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hangi yoldan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Neden Zolarr/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /4 adımda/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Stoktaki ürünler/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bize söyleyin/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Son projeler/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sayılarla Zolarr/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Müşterilerimiz ne diyor/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sık sorulan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Faturanızdan kurtulmak/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Tüm test paketini çalıştır**

Run: `npm test`
Expected: tüm testler PASS (önceki 29 + yeni eklenenler).

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: success, type errors yok, lint warnings minimum.

- [ ] **Step 5: Manuel QA listesi (kullanıcı için not)**

`docs/superpowers/plans/2026-05-06-faz-2-qa-checklist.md` oluştur (kısa):

```md
# Faz 2 QA Checklist

- [ ] Hero scroll yumuşak, watermark görünür
- [ ] Tasarruf widget: 800 TL + İstanbul → ~2.4 kWp, ~9.600 TL/yıl
- [ ] Slider sürükle/scroll çalışıyor (mobile + desktop)
- [ ] 3 yol kartı linkleri /teklif/al?tip= ile gidiyor (404 normal, Faz 4'te dolacak)
- [ ] Process timeline scroll'da fade-in
- [ ] Stock product card hover → resim slider okları görünür
- [ ] FAQ accordion açılıp kapanıyor
- [ ] Newsletter geçersiz e-posta → kırmızı uyarı
- [ ] Tema toggle ışığı açıp kapadığında tüm bölümlerde okunaklı
- [ ] Mobile (~375px) hero CTA'lar wrap, slider swipe çalışıyor
- [ ] prefers-reduced-motion açıkken animasyonlar minimum
```

- [ ] **Step 6: Final commit**

```bash
git add app/page.tsx tests/app/page.test.tsx docs/superpowers/plans/2026-05-06-faz-2-qa-checklist.md
git commit -m "feat(home): assemble homepage with all 12 sections + smoke test"
```

---

## Self-Review

**Spec coverage (5.2):**
- (1) Hero + tasarruf hesaplayıcı → Task 8+9 ✓
- (2) Ürün/kampanya yatay slider → Task 14 ✓
- (3) 3 yol kartı → Task 10 ✓
- (4) Neden Zolarr (6 fayda) → Task 11 ✓
- (5) Çalışma süreci (4 adım) → Task 12 ✓
- (6) Stoktaki ürünler grid (5-image slider) → Task 7+13 ✓
- (7) Teklif önizleme (fade carousel) → Task 15 ✓
- (8) Son projeler → Task 16 ✓
- (9) Sayılarla Zolarr (CountUp) → Task 4+17 ✓
- (10) Yorumlar carousel → Task 18 ✓
- (11) SSS accordion → Task 5+19 ✓
- (12) CTA bandı + Newsletter → Task 6+20 ✓
- Watermark logo → Task 9 ✓
- Hesaplama formülleri spec §15 → Task 1 ✓

**Placeholder scan:** Yok — tüm task'larda kod tam.

**Type consistency:** `MockProduct.images` Task 3'te string[], Task 7'de aynı tip kullanılıyor. `IRRADIANCE` field adı `kWhPerM2Year` her yerde tutarlı. `findIrradiance` Task 2'de signature, Task 8'de aynı tüketim ile kullanılıyor.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-06-faz-2-anasayfa.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Her task için fresh subagent, aralarında review, hızlı iterasyon.

**2. Inline Execution** — Bu oturumda task'ları batch'lerle yürüt + checkpoint'lerde gözden geçir.

**Hangisini istersiniz?**
