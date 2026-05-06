# Faz 8 — Admin Paneli Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin rolündeki kullanıcılar için `/admin/*` paneli ekle. Dashboard (KPI kartları + son bildirimler), tüm gelen taleplerin (teklif/bayi/iletişim) yönetimi, kullanıcı rol değişimi, ve içerik CRUD'u (ürün, kategori, proje, SSS).

**Architecture:** Admin sayfaları sunucu tarafında `requireAdmin()` çağrısı ile gate'lenir; rol uymayan kullanıcılara `notFound()` ile 404 döner (gizli erişim mantığı). Admin sorguları service role key kullanan ayrı bir Supabase client (`createAdminClient()`) ile RLS'i bypass eder — bu istemci sadece `requireAdmin()` doğrulamasından sonra kullanılır. Notifications tablosu DB trigger'ları ile auto-populate olur (yeni teklif/bayi/iletişim geldiğinde admin'e bildirim).

**Tech Stack:** Next.js 16 App Router (RSC + Server Actions), Supabase (service role + RLS), Zod, Vitest. **Erteleme:** AI bilgi yönetimi (RAG/pgvector) → Faz 9, tedarikçi sync → Faz 9, Recharts dashboard grafikleri → Faz 9, Resend e-posta → Faz 10, web push + realtime → Faz 9.

---

## Pre-flight

Plan tamamlandığında kullanıcı:
1. `supabase/migrations/combined_for_paste_v6.sql`'i Supabase Studio'da Run.
2. Önceden /kayit ile bir hesap oluşturduktan sonra Supabase Studio → SQL Editor'da:
   ```sql
   update public.profiles set role = 'admin' where email = 'BENİM_EMAIL@gmail.com';
   ```
   (Bu hesap admin olur. Sonradan başka admin'leri /admin/kullanicilar sayfasından ekleyebilir.)

---

## File Structure (özet)

| Path | Sorumluluk |
|------|------------|
| `supabase/migrations/0010_admin_notifications.sql` | notifications tablosu + new_quote/new_dealer/new_contact trigger'ları |
| `supabase/migrations/combined_for_paste_v6.sql` | Paste-ready 0010 |
| `lib/db/types.ts` | `AdminQuote`, `AdminDealer`, `AdminContactMessage`, `AdminUser`, `Notification` interface'leri eklenir |
| `lib/supabase/admin.ts` | Service role client (`createAdminClient()`) |
| `lib/auth/server.ts` | `requireAdmin()` eklenir (var olan dosyaya append) |
| `lib/db/queries/admin/*` | Admin'e özel sorgular (RLS bypass eder) |
| `lib/server-actions/admin/*` | Admin'e özel mutation actions |
| `app/admin/layout.tsx` | Admin shell (sidebar + role gate) |
| `app/admin/page.tsx` | Dashboard |
| `app/admin/teklifler/...` | Quotes management |
| `app/admin/bayiler/...` | Dealer apps |
| `app/admin/iletisim/...` | Contact messages |
| `app/admin/kullanicilar/page.tsx` | Users + role update |
| `app/admin/urunler/...` | Products CRUD |
| `app/admin/kategoriler/...` | Categories CRUD |
| `app/admin/projeler/...` | Projects CRUD |
| `app/admin/sss/...` | FAQ CRUD |
| `components/admin/sidebar.tsx` | Sol menü |
| `components/admin/notification-bell.tsx` | Header rozet |
| `components/admin/data-table.tsx` | Tekrar kullanılabilir tablo |
| `components/admin/status-badge.tsx` | Renk kodlu rozet |

---

## Task 1: Migration 0010 — notifications + auto-create triggers

**Files:**
- Create: `supabase/migrations/0010_admin_notifications.sql`
- Create: `supabase/migrations/combined_for_paste_v6.sql`

- [ ] **Step 1: SQL yaz**

```sql
-- 0010_admin_notifications.sql

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'NEW_QUOTE','NEW_DEALER','NEW_CONTACT','NEW_ORDER',
    'PRICE_INCREASE','PRICE_DECREASE','OUT_OF_STOCK','SUPPLIER_GONE'
  )),
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_idx on public.notifications(is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_admin_read" on public.notifications;
create policy "notifications_admin_read" on public.notifications
  for select using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "notifications_admin_update" on public.notifications;
create policy "notifications_admin_update" on public.notifications
  for update using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Triggers: yeni teklif, bayi, iletişim mesajı geldiğinde notification yarat

create or replace function public.notify_new_quote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, payload)
  values (
    'NEW_QUOTE',
    jsonb_build_object(
      'quote_id', new.id,
      'quote_number', new.quote_number,
      'contact_name', new.contact_name,
      'city', new.city
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_quote on public.quotes;
create trigger trg_notify_new_quote
  after insert on public.quotes
  for each row execute function public.notify_new_quote();

create or replace function public.notify_new_dealer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, payload)
  values (
    'NEW_DEALER',
    jsonb_build_object(
      'dealer_id', new.id,
      'application_number', new.application_number,
      'company_name', new.company_name
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_dealer on public.dealer_applications;
create trigger trg_notify_new_dealer
  after insert on public.dealer_applications
  for each row execute function public.notify_new_dealer();

create or replace function public.notify_new_contact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, payload)
  values (
    'NEW_CONTACT',
    jsonb_build_object(
      'message_id', new.id,
      'message_number', new.message_number,
      'name', new.name,
      'email', new.email
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_contact on public.contact_messages;
create trigger trg_notify_new_contact
  after insert on public.contact_messages
  for each row execute function public.notify_new_contact();
```

- [ ] **Step 2: combined_for_paste_v6.sql**

`supabase/migrations/combined_for_paste_v6.sql` — sadece 0010 + sondaki doğrulama:

```sql
-- combined_for_paste_v6.sql
[0010 içeriği aynen]

-- Doğrulama
select to_regclass('public.notifications') is not null as notifications_exists,
       count(*) filter (where trigger_name = 'trg_notify_new_quote') as quote_trigger,
       count(*) filter (where trigger_name = 'trg_notify_new_dealer') as dealer_trigger,
       count(*) filter (where trigger_name = 'trg_notify_new_contact') as contact_trigger
from information_schema.triggers
where trigger_schema = 'public';
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0010_admin_notifications.sql supabase/migrations/combined_for_paste_v6.sql
git commit -m "feat(db): add notifications table + auto-create triggers"
```

---

## Task 2: Admin types + service role client + requireAdmin helper

**Files:**
- Modify: `lib/db/types.ts`
- Create: `lib/supabase/admin.ts`
- Modify: `lib/auth/server.ts`

- [ ] **Step 1: types.ts'e ekle**

```ts
// (mevcut tiplere ek olarak)

export interface Notification {
  id: string;
  type:
    | 'NEW_QUOTE' | 'NEW_DEALER' | 'NEW_CONTACT' | 'NEW_ORDER'
    | 'PRICE_INCREASE' | 'PRICE_DECREASE' | 'OUT_OF_STOCK' | 'SUPPLIER_GONE';
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface AdminQuote {
  id: string;
  quoteNumber: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  city: string;
  district: string | null;
  installationLocation: string;
  description: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  estimatedKwp: number | null;
  estimatedSavingsTry: number | null;
  estimatedPaybackYears: number | null;
  adminNotes: string | null;
  responded: boolean;
  respondedAt: string | null;
  createdAt: string;
  appliances: Array<{ name: string; consumptionKwh?: number; powerW?: number; voltageV?: number }>;
}

export interface AdminDealer {
  id: string;
  applicationNumber: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceCategories: string[];
  serviceAreas: string[];
  experienceYears: number | null;
  status: 'new' | 'reviewing' | 'approved' | 'rejected';
  adminNotes: string | null;
  createdAt: string;
}

export interface AdminContactMessage {
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

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'moderator' | 'assistant' | 'admin';
  createdAt: string;
}
```

- [ ] **Step 2: lib/supabase/admin.ts**

```ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';

let cachedAdmin: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin env eksik');
  cachedAdmin = createClient(url, key, { auth: { persistSession: false } });
  return cachedAdmin;
}
```

- [ ] **Step 3: lib/auth/server.ts'e requireAdmin ekle**

`lib/auth/server.ts` dosyasını oku. `isAdmin()` zaten var. Onun altına ekle:

```ts
export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return profile;
}
```

- [ ] **Step 4: Commit**

```bash
npx tsc --noEmit
git add lib/db/types.ts lib/supabase/admin.ts lib/auth/server.ts
git commit -m "feat(admin): add types, service role client, and requireAdmin helper"
```

---

## Task 3: Admin layout + sidebar + role gate

**Files:**
- Create: `components/admin/sidebar.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/not-found.tsx`

- [ ] **Step 1: sidebar.tsx**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Building2, Mail, Users,
  Package, FolderTree, Sparkles, HelpCircle, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/teklifler', label: 'Teklifler', icon: FileText },
  { href: '/admin/bayiler', label: 'Bayi Başvuruları', icon: Building2 },
  { href: '/admin/iletisim', label: 'İletişim Mesajları', icon: Mail },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/urunler', label: 'Ürünler', icon: Package },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: FolderTree },
  { href: '/admin/projeler', label: 'Projeler', icon: Sparkles },
  { href: '/admin/sss', label: 'SSS', icon: HelpCircle },
];

