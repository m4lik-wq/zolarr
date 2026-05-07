# Faz 12 — Recharts Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

> **Status:** YAPISAL TASLAK — sıra geldiğinde Faz 10 detay seviyesinde genişletilecek.

**Goal:** /admin dashboard'una zaman serisi grafikleri, şehir dağılımı, KPI trendleri ekle. Admin daha iyi karar versin.

**Architecture:**
- `recharts` (React-native chart kütüphanesi, SSR uyumlu olmadığı için client component)
- Server-side query helpers: tarih aralığında günlük gruplandırma (PostgreSQL `date_trunc`)
- Date-range picker (basit: son 7g, 30g, 90g preset'leri)
- Chart'lar lazy-loaded ('use client' wrapper'larda)

**Tech Stack:**
- `recharts` (yeni)
- `date-fns` (zaten var mı? kontrol et — yoksa kur)
- Mevcut admin layout + queries

**Tahmini task: 8**

---

## Task 1: Install recharts + date-fns

`npm install recharts date-fns`

## Task 2: Time-series query helpers

`lib/db/queries/admin/timeseries.ts`:

```ts
export async function quotesPerDay(days: number): Promise<{ date: string; count: number }[]>
export async function dealersPerDay(days: number): Promise<{ date: string; count: number }[]>
export async function contactsPerDay(days: number): Promise<{ date: string; count: number }[]>
export async function signupsPerDay(days: number): Promise<{ date: string; count: number }[]>
```

SQL: `select date_trunc('day', created_at) as day, count(*) ... group by 1 order by 1`. Eksik günler client-side fill.

## Task 3: City distribution query

```ts
export async function topCitiesQuotes(limit = 10, days: number): Promise<{ city: string; count: number }[]>
```

## Task 4: ChartCard wrapper component

Glass paneli, başlık, recharts ResponsiveContainer içinde line/bar chart.

```tsx
// components/admin/charts/chart-card.tsx
'use client';
export function ChartCard({ title, children }: { title: string; children: React.ReactNode })
```

## Task 5: TimeSeriesChart component

```tsx
// components/admin/charts/time-series-chart.tsx
'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
export function TimeSeriesChart({ data, color }: { data: { date: string; count: number }[]; color?: string })
```

## Task 6: BarChart for cities

## Task 7: Dashboard'u güncelle

`app/admin/page.tsx`:
- Mevcut KPI cards üstte
- 4 time-series chart (2x2 grid): Quotes, Dealers, Contacts, Signups
- Aşağıda: Top Cities bar chart
- Üstte: Date-range presets (7d / 30d / 90d) — query string `?range=30`

## Task 8: Completion report

---

## Tasarım Kararları

- **Server-rendered data, client-rendered chart:** Server'da `quotesPerDay(30)` çek, `<TimeSeriesChart data={data} />` olarak client component'e geçir. SSR-friendly + interaktif.
- **Default range:** 30 gün. URL'de `?range=7|30|90`.
- **Temayı koru:** Recharts default renkleri override → marka rengi `#5DD62C`.

## Kapsam Dışı

- Realtime updates (websocket)
- CSV export
- Custom date range (bugün başlangıç-bitiş picker)
- Compare mode (bu hafta vs geçen hafta yan yana)
