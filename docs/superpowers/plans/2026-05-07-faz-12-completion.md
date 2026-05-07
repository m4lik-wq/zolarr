# Faz 12 — Recharts Admin Dashboard — Completion Report

**Tarih:** 2026-05-07
**Plan:** `docs/superpowers/plans/2026-05-07-faz-12-admin-charts.md` (8 task)
**Commit aralığı:** `9a68ad1 → 23d64de` (7 feat commit + 1 doc commit)
**Test:** 223/223 (Vitest, 66 dosya) — Faz 11 sonu 219'du, +4 yeni test
**Build:** Temiz (Next.js 16.2.4 Turbopack)

## Tamamlanan Task'lar

| # | Task | Commit | Yeni test |
|---|---|---|---|
| 1 | recharts kurulumu | `9a68ad1` | — |
| 2 | timeseries query'leri + fillMissingDays util | `b57670c` | 4 |
| 3 | topCitiesQuotes query | `52a7352` | — |
| 4 | ChartCard wrapper | `00a28f1` | — |
| 5 | TimeSeriesChart client component | `3d88737` | — |
| 6 | CityBarChart client component | `be36be0` | — |
| 7 | RangePicker + dashboard güncelleme | `23d64de` | — |
| 8 | Verifikasyon + bu rapor | (bu commit) | — |

## Yeni Yetenekler

### 1. Zaman serisi grafikleri
- **Teklif talepleri** (yeşil — marka rengi)
- **Bayi başvuruları** (mavi)
- **İletişim mesajları** (sarı)
- **Yeni kayıtlar** (mor)

Her biri son N gün için günlük çizgi grafiği. Eksik günler 0 ile dolduruluyor (sürekli çizgi).

### 2. Şehir bar chart
"En çok talep gelen şehirler" — son N gün için ilk 8 şehir, yatay bar chart. Veri yoksa render edilmez.

### 3. Range picker
Header'da 3 buton: 7 gün / 30 gün / 90 gün. URL'i `?range=N` ile günceller, sayfa yenilenir, tüm chart'lar yeni aralığa göre çekilir.

### 4. KPI kartları korundu
Mevcut 4'lü KPI grid (yeni teklif / yeni bayi / yeni mesaj / okunmamış bildirim) ve son bildirimler bölümü olduğu gibi.

## Yeni Dosyalar (12)

```
lib/utils/date-series.ts            — fillMissingDays + rangeToDates (UTC-safe)
lib/db/queries/admin/timeseries.ts  — quotes/dealers/contacts/signups perDay + topCitiesQuotes

components/admin/range-picker.tsx
components/admin/charts/
├── chart-card.tsx                  — server component (glass paneli)
├── time-series-chart.tsx           — client (recharts LineChart)
└── city-bar-chart.tsx              — client (recharts BarChart vertical)

tests/lib/utils/date-series.test.ts  — 4 unit test
```

## Mimari Kararlar

1. **Server-side data, client-side chart** — server component query yapıp client recharts component'ine `data` prop olarak geçiriyor. Recharts SSR uyumsuz olduğu için her chart `'use client'`.

2. **Aggregate'i JS'de yapıyoruz** — Supabase client raw SQL desteklemediği için `created_at` kolonunu çekip JS'de `Map` ile gruplayıp gün bazına indirgiyoruz. ≤5K kayıt için yeterli; daha büyük volume'da PostgreSQL fonksiyonu yazılabilir.

3. **UTC kullanımı** — `setUTCDate` + `toISOString().slice(0,10)` ile timezone bağımsız tarih dilimleri. Server'ın local timezone'undan etkilenmiyor.

4. **Range whitelist** — sadece 7/30/90 kabul, geçersizse 30 default. URL manipulation güvenliği için.

5. **Glass + brand renk** — mevcut design system korundu. Çizgi rengi default `#5DD62C`, alt grafiklerde tematik tut: mavi (bayi), sarı (mesaj), mor (kayıt).

6. **Recharts 3.x type quirks** — `Tooltip.formatter` artık `ValueType | undefined` kabul ediyor; `formatter: (value) => [String(value), 'Adet']` ile uyumlu yazıldı.

## Yeni Routes

Yok — sadece mevcut `/admin` sayfası genişletildi.

## DB Şema Değişiklikleri

Yok — sadece read-only query'ler.

## Sayılar

- **Commit:** 8 (7 feat + 1 docs)
- **Yeni dosya:** 8 (3 lib + 4 component + 1 test)
- **Değiştirilen dosya:** 1 (`app/admin/page.tsx`) + `package.json`/`package-lock.json`
- **Yeni test:** 4
- **Toplam test:** 223/223
- **Build:** Temiz
- **TS strict:** Temiz (`noUncheckedIndexedAccess`)

## Manuel Test Adımları

`http://localhost:3000/admin?range=30` (admin role gerekli):

1. **4 zaman serisi chart** görünmeli (teklif / bayi / mesaj / kayıt)
2. **Range picker** sağ üstte: tıklayınca URL `?range=7|30|90` değişmeli, chart'lar yenilenmeli
3. **Şehir bar chart** sadece teklif verisi varsa görünmeli (boş tabloda gizli)
4. **Tooltip dark theme** (`#141414` bg, `#262626` border, `#e7e7e7` text), Türkçe etiket ("Adet" / "Teklif")
5. **X-axis date format** `MM-DD` (örn `05-07`)
6. **Empty state:** veri yoksa düz çizgi (tüm günler 0); `topCitiesQuotes` yoksa bar chart hiç render olmaz

## Bilinen Sınırlamalar

- **Aggregate hesabı JS'de** — büyük datasette (>10K row) yavaş olabilir. Performans sorunu olunca SQL function'a taşıyabiliriz.
- **Custom date range yok** — sadece preset (7/30/90). Datepicker ileride eklenebilir.
- **Compare mode yok** — bu hafta vs geçen hafta yan yana karşılaştırma yok.
- **CSV export yok** — chart datasını dışa aktarma fonksiyonu yok.
- **Drill-down yok** — bar üstüne tıklayıp ilgili teklif listesine gitme yok.
- **Realtime yok** — sayfa refresh gerekli (range picker zaten refresh tetikliyor).
- **Multi-metric overlay yok** — tek chart'ta 2 line karşılaştırma yok (örn teklif vs bayi tek grafikte).

## Sonraki Faz

**Faz 13** — AI RAG (pgvector). Plan: `docs/superpowers/plans/2026-05-07-faz-13-ai-rag.md` (yapısal taslak — sıra gelince genişletilecek).

⚠️ **Önkoşul:** `ANTHROPIC_API_KEY` (kullanıcının şu an sadece `GEMINI_API_KEY` var). Faz 13'e başlamadan önce ya:
1. Anthropic key alınmalı, ya da
2. AI altyapısı Gemini'ye refactor edilmeli (Faz 5 yeniden yazım)

Faz 13 dışı seçenekler:
- **Faz 14 — Polish & UX backlog** (kullanıcının daha önce listelediği: cursor performansı, hero banner, kampanya modali, vb.)
- **Tedarikçi adapter ekleme** (gerçek bir bayi sitesi için)
- **Realtime notifications** (websocket / Supabase Realtime)
- **CSV export / drill-down** (Faz 12 polish)