export function AdminSidebar() {
  const path = usePathname();
  return (
    <nav aria-label="Admin menü" className="space-y-1">
      <Link href="/" className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-overlay)]">
        <ArrowLeft className="h-4 w-4" /> Site'ye dön
      </Link>
      {ITEMS.map((it) => {
        const active = path === it.href || (it.href !== '/admin' && path.startsWith(it.href + '/'));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                : 'hover:bg-[var(--color-bg-overlay)]'
            )}
          >
            <it.icon className="h-4 w-4" /> {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: app/admin/not-found.tsx**

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">Aradığınız sayfaya erişiminiz yok.</p>
      <Button asChild className="mt-6"><Link href="/">Ana sayfaya dön</Link></Button>
    </div>
  );
}
```

- [ ] **Step 3: app/admin/layout.tsx**

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentProfile } from '@/lib/auth/server';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata: Metadata = {
  title: 'Admin Panel | Zolarr',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    notFound();
  }
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside><AdminSidebar /></aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build temiz mi + commit**

```bash
npm run build
git add components/admin/sidebar.tsx app/admin/layout.tsx app/admin/not-found.tsx
git commit -m "feat(admin): add admin layout with sidebar and role-gated 404"
```

---

## Task 4: Admin dashboard

**Files:**
- Create: `lib/db/queries/admin/dashboard.ts`
- Create: `components/admin/kpi-card.tsx`
- Create: `components/admin/notification-list.tsx`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: dashboard.ts queries**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Notification } from '@/lib/db/types';

export interface DashboardStats {
  newQuotes: number;
  newDealers: number;
  newContacts: number;
  totalUsers: number;
  unreadNotifications: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();
  const sb = createAdminClient();
  const [q, d, c, u, n] = await Promise.all([
    sb.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    sb.from('dealer_applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    sb.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ]);
  return {
    newQuotes: q.count ?? 0,
    newDealers: d.count ?? 0,
    newContacts: c.count ?? 0,
    totalUsers: u.count ?? 0,
    unreadNotifications: n.count ?? 0,
  };
}

export async function getRecentNotifications(limit = 10): Promise<Notification[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('notifications')
    .select('id,type,payload,is_read,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    type: r.type,
    payload: r.payload as Record<string, unknown>,
    isRead: r.is_read,
    createdAt: r.created_at,
  }));
}
```

- [ ] **Step 2: kpi-card.tsx**

```tsx
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  title: string;
  value: number;
  href: string;
  icon: LucideIcon;
}

export function KpiCard({ title, value, href, icon: Icon }: Props) {
  return (
    <Link href={href} className="glass rounded-2xl p-5 transition-all hover:border-[var(--color-brand)]/40">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">{title}</span>
        <Icon className="h-5 w-5 text-[var(--color-brand)]" />
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value.toLocaleString('tr-TR')}</p>
    </Link>
  );
}
```

- [ ] **Step 3: notification-list.tsx**

```tsx
import Link from 'next/link';
import type { Notification } from '@/lib/db/types';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<Notification['type'], string> = {
  NEW_QUOTE: 'Yeni teklif talebi',
  NEW_DEALER: 'Yeni bayi başvurusu',
  NEW_CONTACT: 'Yeni iletişim mesajı',
  NEW_ORDER: 'Yeni sipariş',
  PRICE_INCREASE: 'Fiyat artışı uyarısı',
  PRICE_DECREASE: 'Fiyat düşüşü uyarısı',
  OUT_OF_STOCK: 'Stok bitti',
  SUPPLIER_GONE: 'Tedarikçi sayfası kayboldu',
};

function targetHref(n: Notification): string | null {
  const p = n.payload as Record<string, string>;
  if (n.type === 'NEW_QUOTE' && p.quote_id) return `/admin/teklifler/${p.quote_id}`;
  if (n.type === 'NEW_DEALER' && p.dealer_id) return `/admin/bayiler/${p.dealer_id}`;
  if (n.type === 'NEW_CONTACT' && p.message_id) return `/admin/iletisim/${p.message_id}`;
  return null;
}

function payloadSummary(n: Notification): string {
  const p = n.payload as Record<string, string>;
  if (n.type === 'NEW_QUOTE') return `${p.contact_name ?? '-'} — ${p.city ?? '-'} (${p.quote_number ?? '-'})`;
  if (n.type === 'NEW_DEALER') return p.company_name ?? '-';
  if (n.type === 'NEW_CONTACT') return `${p.name ?? '-'} — ${p.email ?? ''}`;
  return '';
}

export function NotificationList({ items }: { items: Notification[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)]">Henüz bildirim yok.</p>;
  }
  return (
    <ul className="divide-y divide-[var(--color-border-glass)]">
      {items.map((n) => {
        const href = targetHref(n);
        const body = (
          <div className={cn('flex items-start justify-between gap-3 py-3', !n.isRead && 'font-medium')}>
            <div className="flex-1">
              <p className="text-sm">{TYPE_LABEL[n.type]}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{payloadSummary(n)}</p>
            </div>
            <time className="text-xs text-[var(--color-text-muted)]">
              {new Date(n.createdAt).toLocaleString('tr-TR')}
            </time>
          </div>
        );
        return (
          <li key={n.id}>
            {href ? (
              <Link href={href} className="block transition-colors hover:bg-[var(--color-bg-overlay)] -mx-3 px-3 rounded-xl">{body}</Link>
            ) : body}
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 4: app/admin/page.tsx**

```tsx
import { FileText, Building2, Mail, Users, Bell } from 'lucide-react';
import { getDashboardStats, getRecentNotifications } from '@/lib/db/queries/admin/dashboard';
import { getCurrentProfile } from '@/lib/auth/server';
import { KpiCard } from '@/components/admin/kpi-card';
import { NotificationList } from '@/components/admin/notification-list';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [profile, stats, notifications] = await Promise.all([
    getCurrentProfile(),
    getDashboardStats(),
    getRecentNotifications(10),
  ]);
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Hoşgeldin, {profile?.name ?? profile?.email}</h1>
        <p className="text-[var(--color-text-muted)]">Yönetim paneli — bekleyen işler ve son aktivite.</p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Bekleyen</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard title="Yeni Teklif" value={stats.newQuotes} href="/admin/teklifler?status=new" icon={FileText} />
          <KpiCard title="Yeni Bayi" value={stats.newDealers} href="/admin/bayiler?status=new" icon={Building2} />
          <KpiCard title="Yeni Mesaj" value={stats.newContacts} href="/admin/iletisim?status=new" icon={Mail} />
          <KpiCard title="Toplam Üye" value={stats.totalUsers} href="/admin/kullanicilar" icon={Users} />
          <KpiCard title="Okunmamış Bildirim" value={stats.unreadNotifications} href="/admin" icon={Bell} />
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Son Bildirimler</h2>
        <NotificationList items={notifications} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/queries/admin/dashboard.ts components/admin/kpi-card.tsx components/admin/notification-list.tsx app/admin/page.tsx
