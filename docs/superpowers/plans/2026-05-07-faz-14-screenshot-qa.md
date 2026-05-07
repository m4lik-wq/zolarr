# Faz 14 — Screenshot QA Loop (Light + Dark Mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox.

> **Status:** YAPISAL TASLAK — sıra geldiğinde detay seviyesinde genişletilecek. Faz 13 bittikten sonra başlanır.

**Goal:** Tüm sayfaları (public + admin) hem light hem dark mode'da Playwright ile screenshot al, AI (Claude Opus) ile her ekranı görsel olarak gözden geçir: taşma, üst üste binme, eksik element, kontrast/okunabilirlik problemleri tespit et ve düzelt. Mükemmeliyetçi pass.

**Architecture:**
- **Playwright** headless Chromium screenshot
- Her sayfa 3 viewport: mobile (375), tablet (768), desktop (1440)
- Her viewport × 2 tema = 6 görüntü/sayfa
- Screenshots `screenshots/<route-slug>/<theme>-<viewport>.png` altına
- AI (Claude Opus 4.7 — bu model, multimodal) screenshot'ları okuyup issue listesi çıkarır
- Issue → fix loop: AI + subagent, her fix sonrası ilgili sayfa yeniden screenshot
- Final pass: tüm issues kapalı + son rapor

**Tech Stack:**
- `@playwright/test` (yeni)
- `playwright` Chromium binary
- Mevcut: dev server (npm run dev), Tailwind dark/light mode, next-themes

**Sayfa listesi (yaklaşık 30 ekran):**
- Public: `/`, `/magaza`, `/magaza/[slug]`, `/teklif/al`, `/teklif/ver`, `/galeri`, `/galeri/[slug]`, `/hakkimizda`, `/iletisim`, `/sss`, `/ayarlar`, `/ayarlar/eposta`, `/giris`, `/kayit`, `/sifremi-unuttum`, `/kvkk`
- Auth: `/hesap`, `/hesap/profil`, `/hesap/teklifler`, `/hesap/favoriler`, `/hesap/bildirimler`, `/hesap/kvkk`, `/hesap/kvkk/sil`, `/eposta/cik`
- Admin: `/admin`, `/admin/teklifler`, `/admin/teklifler/[id]`, `/admin/bayiler`, `/admin/bayiler/[id]`, `/admin/iletisim`, `/admin/iletisim/[id]`, `/admin/kullanicilar`, `/admin/urunler`, `/admin/urunler/yeni`, `/admin/urunler/[id]`, `/admin/kategoriler`, `/admin/kategoriler/yeni`, `/admin/kategoriler/[id]`, `/admin/projeler`, `/admin/projeler/yeni`, `/admin/projeler/[id]`, `/admin/sss`, `/admin/sss/yeni`, `/admin/sss/[id]`, `/admin/tedarikciler`, `/admin/tedarikciler/yeni`, `/admin/tedarikciler/[id]`, `/admin/ai`

≈48 ekran × 3 viewport × 2 tema = ~288 screenshot. Çok fazla — selektif yaklaşım gerekli (Task 3'te detayda).

**Tahmini task: 8**

---

## Task 1: Playwright kurulum + screenshot script altyapısı

- Install: `npm install --save-dev @playwright/test`
- `npx playwright install chromium` (one-time)
- `scripts/screenshot.ts`: dev server'a bağlanır, route gez, screenshot kaydet
- `scripts/screenshot-config.json`: route listesi + auth gerektirenler için cookie inject

## Task 2: Auth simülasyonu

Admin sayfaları için login yapıp session cookie ile screenshot al. Dev modda test admin user kullanan bir helper.

## Task 3: Selective viewport stratejisi

288 screenshot maliyetli — pragmatik:
- **Mobile (375)** + **Desktop (1440)**: tüm sayfalar
- **Tablet (768)**: sadece grid-heavy sayfalar (admin tabloları, galeri)
- 2 tema × ~48 sayfa × 2 viewport = ~192 screenshot. Hâlâ çok ama yönetilebilir.

İlk pass'ta sadece desktop + dark olarak başla, kritik issue'ları çöz, sonra mobile + light eklenir.

## Task 4: Issue detection (AI review)

AI (Claude Opus) her screenshot'ı `Read` tool ile inceleyip issue listesi çıkarır:
- Layout taşması (overflow-x scroll)
- Element üst üste binmesi
- Kontrast yetersizliği (WCAG AA)
- Truncate/overflow text
- Mobile'da ezilmiş button/form
- Dark mode'da yanlış renkli element (örn. beyaz arka plan gri text)

Output: `docs/qa/screenshots-issues-<date>.md` — her sayfa için bullet liste.

## Task 5: Issue triage

Her issue: `severity: critical|major|minor`, `effort: 1-5`. Critical+major fix list'e alınır, minor backlog'a.

## Task 6: Fix loop

Her major issue için:
1. Subagent dispatch: "Sayfa X'te şu issue var, fix et"
2. Fix sonrası sadece o sayfanın screenshot'larını yenile
3. AI re-review: kapandı mı?
4. Kapandı işaretle, kapanmadıysa retry

## Task 7: Mobile-only pass

Desktop temizlendikten sonra mobile pass: aynı loop, mobile-spesifik issues.

## Task 8: Completion report

`docs/superpowers/plans/2026-05-07-faz-14-completion.md`:
- Toplam screenshot sayısı
- Tespit edilen issue sayısı (severity dağılımı)
- Çözülen vs deferred
- Light/dark her iki temada işlevsel olduğunun teyidi

---

## Bilinen Riskler

- **Auth flow**: admin sayfalarına otomatize giriş Playwright'ın CSRF/session ile uğraşması gerekiyor. Workaround: Supabase test user için session cookie'yi pre-fetch.
- **Dynamic content**: Veriye göre değişen sayfalar (teklif detay, kullanıcı listesi) screenshot tutarsızlığı. Workaround: seed test data.
- **Screenshot diff**: Önceki vs şimdiki karşılaştırmaya gerek yok — biz issue arıyoruz, regression değil.
- **Token maliyeti**: AI'ın 192 screenshot okuması pahalı. Selective batching + skip "looks fine" kararıyla.
- **`/admin/ai` ve diğer dynamic-data sayfalar**: empty state'de farklı, dolu state'de farklı. Her iki state için screenshot.

## Kapsam Dışı

- Cross-browser (sadece Chromium)
- A11y audit (Lighthouse / axe-core) — ayrı faz
- Performance audit
- Internationalization (sadece tr-TR)
- Visual regression testing (CI gating)