git commit -m "feat(admin): add dashboard with KPI cards and recent notifications"
```

---

## Task 5: Admin Quotes management

**Files:**
- Create: `lib/db/queries/admin/quotes.ts`
- Create: `lib/server-actions/admin/update-quote.ts`
- Create: `components/admin/status-badge.tsx`
- Create: `components/admin/quote-status-form.tsx`
- Create: `app/admin/teklifler/page.tsx`
- Create: `app/admin/teklifler/[id]/page.tsx`

- [ ] **Step 1: queries/admin/quotes.ts**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminQuote } from '@/lib/db/types';

export async function listAdminQuotes(filter?: { status?: AdminQuote['status'] }): Promise<AdminQuote[]> {
  await requireAdmin();
  const sb = createAdminClient();
  let q = sb.from('quotes').select('*').order('created_at', { ascending: false });
  if (filter?.status) q = q.eq('status', filter.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(mapQuoteRow);
}

export async function getAdminQuote(id: string): Promise<AdminQuote | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('quotes').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapQuoteRow(data);
}

function mapQuoteRow(r: any): AdminQuote {
  return {
    id: r.id,
    quoteNumber: r.quote_number,
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email,
    city: r.city,
    district: r.district,
    installationLocation: r.installation_location,
    description: r.description,
    status: r.status,
    estimatedKwp: r.estimated_kwp !== null ? Number(r.estimated_kwp) : null,
    estimatedSavingsTry: r.estimated_savings_try !== null ? Number(r.estimated_savings_try) : null,
    estimatedPaybackYears: r.estimated_payback_years !== null ? Number(r.estimated_payback_years) : null,
    adminNotes: r.admin_notes,
    responded: r.responded,
    respondedAt: r.responded_at,
    createdAt: r.created_at,
    appliances: Array.isArray(r.appliances) ? r.appliances : [],
  };
}
```

- [ ] **Step 2: actions/admin/update-quote.ts**

```ts
'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;

export async function updateQuoteAction(input: {
  id: string;
  status?: typeof STATUSES[number];
  adminNotes?: string;
  responded?: boolean;
}) {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  if (typeof input.responded === 'boolean') {
    patch.responded = input.responded;
    if (input.responded) patch.responded_at = new Date().toISOString();
  }
  const { error } = await sb.from('quotes').update(patch).eq('id', input.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/teklifler/${input.id}`);
  revalidatePath('/admin/teklifler');
  revalidatePath('/admin');
  return { ok: true as const };
}
```

- [ ] **Step 3: status-badge.tsx (genel kullanıma)**

```tsx
import { cn } from '@/lib/utils';

const COLORS: Record<string, string> = {
  new: 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]',
  contacted: 'bg-blue-500/15 text-blue-400',
  quoted: 'bg-yellow-500/15 text-yellow-500',
  won: 'bg-green-500/15 text-green-500',
  lost: 'bg-red-500/15 text-red-400',
  reviewing: 'bg-yellow-500/15 text-yellow-500',
  approved: 'bg-green-500/15 text-green-500',
  rejected: 'bg-red-500/15 text-red-400',
  read: 'bg-blue-500/15 text-blue-400',
  replied: 'bg-green-500/15 text-green-500',
  archived: 'bg-gray-500/15 text-gray-400',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', COLORS[status] ?? 'bg-gray-500/15 text-gray-400')}>
      {label}
    </span>
  );
}
```

- [ ] **Step 4: quote-status-form.tsx (client)**

```tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateQuoteAction } from '@/lib/server-actions/admin/update-quote';
import type { AdminQuote } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminQuote['status'], string> = {
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  quoted: 'Teklif verildi',
  won: 'Kazandı',
  lost: 'Kapandı',
};

export function QuoteStatusForm({ quote }: { quote: AdminQuote }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(quote.status);
  const [notes, setNotes] = React.useState(quote.adminNotes ?? '');
  const [responded, setResponded] = React.useState(quote.responded);
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await updateQuoteAction({ id: quote.id, status, adminNotes: notes, responded });
    setPending(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="q-status">Durum</label>
        <select
          id="q-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminQuote['status'])}
          className="mt-1 h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4"
        >
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="q-notes">Admin notu</label>
        <textarea
          id="q-notes"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={responded} onChange={(e) => setResponded(e.target.checked)} className="h-4 w-4 accent-[var(--color-brand)]" />
        Müşteriye dönüş yapıldı
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</Button>
        {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
      </div>
    </form>
  );
}
```

- [ ] **Step 5: app/admin/teklifler/page.tsx**

```tsx
import Link from 'next/link';
import { listAdminQuotes } from '@/lib/db/queries/admin/quotes';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminQuote } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminQuote['status'], string> = {
  new: 'Yeni', contacted: 'İletişime geçildi', quoted: 'Teklif verildi', won: 'Kazandı', lost: 'Kapandı',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminTekliflerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = (sp.status as AdminQuote['status']) || undefined;
  const quotes = await listAdminQuotes({ status });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Teklif Talepleri</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{quotes.length} kayıt</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Teklif No</th>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Şehir</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tahmini kWp</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-mono text-[var(--color-brand)]">{q.quoteNumber}</td>
                <td className="px-4 py-3">{q.contactName}</td>
                <td className="px-4 py-3">{q.city}</td>
                <td className="px-4 py-3"><StatusBadge status={q.status} label={STATUS_LABEL[q.status]} /></td>
                <td className="px-4 py-3">{q.estimatedKwp ? `${q.estimatedKwp.toFixed(2)} kWp` : '—'}</td>
                <td className="px-4 py-3">{new Date(q.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/teklifler/${q.id}`} className="text-[var(--color-brand)] hover:underline">Detay</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && <p className="p-4 text-sm text-[var(--color-text-muted)]">Kayıt yok.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: app/admin/teklifler/[id]/page.tsx**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminQuote } from '@/lib/db/queries/admin/quotes';
import { QuoteStatusForm } from '@/components/admin/quote-status-form';
import { formatTry } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTeklifDetayPage({ params }: PageProps) {
  const { id } = await params;
  const quote = await getAdminQuote(id);
  if (!quote) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/teklifler" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]">← Listeye dön</Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{quote.quoteNumber}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">Müşteri Bilgileri</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">İsim</dt><dd>{quote.contactName}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-[var(--color-text-muted)]">Telefon</dt>
              <dd className="flex gap-2">
                <a href={`tel:${quote.contactPhone}`} className="hover:underline">{quote.contactPhone}</a>
                <a href={`https://wa.me/${quote.contactPhone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-500 hover:bg-green-500/25">WhatsApp</a>
              </dd>
            </div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">E-posta</dt><dd><a href={`mailto:${quote.contactEmail}`} className="hover:underline">{quote.contactEmail}</a></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Şehir</dt><dd>{quote.city}{quote.district ? ` / ${quote.district}` : ''}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Lokasyon</dt><dd>{quote.installationLocation}</dd></div>
          </dl>
        </section>

        <section className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">Hesaplama Tahmini</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Sistem boyutu</dt><dd className="font-mono">{quote.estimatedKwp ? `${quote.estimatedKwp.toFixed(2)} kWp` : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Yıllık tasarruf</dt><dd>{quote.estimatedSavingsTry ? formatTry(quote.estimatedSavingsTry) : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Geri ödeme</dt><dd>{quote.estimatedPaybackYears ? `~${quote.estimatedPaybackYears.toFixed(1)} yıl` : '—'}</dd></div>
          </dl>
        </section>
      </div>

      {quote.appliances.length > 0 && (
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-3 font-display text-lg font-semibold">Cihazlar ({quote.appliances.length})</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {quote.appliances.map((a, i) => (
              <li key={i} className="rounded-xl border border-[var(--color-border)] p-3 text-sm">
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {[a.consumptionKwh && `${a.consumptionKwh} kWh/yıl`, a.powerW && `${a.powerW}W`, a.voltageV && `${a.voltageV}V`].filter(Boolean).join(' · ') || '—'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quote.description && (
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-3 font-display text-lg font-semibold">Müşteri Açıklaması</h2>
          <p className="whitespace-pre-wrap text-sm">{quote.description}</p>
        </section>
      )}

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Yönetim</h2>
        <QuoteStatusForm quote={quote} />
      </section>
    </div>
  );
}
```

- [ ] **Step 7: Build + commit**

```bash
npm run build
git add lib/db/queries/admin/quotes.ts lib/server-actions/admin/update-quote.ts components/admin/status-badge.tsx components/admin/quote-status-form.tsx app/admin/teklifler
git commit -m "feat(admin): add quotes management (list + detail + status update)"
```

---

## Task 6: Admin Dealers management

**Files:**
- Create: `lib/db/queries/admin/dealers.ts`
- Create: `lib/server-actions/admin/update-dealer.ts`
- Create: `components/admin/dealer-status-form.tsx`
- Create: `app/admin/bayiler/page.tsx`
- Create: `app/admin/bayiler/[id]/page.tsx`

- [ ] **Step 1: queries/admin/dealers.ts**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminDealer } from '@/lib/db/types';

export async function listAdminDealers(filter?: { status?: AdminDealer['status'] }): Promise<AdminDealer[]> {
  await requireAdmin();
  const sb = createAdminClient();
  let q = sb.from('dealer_applications').select('*').order('created_at', { ascending: false });
  if (filter?.status) q = q.eq('status', filter.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getAdminDealer(id: string): Promise<AdminDealer | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('dealer_applications').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

function mapRow(r: any): AdminDealer {
  return {
    id: r.id,
    applicationNumber: r.application_number,
    companyName: r.company_name,
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    contactPhone: r.contact_phone,
    serviceCategories: r.service_categories ?? [],
    serviceAreas: r.service_areas ?? [],
    experienceYears: r.experience_years,
    status: r.status,
    adminNotes: r.admin_notes,
    createdAt: r.created_at,
  };
}
```

- [ ] **Step 2: actions/admin/update-dealer.ts**

```ts
'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'reviewing', 'approved', 'rejected'] as const;

export async function updateDealerAction(input: {
  id: string;
  status?: typeof STATUSES[number];
  adminNotes?: string;
}) {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  const { error } = await sb.from('dealer_applications').update(patch).eq('id', input.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/bayiler/${input.id}`);
  revalidatePath('/admin/bayiler');
  return { ok: true as const };
}
```

- [ ] **Step 3: dealer-status-form.tsx**

QuoteStatusForm'un dealer versiyonu — `{ new, reviewing, approved, rejected }` durumları, admin notu, kaydet butonu.

```tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateDealerAction } from '@/lib/server-actions/admin/update-dealer';
import type { AdminDealer } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminDealer['status'], string> = {
  new: 'Yeni', reviewing: 'İncelemede', approved: 'Onaylandı', rejected: 'Reddedildi',
};

export function DealerStatusForm({ dealer }: { dealer: AdminDealer }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(dealer.status);
  const [notes, setNotes] = React.useState(dealer.adminNotes ?? '');
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await updateDealerAction({ id: dealer.id, status, adminNotes: notes });
    setPending(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="d-status">Durum</label>
        <select id="d-status" value={status} onChange={(e) => setStatus(e.target.value as AdminDealer['status'])} className="mt-1 h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="d-notes">Admin notu</label>
        <textarea id="d-notes" rows={4} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</Button>
        {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
      </div>
    </form>
  );
}
```

- [ ] **Step 4: page.tsx + [id]/page.tsx**

Liste sayfası teklifler ile aynı kalıpta (tablo + StatusBadge). Detay sayfası firma adı, yetkili, hizmetler, alan, tecrübe + DealerStatusForm.

```tsx
// app/admin/bayiler/page.tsx
import Link from 'next/link';
import { listAdminDealers } from '@/lib/db/queries/admin/dealers';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminDealer } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminDealer['status'], string> = {
  new: 'Yeni', reviewing: 'İncelemede', approved: 'Onaylandı', rejected: 'Reddedildi',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBayilerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = (sp.status as AdminDealer['status']) || undefined;
  const dealers = await listAdminDealers({ status });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Bayi Başvuruları</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{dealers.length} kayıt</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Başvuru No</th>
              <th className="px-4 py-3">Firma</th>
              <th className="px-4 py-3">Yetkili</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((d) => (
              <tr key={d.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-mono text-[var(--color-brand)]">{d.applicationNumber}</td>
                <td className="px-4 py-3">{d.companyName}</td>
                <td className="px-4 py-3">{d.contactName}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} label={STATUS_LABEL[d.status]} /></td>
                <td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/bayiler/${d.id}`} className="text-[var(--color-brand)] hover:underline">Detay</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {dealers.length === 0 && <p className="p-4 text-sm text-[var(--color-text-muted)]">Kayıt yok.</p>}
      </div>
    </div>
  );
}
```

```tsx
// app/admin/bayiler/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminDealer } from '@/lib/db/queries/admin/dealers';
import { DealerStatusForm } from '@/components/admin/dealer-status-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBayiDetayPage({ params }: PageProps) {
  const { id } = await params;
  const dealer = await getAdminDealer(id);
  if (!dealer) notFound();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/bayiler" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]">← Listeye dön</Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{dealer.applicationNumber}</h1>
      </header>
      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">Firma Bilgileri</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Firma</dt><dd>{dealer.companyName}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Yetkili</dt><dd>{dealer.contactName}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Telefon</dt><dd><a href={`tel:${dealer.contactPhone}`} className="hover:underline">{dealer.contactPhone}</a></dd></div>
          <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">E-posta</dt><dd><a href={`mailto:${dealer.contactEmail}`} className="hover:underline">{dealer.contactEmail}</a></dd></div>
          <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Tecrübe</dt><dd>{dealer.experienceYears ? `${dealer.experienceYears} yıl` : '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Hizmetler</dt><dd>{dealer.serviceCategories.join(', ') || '—'}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Bölgeler</dt><dd>{dealer.serviceAreas.join(', ') || '—'}</dd></div>
        </dl>
      </section>
      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Yönetim</h2>
        <DealerStatusForm dealer={dealer} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add lib/db/queries/admin/dealers.ts lib/server-actions/admin/update-dealer.ts components/admin/dealer-status-form.tsx app/admin/bayiler
git commit -m "feat(admin): add dealer applications management"
```

---

## Task 7: Admin Contact Messages management

**Files:**
- Create: `lib/db/queries/admin/contact-messages.ts`
- Create: `lib/server-actions/admin/update-contact-message.ts`
- Create: `components/admin/contact-status-form.tsx`
- Create: `app/admin/iletisim/page.tsx`
- Create: `app/admin/iletisim/[id]/page.tsx`

- [ ] **Step 1: queries**

```ts
// lib/db/queries/admin/contact-messages.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminContactMessage } from '@/lib/db/types';

export async function listAdminContactMessages(filter?: { status?: AdminContactMessage['status'] }) {
  await requireAdmin();
  const sb = createAdminClient();
  let q = sb.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (filter?.status) q = q.eq('status', filter.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map(map);
}

export async function getAdminContactMessage(id: string): Promise<AdminContactMessage | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('contact_messages').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return map(data);
}

function map(r: any): AdminContactMessage {
  return {
    id: r.id,
    messageNumber: r.message_number,
    name: r.name,
    email: r.email,
    phone: r.phone,
    subject: r.subject,
    body: r.body,
    status: r.status,
    createdAt: r.created_at,
  };
}
```

- [ ] **Step 2: action**

```ts
// lib/server-actions/admin/update-contact-message.ts
'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export async function updateContactMessageAction(input: { id: string; status: typeof STATUSES[number] }) {
  await requireAdmin();
  if (!STATUSES.includes(input.status)) return { ok: false as const, error: 'Geçersiz durum' };
  const sb = createAdminClient();
  const { error } = await sb.from('contact_messages').update({ status: input.status }).eq('id', input.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/iletisim');
  revalidatePath(`/admin/iletisim/${input.id}`);
  return { ok: true as const };
}
```

- [ ] **Step 3: form + pages**

`components/admin/contact-status-form.tsx` — basit `<select>` + Kaydet butonu (4 status arasında).

```tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateContactMessageAction } from '@/lib/server-actions/admin/update-contact-message';
import type { AdminContactMessage } from '@/lib/db/types';

const LABEL: Record<AdminContactMessage['status'], string> = {
  new: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', archived: 'Arşivlendi',
};

export function ContactStatusForm({ message }: { message: AdminContactMessage }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(message.status);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await updateContactMessageAction({ id: message.id, status });
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="text-sm font-medium" htmlFor="m-status">Durum</label>
        <select id="m-status" value={status} onChange={(e) => setStatus(e.target.value as AdminContactMessage['status'])} className="mt-1 h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
          {Object.entries(LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <Button type="submit" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</Button>
    </form>
  );
}
```

`app/admin/iletisim/page.tsx` ve `[id]/page.tsx` — teklifler/bayiler sayfalarıyla aynı kalıpta. Detayda body markdown olmadan plain text. "Yanıtla" butonu `mailto:` linki açar.

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/admin/contact-messages.ts lib/server-actions/admin/update-contact-message.ts components/admin/contact-status-form.tsx app/admin/iletisim
git commit -m "feat(admin): add contact messages management"
```

---

## Task 8: Admin Users management (role update)

**Files:**
- Create: `lib/db/queries/admin/users.ts`
- Create: `lib/server-actions/admin/update-user-role.ts`
- Create: `components/admin/role-select.tsx`
- Create: `app/admin/kullanicilar/page.tsx`

- [ ] **Step 1: queries**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminUser } from '@/lib/db/types';

export async function listAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('profiles')
    .select('id,email,name,phone,role,created_at')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id, email: r.email, name: r.name, phone: r.phone, role: r.role, createdAt: r.created_at,
  }));
}
```

- [ ] **Step 2: action**

```ts
'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const ROLES = ['customer', 'moderator', 'assistant', 'admin'] as const;

export async function updateUserRoleAction(input: { id: string; role: typeof ROLES[number] }) {
  const requester = await requireAdmin();
  if (!ROLES.includes(input.role)) return { ok: false as const, error: 'Geçersiz rol' };
  if (input.id === requester.id && input.role !== 'admin') {
    return { ok: false as const, error: 'Kendi admin rolünüzü kaldıramazsınız.' };
  }
  const sb = createAdminClient();
  const { error } = await sb.from('profiles').update({ role: input.role }).eq('id', input.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/kullanicilar');
  return { ok: true as const };
}
```

- [ ] **Step 3: role-select.tsx (client)**

```tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { updateUserRoleAction } from '@/lib/server-actions/admin/update-user-role';
import type { AdminUser } from '@/lib/db/types';

const ROLE_LABEL: Record<AdminUser['role'], string> = {
  customer: 'Müşteri', moderator: 'Moderatör', assistant: 'Asistan', admin: 'Admin',
};

export function RoleSelect({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as AdminUser['role'];
    setPending(true);
    const res = await updateUserRoleAction({ id: user.id, role });
    setPending(false);
    if (res.ok) router.refresh();
    else alert(res.error);
  }

  return (
    <select
      value={user.role}
      onChange={onChange}
      disabled={pending || isSelf}
      title={isSelf ? 'Kendi rolünüzü değiştiremezsiniz' : ''}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1 text-sm"
    >
      {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
```

- [ ] **Step 4: page.tsx**

```tsx
import { listAdminUsers } from '@/lib/db/queries/admin/users';
import { getCurrentProfile } from '@/lib/auth/server';
import { RoleSelect } from '@/components/admin/role-select';

export const dynamic = 'force-dynamic';

export default async function AdminKullanicilarPage() {
  const [me, users] = await Promise.all([getCurrentProfile(), listAdminUsers()]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Kullanıcılar</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{users.length} kullanıcı</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Kayıt</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3">{u.name ?? '—'}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone ?? '—'}</td>
                <td className="px-4 py-3"><RoleSelect user={u} isSelf={u.id === me?.id} /></td>
                <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-4 text-sm text-[var(--color-text-muted)]">Henüz kullanıcı yok.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/queries/admin/users.ts lib/server-actions/admin/update-user-role.ts components/admin/role-select.tsx app/admin/kullanicilar
git commit -m "feat(admin): add users list with role update"
```

---

## Task 9: Admin Products CRUD

**Files:**
- Create: `lib/db/queries/admin/products.ts`
- Create: `lib/validation/admin-product-schema.ts`
- Create: `lib/server-actions/admin/products.ts`
- Create: `components/admin/product-form.tsx`
- Create: `app/admin/urunler/page.tsx`
- Create: `app/admin/urunler/yeni/page.tsx`
- Create: `app/admin/urunler/[id]/page.tsx`

- [ ] **Step 1: queries**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Product } from '@/lib/db/types';

export async function listAdminProducts(): Promise<Product[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Product[];
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as Product;
}
```

- [ ] **Step 2: Zod schema**

```ts
// lib/validation/admin-product-schema.ts
import { z } from 'zod';

export const adminProductSchema = z.object({
  slug: z.string().min(1, 'Slug zorunludur').max(120).regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
  name: z.string().min(2).max(200),
  shortDescription: z.string().max(300).optional().or(z.literal('')),
  description: z.string().max(8000).optional().or(z.literal('')),
  categoryId: z.string().uuid().nullable().optional(),
  brand: z.string().max(120).optional().or(z.literal('')),
  sku: z.string().max(60).optional().or(z.literal('')),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  trackStock: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(z.string()).max(5),
  videos: z.array(z.string()).max(2),
  pdfs: z.array(z.string()).max(5),
  tags: z.array(z.string()).max(10),
  warrantyYears: z.number().int().nonnegative().nullable().optional(),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
```

- [ ] **Step 3: actions**

```ts
'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { adminProductSchema } from '@/lib/validation/admin-product-schema';

function toRow(d: ReturnType<typeof adminProductSchema.parse>) {
  return {
    slug: d.slug,
    name: d.name,
    short_description: d.shortDescription || null,
    description: d.description || null,
    category_id: d.categoryId || null,
    brand: d.brand || null,
    sku: d.sku || null,
    price: d.price,
    discount_price: d.discountPrice ?? null,
    stock: d.stock,
    track_stock: d.trackStock,
    is_active: d.isActive,
    is_featured: d.isFeatured,
    images: d.images,
    videos: d.videos,
    pdfs: d.pdfs,
    tags: d.tags,
    warranty_years: d.warrantyYears ?? null,
  };
}

export async function createProductAction(input: unknown) {
  await requireAdmin();
  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { data, error } = await sb.from('products').insert(toRow(parsed.data)).select('id').single();
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/urunler');
  redirect(`/admin/urunler/${data.id}`);
}

export async function updateProductAction(id: string, input: unknown) {
  await requireAdmin();
  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { error } = await sb.from('products').update(toRow(parsed.data)).eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/urunler');
  revalidatePath(`/admin/urunler/${id}`);
  return { ok: true as const };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from('products').delete().eq('id', id);
  revalidatePath('/admin/urunler');
  redirect('/admin/urunler');
}
```

- [ ] **Step 4: product-form.tsx**

```tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminProductSchema, type AdminProductInput } from '@/lib/validation/admin-product-schema';
import { createProductAction, updateProductAction, deleteProductAction } from '@/lib/server-actions/admin/products';
import type { Product, Category } from '@/lib/db/types';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<AdminProductInput> & { id?: string };
  categories: Category[];
}

export function ProductForm({ mode, initial, categories }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<AdminProductInput>({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    shortDescription: initial?.shortDescription ?? '',
    description: initial?.description ?? '',
    categoryId: initial?.categoryId ?? null,
    brand: initial?.brand ?? '',
    sku: initial?.sku ?? '',
    price: initial?.price ?? 0,
    discountPrice: initial?.discountPrice ?? null,
    stock: initial?.stock ?? 0,
    trackStock: initial?.trackStock ?? true,
    isActive: initial?.isActive ?? true,
    isFeatured: initial?.isFeatured ?? false,
    images: initial?.images ?? [],
    videos: initial?.videos ?? [],
    pdfs: initial?.pdfs ?? [],
    tags: initial?.tags ?? [],
    warrantyYears: initial?.warrantyYears ?? null,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  function set<K extends keyof AdminProductInput>(k: K, v: AdminProductInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = adminProductSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = mode === 'create'
      ? await createProductAction(r.data)
      : await updateProductAction(initial!.id!, r.data);
    setPending(false);
    if (res && !res.ok) setErrors({ _form: res.error });
    else if (res && res.ok) router.refresh();
  }

  async function onDelete() {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    await deleteProductAction(initial!.id!);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Temel Bilgiler</legend>
        <Field label="Ürün adı *" error={errors.name}><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Slug (URL) *" error={errors.slug}><Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="ornek-urun" /></Field>
        <Field label="Kategori"><select value={form.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value || null)} className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
          <option value="">— Yok —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></Field>
        <Field label="Marka"><Input value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} /></Field>
        <Field label="SKU"><Input value={form.sku ?? ''} onChange={(e) => set('sku', e.target.value)} /></Field>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Açıklama</legend>
        <Field label="Kısa açıklama"><Input value={form.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)} /></Field>
        <Field label="Detaylı açıklama (markdown)">
          <textarea rows={8} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 font-mono text-sm" />
        </Field>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Medya</legend>
        <ArrayField label="Görsel URL'leri (max 5)" values={form.images} onChange={(v) => set('images', v)} max={5} />
        <ArrayField label="Video URL'leri (max 2)" values={form.videos} onChange={(v) => set('videos', v)} max={2} />
        <ArrayField label="PDF URL'leri (max 5)" values={form.pdfs} onChange={(v) => set('pdfs', v)} max={5} />
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Fiyat ve Stok</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fiyat (TL) *" error={errors.price}><Input type="number" step="0.01" value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></Field>
          <Field label="İndirimli fiyat"><Input type="number" step="0.01" value={form.discountPrice ?? ''} onChange={(e) => set('discountPrice', e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Stok adedi *" error={errors.stock}><Input type="number" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} /></Field>
          <Field label="Garanti (yıl)"><Input type="number" value={form.warrantyYears ?? ''} onChange={(e) => set('warrantyYears', e.target.value ? Number(e.target.value) : null)} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.trackStock} onChange={(e) => set('trackStock', e.target.checked)} className="h-4 w-4" /> Stok takibi aktif</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="h-4 w-4" /> Yayında</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="h-4 w-4" /> Öne çıkan</label>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Etiketler</legend>
        <ArrayField label="Etiketler (max 10)" values={form.tags} onChange={(v) => set('tags', v)} max={10} />
      </fieldset>

      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{pending ? 'Kaydediliyor…' : mode === 'create' ? 'Ekle' : 'Kaydet'}</Button>
        </div>
        {mode === 'edit' && (
          <Button type="button" variant="destructive" onClick={onDelete}>Sil</Button>
        )}
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

function ArrayField({ label, values, onChange, max }: { label: string; values: string[]; onChange: (v: string[]) => void; max: number }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1 space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input value={v} onChange={(e) => { const next = [...values]; next[i] = e.target.value; onChange(next); }} />
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="rounded-xl border border-[var(--color-danger)] px-3 text-sm text-[var(--color-danger)]">Sil</button>
          </div>
        ))}
        {values.length < max && (
          <button type="button" onClick={() => onChange([...values, ''])} className="rounded-xl border border-dashed border-[var(--color-border)] px-3 py-1 text-sm">+ Ekle</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: pages**

```tsx
// app/admin/urunler/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { listAdminProducts } from '@/lib/db/queries/admin/products';
import { Button } from '@/components/ui/button';
import { formatTry } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

export default async function AdminUrunlerPage() {
  const products = await listAdminProducts();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Ürünler</h1>
        <Button asChild><Link href="/admin/urunler/yeni">+ Yeni Ürün</Link></Button>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="w-16 px-4 py-3">Görsel</th>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3">
                  {p.images[0] ? <Image src={p.images[0]} alt={p.name} width={48} height={48} className="rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-[var(--color-bg-overlay)]" />}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku ?? '—'}</td>
                <td className="px-4 py-3">{formatTry(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.isActive ? <span className="text-green-500">Aktif</span> : <span className="text-[var(--color-text-muted)]">Pasif</span>}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/urunler/${p.id}`} className="text-[var(--color-brand)] hover:underline">Düzenle</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

```tsx
// app/admin/urunler/yeni/page.tsx
import { ProductForm } from '@/components/admin/product-form';
import { listCategories } from '@/lib/db/queries/categories';

export const dynamic = 'force-dynamic';

export default async function YeniUrunPage() {
  const cats = await listCategories();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Yeni Ürün</h1>
      <ProductForm mode="create" categories={cats} />
    </div>
  );
}
```

```tsx
// app/admin/urunler/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getAdminProduct } from '@/lib/db/queries/admin/products';
import { listCategories } from '@/lib/db/queries/categories';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

interface PageProps { params: Promise<{ id: string }>; }

export default async function UrunDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), listCategories()]);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{product.name}</h1>
      <ProductForm
        mode="edit"
        initial={{ id: product.id, ...product, categoryId: product.categoryId, shortDescription: product.shortDescription, isActive: product.isActive, isFeatured: product.isFeatured, trackStock: product.trackStock, discountPrice: product.discountPrice, warrantyYears: product.warrantyYears }}
        categories={categories}
      />
    </div>
  );
}
```

- [ ] **Step 6: Build + commit**

Build çalışırken `listCategories` ve `Product` tipinin tüm alanlarına erişim olduğunu doğrula. `mapProductRow` mevcut değilse `lib/db/queries/products.ts`'in nasıl Product döndürdüğüne uy. Tip uyuşmazlıkları varsa adapter ekle.

```bash
npm run build
git add lib/db/queries/admin/products.ts lib/validation/admin-product-schema.ts lib/server-actions/admin/products.ts components/admin/product-form.tsx app/admin/urunler
git commit -m "feat(admin): add product CRUD (list, create, edit, delete)"
```

---

## Task 10: Admin Categories CRUD

**Files:**
- Create: `lib/db/queries/admin/categories.ts`
- Create: `lib/server-actions/admin/categories.ts`
- Create: `lib/validation/admin-category-schema.ts`
- Create: `components/admin/category-form.tsx`
- Create: `app/admin/kategoriler/page.tsx`
- Create: `app/admin/kategoriler/yeni/page.tsx`
- Create: `app/admin/kategoriler/[id]/page.tsx`

- [ ] **Step 1: queries**

```ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Category } from '@/lib/db/types';

export async function listAdminCategories(): Promise<Category[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('categories').select('*').order('sort_order');
  if (error || !data) return [];
  return data as Category[];
}

export async function getAdminCategory(id: string): Promise<Category | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from('categories').select('*').eq('id', id).maybeSingle();
  return (data as Category | null) ?? null;
}
```

- [ ] **Step 2: schema + actions**

```ts
// lib/validation/admin-category-schema.ts
import { z } from 'zod';

export const adminCategorySchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().max(50).optional().or(z.literal('')),
  sortOrder: z.number().int().nonnegative(),
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
```

```ts
// lib/server-actions/admin/categories.ts
'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { adminCategorySchema } from '@/lib/validation/admin-category-schema';

function toRow(d: ReturnType<typeof adminCategorySchema.parse>) {
  return {
    slug: d.slug, name: d.name,
    description: d.description || null,
    parent_id: d.parentId || null,
    icon: d.icon || null,
    sort_order: d.sortOrder,
  };
}

export async function createCategoryAction(input: unknown) {
  await requireAdmin();
  const r = adminCategorySchema.safeParse(input);
  if (!r.success) return { ok: false as const, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { data, error } = await sb.from('categories').insert(toRow(r.data)).select('id').single();
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/kategoriler');
  redirect(`/admin/kategoriler/${data.id}`);
}

export async function updateCategoryAction(id: string, input: unknown) {
  await requireAdmin();
  const r = adminCategorySchema.safeParse(input);
  if (!r.success) return { ok: false as const, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { error } = await sb.from('categories').update(toRow(r.data)).eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/kategoriler');
  revalidatePath(`/admin/kategoriler/${id}`);
  return { ok: true as const };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from('categories').delete().eq('id', id);
  revalidatePath('/admin/kategoriler');
  redirect('/admin/kategoriler');
}
```

- [ ] **Step 3: form + pages**

`components/admin/category-form.tsx` — ProductForm'un sade hali. Ana Kategori dropdown'u `parent_id is null` olan kategorileri listeler.

`app/admin/kategoriler/page.tsx` — basit liste. `app/admin/kategoriler/yeni/page.tsx` ve `[id]/page.tsx` — form sayfaları.

(Ürünlerle aynı kalıp; tekrarı önlemek için Task 9 ile aynı pattern.)

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/admin/categories.ts lib/validation/admin-category-schema.ts lib/server-actions/admin/categories.ts components/admin/category-form.tsx app/admin/kategoriler
git commit -m "feat(admin): add category CRUD"
```

---

## Task 11: Admin Projects CRUD

**Files:**
- Create: `lib/db/queries/admin/projects.ts`
- Create: `lib/server-actions/admin/projects.ts`
- Create: `lib/validation/admin-project-schema.ts`
- Create: `components/admin/project-form.tsx`
- Create: `app/admin/projeler/page.tsx`
- Create: `app/admin/projeler/yeni/page.tsx`
- Create: `app/admin/projeler/[id]/page.tsx`

Aynı kalıp:
- Zod schema (slug, title, type 'konut'|'ticari'|'tarim', location, capacityKwp, coverImage, description, before/after, galleryImages array, customerQuote/Name, annualSavingsTry, completionDate, isPublished, sortOrder)
- queries: list, get, create, update, delete
- form: ProductForm benzeri (radio buttons for type, ArrayField for galleryImages)
- pages: list + new + edit

```bash
git add lib/db/queries/admin/projects.ts lib/validation/admin-project-schema.ts lib/server-actions/admin/projects.ts components/admin/project-form.tsx app/admin/projeler
git commit -m "feat(admin): add project CRUD"
```

---

## Task 12: Admin FAQs CRUD

**Files:**
- Create: `lib/db/queries/admin/faqs.ts`
- Create: `lib/server-actions/admin/faqs.ts`
- Create: `lib/validation/admin-faq-schema.ts`
- Create: `components/admin/faq-form.tsx`
- Create: `app/admin/sss/page.tsx`
- Create: `app/admin/sss/yeni/page.tsx`
- Create: `app/admin/sss/[id]/page.tsx`

Aynı kalıp:
- Zod: question, answer (markdown), category enum 'genel'|'teknik'|'fiyat'|'kurulum'|'garanti', sortOrder, isPublished
- Form: textarea for answer (markdown), select for category
- Pages: list (gruplanmış kategoriye göre olabilir), new, edit

```bash
git add lib/db/queries/admin/faqs.ts lib/validation/admin-faq-schema.ts lib/server-actions/admin/faqs.ts components/admin/faq-form.tsx app/admin/sss
git commit -m "feat(admin): add FAQ CRUD"
```

---

## Task 13: NotificationCenter (header rozet + dropdown)

**Files:**
- Create: `components/admin/notification-bell.tsx`
- Create: `lib/server-actions/admin/mark-notification-read.ts`
- Modify: `components/account/user-menu.tsx` — admin için NotificationBell ekle

- [ ] **Step 1: action**

```ts
'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

export async function markNotificationReadAction(id: string) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from('notifications').update({ is_read: true }).eq('id', id);
  revalidatePath('/admin');
}

export async function markAllNotificationsReadAction() {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from('notifications').update({ is_read: true }).eq('is_read', false);
  revalidatePath('/admin');
}
```

- [ ] **Step 2: notification-bell.tsx (server component, sadece admin için render edilir)**

```tsx
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { getRecentNotifications } from '@/lib/db/queries/admin/dashboard';

export async function NotificationBell() {
  const recent = await getRecentNotifications(5);
  const unreadCount = recent.filter((n) => !n.isRead).length;

  return (
    <Link
      href="/admin"
      aria-label={`Admin bildirimleri (${unreadCount} okunmamış)`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] hover:border-[var(--color-brand)]/40"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-brand)] px-1 text-xs font-medium text-[var(--color-bg-base)]">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 3: user-menu.tsx güncelle**

`components/account/user-menu.tsx`'i oku. Admin (role === 'admin') için, mevcut UserMenu dropdown'ından önce `<NotificationBell />` ekle. Async server component olarak çalışacak.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add lib/server-actions/admin/mark-notification-read.ts components/admin/notification-bell.tsx components/account/user-menu.tsx
git commit -m "feat(admin): add header notification bell with unread count"
```

---

## Task 14: Final verification + completion report

**Files:**
- Create: `docs/superpowers/plans/2026-05-06-faz-8-completion.md`

- [ ] **Step 1: Doğrulama**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Tüm rotalar görünmeli: /admin, /admin/teklifler, /admin/teklifler/[id], /admin/bayiler, /admin/bayiler/[id], /admin/iletisim, /admin/iletisim/[id], /admin/kullanicilar, /admin/urunler, /admin/urunler/yeni, /admin/urunler/[id], /admin/kategoriler, /admin/kategoriler/yeni, /admin/kategoriler/[id], /admin/projeler, /admin/projeler/yeni, /admin/projeler/[id], /admin/sss, /admin/sss/yeni, /admin/sss/[id].

- [ ] **Step 2: Completion report**

```md
# Faz 8 — Admin Paneli: Completion Report

**Tarih:** 2026-05-06
**Branch:** master
**Plan:** docs/superpowers/plans/2026-05-06-faz-8-admin-paneli.md

## Özet

Admin rolündeki kullanıcılar için /admin paneli — dashboard (KPI + son bildirimler),
gelen taleplerin yönetimi (teklif/bayi/iletişim), kullanıcı rol yönetimi, ve içerik
CRUD (ürün/kategori/proje/SSS). Notifications tablosu DB trigger'ları ile auto-populate.

## Sayılar

- Görev: 14
- Test: <NNN> / <NNN> ✅
- TypeScript: temiz
- Build: temiz
- Yeni route: ~20

## Bilinen sınırlamalar

- AI bilgi yönetimi (RAG, pgvector) → Faz 9
- Tedarikçi sync arayüzü → Faz 9
- Recharts dashboard grafikleri → Faz 9
- Realtime canlı bildirim akışı → Faz 9
- Web push notifications → Faz 9
- Resend e-posta entegrasyonu → Faz 10
- Sipariş yönetimi (orders henüz yok) → ileride

## Kullanıcı eylemi gerekli

1. Supabase Studio SQL Editor → `combined_for_paste_v6.sql` yapıştır → **Run**.
2. /kayit ile bir hesap aç. Sonra Supabase Studio SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'sizin@mail.com';
   ```
3. /giris ile o hesaba giriş yap. Header'da admin avatar'ında "Admin" ve bildirim zili görünür.
4. /admin'e gir → dashboard.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/2026-05-06-faz-8-completion.md
git commit -m "docs: Phase 8 completion report"
```

---

## Self-Review

**Spec coverage (§12):**
- 12.1 Erişim mantığı (admin gizli) ✅ Task 3 (notFound for non-admin)
- 12.2 Dashboard (KPI + bildirim feed) ✅ Task 4 (Recharts grafiği erteledi → Faz 9)
- 12.3 Bildirim merkezi ✅ Task 13 + Task 4 (NEW_QUOTE/DEALER/CONTACT)
- 12.4 Ürün yönetimi ✅ Task 9 (tedarikçi entegrasyonu kısmı erteledi → Faz 9; SEO alanları erteledi)
- 12.5 Diğer admin sayfaları:
  - Kategoriler ✅ Task 10
  - Kampanyalar ⏳ Faz 9 (campaigns tablosu yok)
  - Projeler ✅ Task 11
  - Siparişler ⏳ orders henüz yok
  - Teklifler ✅ Task 5
  - Bayiler ✅ Task 6
  - SSS ✅ Task 12
  - Yorumlar ⏳ product_reviews tablosu yok, ileride
  - İletişim ✅ Task 7
  - Kullanıcılar ✅ Task 8
  - AI Bilgi ⏳ Faz 9
  - Tedarikçi ⏳ Faz 9
  - Raporlar ⏳ Faz 9 (Recharts ile)
  - Ayarlar ⏳ Faz 9 (site_settings tablosu yok)
- 12.6 Roller ve yetkiler ✅ kısmen (admin tam yetkili; moderator/assistant rolleri tip seviyesinde tanımlı, sayfa-bazlı yetki kontrolü erteledi)

**Placeholder scan:** "TODO" yok. Erteleme nedenleri net.

**Type consistency:**
- AdminQuote, AdminDealer, AdminContactMessage, AdminUser, Notification — Task 2'de tanımlandı, ilgili task'larda aynı şekilde tüketiliyor.
- requireAdmin() helper'ı tüm admin query/action dosyalarında dosya başında çağrılıyor.
- createAdminClient() service role key kullanır; sadece requireAdmin() doğrulamasından sonra kullanılması test edilmeli.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-06-faz-8-admin-paneli.md`. Subagent-Driven ile yürütülecek.**
