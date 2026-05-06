# Faz 7 — Auth & Hesap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase Auth (e-posta + şifre) ile kullanıcı kimlik doğrulamasını ekle. /giris, /kayit, /sifremi-unuttum, /sifre-yenile public sayfalarını; /hesap, /hesap/profil, /hesap/teklifler, /hesap/favoriler, /hesap/bildirimler korumalı sayfalarını yap. Header'a kullanıcı menüsü ekle, admin rolü için gizli buton göster, AI 10→50 mesaj/gün limit yükseltmesi yap, /ayarlar'daki ertelenmiş bölümleri canlandır.

**Architecture:** Supabase Auth + RLS. `auth.users` tablosu Supabase tarafından yönetilir; `public.profiles` tablosu `handle_new_user` trigger'ı ile auto-populate edilir (id = auth.users.id). Korumalı `/hesap/*` rotaları middleware ile gate'lenir; sunucu sayfaları `getCurrentUser()` ile session okur. RLS: kullanıcılar sadece kendi profile/quotes/favorites/stock_alerts satırlarını görür/düzenler.

**Tech Stack:** Supabase Auth (e-posta/şifre — Google OAuth ertelendi), `@supabase/ssr` (kullanılıyor), Next.js 16 middleware, Zod, react-hook-form-free controlled state (mevcut form kalıbı), Vitest.

---

## Pre-flight

Plan tamamlandığında kullanıcı:
1. `supabase/migrations/combined_for_paste_v5.sql`'i Supabase Studio'da çalıştırır
2. Supabase Studio → Authentication → Providers → **Email** etkin olduğundan emin olur
3. (opsiyonel) Authentication → Email Templates → "Confirm signup" + "Reset password" şablonlarını Türkçeleştirir

---

## File Structure

| Path | Sorumluluk |
|------|------------|
| `supabase/migrations/0009_auth_profiles.sql` | profiles + addresses + favorites + stock_alerts + quotes.user_id + handle_new_user trigger |
| `supabase/migrations/combined_for_paste_v5.sql` | Paste-ready |
| `lib/db/types.ts` | `Profile`, `Address`, `Favorite`, `StockAlert` interface'leri eklenir |
| `lib/db/queries/profiles.ts` | `getProfile`, `updateProfile` |
| `lib/db/queries/favorites.ts` | `listUserFavorites`, `isFavorited`, `toggleFavorite` |
| `lib/db/queries/stock-alerts.ts` | `listUserStockAlerts`, `subscribeStockAlert`, `unsubscribeStockAlert` |
| `lib/db/queries/user-quotes.ts` | `listUserQuotes` |
| `lib/auth/server.ts` | Server-only: `getCurrentUser`, `getCurrentProfile`, `requireUser`, `isAdmin` |
| `lib/auth/actions.ts` | Server actions: `signUpAction`, `signInAction`, `signOutAction`, `requestPasswordResetAction`, `updatePasswordAction`, `updateProfileAction` |
| `lib/validation/auth-schema.ts` | Zod: `loginSchema`, `registerSchema`, `resetRequestSchema`, `resetSchema`, `profileEditSchema` |
| `middleware.ts` | /hesap/* korumalı; /giris ve /kayit'da oturum varsa /hesap'a yönlendir |
| `components/auth/login-form.tsx` | E-posta + şifre |
| `components/auth/register-form.tsx` | Ad + e-posta + şifre + şifre tekrar + KVKK |
| `components/auth/password-reset-request-form.tsx` | E-posta |
| `components/auth/password-reset-form.tsx` | Yeni şifre + tekrar |
| `components/auth/auth-card.tsx` | Form sayfaları için ortak kart kabuğu |
| `components/account/user-menu.tsx` | Header dropdown |
| `components/account/account-sidebar.tsx` | /hesap layout sidebar |
| `components/account/profile-edit-form.tsx` | /hesap/profil formu |
| `components/account/quote-list-item.tsx` | Tek teklif satırı |
| `components/account/favorite-button.tsx` | Mağaza ürün detayında ❤️ toggle |
| `components/account/stock-alert-button.tsx` | Stoksuz ürün detayında 🔔 toggle |
| `components/account/stock-alert-list-item.tsx` | /hesap/bildirimler satırı |
| `components/account/admin-link.tsx` | Header'da admin gizli buton |
| `app/giris/page.tsx` | Login |
| `app/kayit/page.tsx` | Register |
| `app/sifremi-unuttum/page.tsx` | Reset request |
| `app/sifre-yenile/page.tsx` | Reset form |
| `app/auth/callback/route.ts` | Supabase auth callback (email confirm + reset) |
| `app/hesap/layout.tsx` | Sidebar + content shell |
| `app/hesap/page.tsx` | Dashboard (özet kartlar) |
| `app/hesap/profil/page.tsx` | Profil edit |
| `app/hesap/teklifler/page.tsx` | Teklif listesi |
| `app/hesap/favoriler/page.tsx` | Favori ürünler |
| `app/hesap/bildirimler/page.tsx` | Stock alerts |
| `tests/lib/auth-schema.test.ts` | Zod schemas |
| `tests/lib/profiles-helpers.test.ts` | Row mapping |
| `tests/components/auth/login-form.test.tsx` | TDD |
| `tests/components/auth/register-form.test.tsx` | TDD |
| `tests/components/account/favorite-button.test.tsx` | TDD |

---

## Task 1: Migration 0009 — auth + extension tables + trigger

**Files:**
- Create: `supabase/migrations/0009_auth_profiles.sql`

- [ ] **Step 1: SQL yaz**

```sql
-- 0009_auth_profiles.sql
-- Profiles, addresses, favorites, stock_alerts, quotes.user_id, handle_new_user trigger.

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  role text not null default 'customer'
    check (role in ('customer','moderator','assistant','admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- ============ HANDLE_NEW_USER TRIGGER ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ADDRESSES ============
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  full_name text not null,
  phone text not null,
  city text not null,
  district text,
  postal_code text,
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses(user_id);

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "addresses_self_all" on public.addresses;
create policy "addresses_self_all" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ FAVORITES ============
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_user_idx on public.favorites(user_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "favorites_self_all" on public.favorites;
create policy "favorites_self_all" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ STOCK ALERTS ============
create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  email text not null,
  notified boolean not null default false,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists stock_alerts_user_idx on public.stock_alerts(user_id, created_at desc);
create index if not exists stock_alerts_product_idx on public.stock_alerts(product_id) where notified = false;

alter table public.stock_alerts enable row level security;

drop policy if exists "stock_alerts_self_all" on public.stock_alerts;
create policy "stock_alerts_self_all" on public.stock_alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ QUOTES.USER_ID ============
alter table public.quotes
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists quotes_user_idx on public.quotes(user_id, created_at desc);

drop policy if exists "quotes_self_read" on public.quotes;
create policy "quotes_self_read" on public.quotes
  for select using (auth.uid() = user_id);
```

- [ ] **Step 2: combined_for_paste_v5.sql**

`supabase/migrations/combined_for_paste_v5.sql` — sadece 0009'un içeriği + sondaki doğrulama:

```sql
-- combined_for_paste_v5.sql
-- 0009_auth_profiles.sql tüm içeriği aynen

[0009 içeriği]

-- Doğrulama
select to_regclass('public.profiles') is not null as profiles_exists,
       to_regclass('public.addresses') is not null as addresses_exists,
       to_regclass('public.favorites') is not null as favorites_exists,
       to_regclass('public.stock_alerts') is not null as stock_alerts_exists,
       (select column_name from information_schema.columns
        where table_name='quotes' and column_name='user_id') is not null as quotes_user_id_exists;
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0009_auth_profiles.sql supabase/migrations/combined_for_paste_v5.sql
git commit -m "feat(db): add auth profiles, addresses, favorites, stock_alerts, quotes.user_id"
```

---

## Task 2: Type definitions

**Files:**
- Modify: `lib/db/types.ts`

- [ ] **Step 1: Mevcut dosyaya append**

```ts
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'moderator' | 'assistant' | 'admin';
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  district: string | null;
  postalCode: string | null;
  address: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  userId: string;
  productId: string;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  userId: string;
  productId: string;
  email: string;
  notified: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

export interface UserQuote {
  id: string;
  quoteNumber: string;
  city: string;
  installationLocation: string;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  estimatedKwp: number | null;
  estimatedSavingsTry: number | null;
  createdAt: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/types.ts
git commit -m "feat(types): add Profile, Address, Favorite, StockAlert, UserQuote types"
```

---

## Task 3: Auth Zod schemas (TDD)

**Files:**
- Create: `lib/validation/auth-schema.ts`
- Create: `tests/lib/auth-schema.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  resetSchema,
  profileEditSchema,
} from '@/lib/validation/auth-schema';

describe('auth schemas', () => {
  it('loginSchema rejects empty password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(r.success).toBe(false);
  });

  it('loginSchema accepts valid input', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'X1abcdef' });
    expect(r.success).toBe(true);
  });

  it('registerSchema rejects mismatched passwords', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmet',
      email: 'a@b.com',
      password: 'X1abcdef',
      passwordConfirm: 'different',
      kvkkAccepted: true,
    });
    expect(r.success).toBe(false);
  });

  it('registerSchema requires KVKK acceptance', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmet',
      email: 'a@b.com',
      password: 'X1abcdef',
      passwordConfirm: 'X1abcdef',
      kvkkAccepted: false,
    });
    expect(r.success).toBe(false);
  });

  it('registerSchema rejects weak password (<8 chars)', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmet',
      email: 'a@b.com',
      password: 'short',
      passwordConfirm: 'short',
      kvkkAccepted: true,
    });
    expect(r.success).toBe(false);
  });

  it('resetRequestSchema accepts valid email', () => {
    expect(resetRequestSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('resetSchema rejects mismatched passwords', () => {
    const r = resetSchema.safeParse({ password: 'X1abcdef', passwordConfirm: 'other' });
    expect(r.success).toBe(false);
  });

  it('profileEditSchema accepts name + phone', () => {
    expect(profileEditSchema.safeParse({ name: 'Ahmet', phone: '+90' }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Test fail**

```bash
npx vitest run tests/lib/auth-schema.test.ts
```

- [ ] **Step 3: Implementation**

```ts
import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .max(72, 'Şifre 72 karakteri aşamaz');

export const loginSchema = z.object({
  email: z.email('Geçerli bir e-posta giriniz'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Adınızı girin').max(120),
    email: z.email('Geçerli bir e-posta giriniz'),
    password: passwordRule,
    passwordConfirm: z.string(),
    kvkkAccepted: z
      .boolean()
      .refine((v) => v === true, { message: 'KVKK metnini onaylamanız gerekir' }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  });

export const resetRequestSchema = z.object({
  email: z.email('Geçerli bir e-posta giriniz'),
});

export const resetSchema = z
  .object({
    password: passwordRule,
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  });

export const profileEditSchema = z.object({
  name: z.string().min(2, 'Adınızı girin').max(120),
  phone: z.string().max(30).optional().or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
```

- [ ] **Step 4: Commit**

```bash
npx vitest run tests/lib/auth-schema.test.ts
git add lib/validation/auth-schema.ts tests/lib/auth-schema.test.ts
git commit -m "feat(auth): add Zod schemas for login, register, reset, profile"
```

---

## Task 4: Server-side auth helpers

**Files:**
- Create: `lib/auth/server.ts`

- [ ] **Step 1: Implementation**

```ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/db/types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,name,phone,role,avatar_url,created_at,updated_at')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth/server.ts
git commit -m "feat(auth): add server-side auth helpers (getCurrentUser, getCurrentProfile, requireUser, isAdmin)"
```

---

## Task 5: Auth server actions

**Files:**
- Create: `lib/auth/actions.ts`

- [ ] **Step 1: Implementation**

```ts
'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  resetSchema,
  profileEditSchema,
} from '@/lib/validation/auth-schema';

export type ActionResult = { ok: true } | { ok: false; error: string };

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: 'E-posta veya şifre hatalı.' };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/hesap`,
      data: { name: parsed.data.name },
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { ok: false, error: 'Bu e-posta zaten kayıtlı.' };
    }
    return { ok: false, error: 'Kayıt sırasında bir hata oluştu.' };
  }
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Geçerli bir e-posta giriniz.' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/sifre-yenile`,
  });
  if (error) {
    return { ok: false, error: 'İstek gönderilemedi, lütfen tekrar deneyin.' };
  }
  return { ok: true };
}

export async function updatePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: 'Şifre güncellenemedi.' };
  }
  return { ok: true };
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = profileEditSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Oturum gerekli.' };
  const { error } = await supabase
    .from('profiles')
    .update({ name: parsed.data.name, phone: parsed.data.phone || null })
    .eq('id', user.id);
  if (error) {
    return { ok: false, error: 'Profil kaydedilemedi.' };
  }
  revalidatePath('/hesap');
  revalidatePath('/hesap/profil');
  return { ok: true };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth/actions.ts
git commit -m "feat(auth): add server actions (signIn, signUp, signOut, reset, updateProfile)"
```

---

## Task 6: Auth callback route handler

**Files:**
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Implementation**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/hesap';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
```

- [ ] **Step 2: Commit**

```bash
git add app/auth/callback/route.ts
git commit -m "feat(auth): add /auth/callback route for email confirm + reset"
```

---

## Task 7: middleware.ts — protect /hesap/*

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Implementation**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PREFIXES = ['/hesap'];
const GUEST_ONLY = ['/giris', '/kayit', '/sifremi-unuttum'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  if (PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`)) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/giris';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (user && GUEST_ONLY.some((p) => path === p)) {
    const url = req.nextUrl.clone();
    url.pathname = '/hesap';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/hesap',
    '/hesap/:path*',
    '/giris',
    '/kayit',
    '/sifremi-unuttum',
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): add middleware for /hesap protection and guest-only routes"
```

---

## Task 8: AuthCard wrapper component

**Files:**
- Create: `components/auth/auth-card.tsx`

- [ ] **Step 1: Implementation**

```tsx
import * as React from 'react';
import Link from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: Props) {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="glass rounded-2xl p-8 shadow-[var(--shadow-glass)]">
        <header className="mb-6 text-center">
          <Link href="/" className="font-display text-2xl font-bold text-[var(--color-brand)]">
            Zolarr
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </header>
        {children}
        {footer && <footer className="mt-6 border-t border-[var(--color-border-glass)] pt-4 text-center text-sm">{footer}</footer>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/auth-card.tsx
git commit -m "feat(auth): add AuthCard wrapper for login/register pages"
```

---

## Task 9: LoginForm (TDD) + /giris page

**Files:**
- Create: `components/auth/login-form.tsx`
- Create: `tests/components/auth/login-form.test.tsx`
- Create: `app/giris/page.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const signInMock = vi.fn();
vi.mock('@/lib/auth/actions', () => ({
  signInAction: (...args: unknown[]) => signInMock(...args),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

import { LoginForm } from '@/components/auth/login-form';

describe('LoginForm', () => {
  it('shows error message when server returns failure', async () => {
    signInMock.mockResolvedValueOnce({ ok: false, error: 'E-posta veya şifre hatalı.' });
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/Şifre/i), 'X1abcdef');
    await user.click(screen.getByRole('button', { name: /Giriş Yap/i }));
    expect(await screen.findByText(/E-posta veya şifre hatalı/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test fail**

```bash
npx vitest run tests/components/auth/login-form.test.tsx
```

- [ ] **Step 3: LoginForm implementation**

```tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInAction } from '@/lib/auth/actions';
import { loginSchema } from '@/lib/validation/auth-schema';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = loginSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await signInAction(r.data);
    setPending(false);
    if (res.ok) {
      router.push(params.get('next') ?? '/hesap');
      router.refresh();
    } else {
      setErrors({ _form: res.error });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="text-sm font-medium">E-posta</label>
        <Input id="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        {errors.email && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="login-password" className="text-sm font-medium">Şifre</label>
        <Input id="login-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        {errors.password && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.password}</p>}
      </div>
      <div className="text-right">
        <Link href="/sifremi-unuttum" className="text-sm text-[var(--color-brand)] hover:underline">
          Şifremi unuttum
        </Link>
      </div>
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: /giris page**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Giriş | Zolarr',
  description: 'Hesabınıza giriş yapın.',
};

export default function GirisPage() {
  return (
    <AuthCard
      title="Giriş Yap"
      subtitle="Hesabınızla giriş yaparak siparişlerinizi ve tekliflerinizi takip edin."
      footer={
        <span>
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="font-medium text-[var(--color-brand)] hover:underline">
            Kayıt olun
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
```

- [ ] **Step 5: Test geçsin + commit**

```bash
npx vitest run tests/components/auth/login-form.test.tsx
git add components/auth/login-form.tsx tests/components/auth/login-form.test.tsx app/giris/page.tsx
git commit -m "feat(auth): add LoginForm and /giris page"
```

---

## Task 10: RegisterForm (TDD) + /kayit page

**Files:**
- Create: `components/auth/register-form.tsx`
- Create: `tests/components/auth/register-form.test.tsx`
- Create: `app/kayit/page.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const signUpMock = vi.fn();
vi.mock('@/lib/auth/actions', () => ({
  signUpAction: (...args: unknown[]) => signUpMock(...args),
}));

import { RegisterForm } from '@/components/auth/register-form';

describe('RegisterForm', () => {
  it('shows password mismatch error', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^Şifre$/i), 'X1abcdef');
    await user.type(screen.getByLabelText(/Şifre Tekrar/i), 'different1');
    await user.click(screen.getByLabelText(/KVKK/i));
    await user.click(screen.getByRole('button', { name: /Kayıt Ol/i }));
    expect(await screen.findByText(/Şifreler eşleşmiyor/i)).toBeInTheDocument();
  });

  it('shows success state after server returns ok', async () => {
    signUpMock.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/Ad Soyad/i), 'Ahmet');
    await user.type(screen.getByLabelText(/E-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^Şifre$/i), 'X1abcdef');
    await user.type(screen.getByLabelText(/Şifre Tekrar/i), 'X1abcdef');
    await user.click(screen.getByLabelText(/KVKK/i));
    await user.click(screen.getByRole('button', { name: /Kayıt Ol/i }));
    expect(await screen.findByText(/E-postanıza onay bağlantısı/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test fail**

- [ ] **Step 3: RegisterForm implementation**

```tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpAction } from '@/lib/auth/actions';
import { registerSchema } from '@/lib/validation/auth-schema';

export function RegisterForm() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    kvkkAccepted: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = registerSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await signUpAction(r.data);
    setPending(false);
    if (res.ok) setSuccess(true);
    else setErrors({ _form: res.error });
  }

  if (success) {
    return (
      <div className="text-center">
        <h3 className="font-display text-xl font-semibold">Kayıt başarılı!</h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          E-postanıza onay bağlantısı gönderildi. Bağlantıya tıkladıktan sonra giriş yapabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="reg-name" label="Ad Soyad *" error={errors.name}>
        <Input id="reg-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
      </Field>
      <Field id="reg-email" label="E-posta *" error={errors.email}>
        <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
      </Field>
      <Field id="reg-pw" label="Şifre *" error={errors.password}>
        <Input id="reg-pw" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
      </Field>
      <Field id="reg-pw2" label="Şifre Tekrar *" error={errors.passwordConfirm}>
        <Input id="reg-pw2" type="password" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} autoComplete="new-password" />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.kvkkAccepted}
          onChange={(e) => setForm({ ...form, kvkkAccepted: e.target.checked })}
          className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
        />
        <span>KVKK aydınlatma metnini okudum ve verilerimin işlenmesine onay veriyorum. *</span>
      </label>
      {errors.kvkkAccepted && <p className="text-sm text-[var(--color-danger)]">{errors.kvkkAccepted}</p>}
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Hesap oluşturuluyor…' : 'Kayıt Ol'}
      </Button>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: /kayit page**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Kayıt | Zolarr',
  description: 'Yeni hesap oluşturun.',
};

export default function KayitPage() {
  return (
    <AuthCard
      title="Hesap Oluştur"
      subtitle="Birkaç saniye içinde Zolarr&apos;a katılın."
      footer={
        <span>
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="font-medium text-[var(--color-brand)] hover:underline">
            Giriş yapın
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
```

- [ ] **Step 5: Test + commit**

```bash
npx vitest run tests/components/auth/register-form.test.tsx
git add components/auth/register-form.tsx tests/components/auth/register-form.test.tsx app/kayit/page.tsx
git commit -m "feat(auth): add RegisterForm and /kayit page"
```

---

## Task 11: Password reset request + form pages

**Files:**
- Create: `components/auth/password-reset-request-form.tsx`
- Create: `components/auth/password-reset-form.tsx`
- Create: `app/sifremi-unuttum/page.tsx`
- Create: `app/sifre-yenile/page.tsx`

- [ ] **Step 1: password-reset-request-form.tsx**

```tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordResetAction } from '@/lib/auth/actions';
import { resetRequestSchema } from '@/lib/validation/auth-schema';

export function PasswordResetRequestForm() {
  const [email, setEmail] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = resetRequestSchema.safeParse({ email });
    if (!r.success) {
      setErrorMsg(r.error.issues[0]?.message ?? 'Geçersiz e-posta');
      return;
    }
    setErrorMsg(null);
    setPending(true);
    const res = await requestPasswordResetAction(r.data);
    setPending(false);
    if (res.ok) setSent(true);
    else setErrorMsg(res.error);
  }

  if (sent) {
    return <p className="text-center text-sm">E-postanızı kontrol edin — sıfırlama bağlantısı gönderildi.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-email" className="text-sm font-medium">E-posta</label>
        <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      {errorMsg && <p role="alert" className="text-sm text-[var(--color-danger)]">{errorMsg}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: password-reset-form.tsx**

```tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePasswordAction } from '@/lib/auth/actions';
import { resetSchema } from '@/lib/validation/auth-schema';

export function PasswordResetForm() {
  const router = useRouter();
  const [form, setForm] = React.useState({ password: '', passwordConfirm: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = resetSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await updatePasswordAction(r.data);
    setPending(false);
    if (res.ok) router.push('/hesap');
    else setErrors({ _form: res.error });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-pw" className="text-sm font-medium">Yeni Şifre</label>
        <Input id="new-pw" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
        {errors.password && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.password}</p>}
      </div>
      <div>
        <label htmlFor="new-pw2" className="text-sm font-medium">Şifre Tekrar</label>
        <Input id="new-pw2" type="password" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} autoComplete="new-password" />
        {errors.passwordConfirm && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.passwordConfirm}</p>}
      </div>
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: app/sifremi-unuttum/page.tsx**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum | Zolarr',
};

export default function SifremiUnuttumPage() {
  return (
    <AuthCard
      title="Şifremi Unuttum"
      subtitle="E-posta adresinize sıfırlama bağlantısı göndereceğiz."
      footer={
        <span>
          <Link href="/giris" className="font-medium text-[var(--color-brand)] hover:underline">
            Giriş sayfasına dön
          </Link>
        </span>
      }
    >
      <PasswordResetRequestForm />
    </AuthCard>
  );
}
```

- [ ] **Step 4: app/sifre-yenile/page.tsx**

```tsx
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { PasswordResetForm } from '@/components/auth/password-reset-form';

export const metadata: Metadata = {
  title: 'Şifre Yenile | Zolarr',
};

export default function SifreYenilePage() {
  return (
    <AuthCard title="Yeni Şifre Belirle" subtitle="Yeni şifrenizi girin.">
      <PasswordResetForm />
    </AuthCard>
  );
}
```

- [ ] **Step 5: Build temiz mi + commit**

```bash
npm run build
git add components/auth/password-reset-request-form.tsx components/auth/password-reset-form.tsx app/sifremi-unuttum app/sifre-yenile
git commit -m "feat(auth): add password reset request and update pages"
```

---

## Task 12: UserMenu component (header dropdown) + admin link + header wiring

**Files:**
- Create: `components/account/user-menu.tsx`
- Create: `components/account/admin-link.tsx`
- Modify: `components/layout/header.tsx`

- [ ] **Step 1: user-menu.tsx**

```tsx
import Link from 'next/link';
import { User, LogIn, UserPlus, LogOut, FileText, Heart, Bell, Settings } from 'lucide-react';
import { signOutAction } from '@/lib/auth/actions';
import { getCurrentProfile } from '@/lib/auth/server';
import { AdminLink } from './admin-link';

export async function UserMenu() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link href="/giris" className="inline-flex items-center gap-1.5 text-sm hover:text-[var(--color-brand)]">
          <LogIn className="h-4 w-4" /> Giriş
        </Link>
        <Link href="/kayit" className="inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-brand)] px-3 py-1.5 text-sm text-[var(--color-bg-base)] hover:bg-[var(--color-brand-dark)]">
          <UserPlus className="h-4 w-4" /> Kayıt
        </Link>
      </div>
    );
  }

  return (
    <details className="relative">
      <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm hover:border-[var(--color-brand)]/40">
        <User className="h-4 w-4" />
        <span className="hidden max-w-[120px] truncate sm:inline">{profile.name ?? profile.email}</span>
      </summary>
      <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2 shadow-[var(--shadow-glass)]">
        <MenuLink href="/hesap" icon={User}>Hesabım</MenuLink>
        <MenuLink href="/hesap/teklifler" icon={FileText}>Tekliflerim</MenuLink>
        <MenuLink href="/hesap/favoriler" icon={Heart}>Favorilerim</MenuLink>
        <MenuLink href="/hesap/bildirimler" icon={Bell}>Bildirimler</MenuLink>
        <MenuLink href="/ayarlar" icon={Settings}>Ayarlar</MenuLink>
        <AdminLink role={profile.role} />
        <form action={signOutAction}>
          <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-bg-overlay)]">
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </button>
        </form>
      </div>
    </details>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[var(--color-bg-overlay)]">
      <Icon className="h-4 w-4" /> {children}
    </Link>
  );
}
```

- [ ] **Step 2: admin-link.tsx**

```tsx
import Link from 'next/link';
import { Shield } from 'lucide-react';

interface Props {
  role: 'customer' | 'moderator' | 'assistant' | 'admin';
}

export function AdminLink({ role }: Props) {
  if (role !== 'admin') return null;
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-brand)] hover:bg-[var(--color-bg-overlay)]"
    >
      <Shield className="h-4 w-4" /> Admin
    </Link>
  );
}
```

- [ ] **Step 3: Header'a UserMenu ekle**

`components/layout/header.tsx` dosyasını oku. Mevcut header'da nav linkleri ve cart badge bulunuyor; UserMenu'yu cart badge'in yanına ekle. Header bir Server Component olabilmeli (UserMenu async).

Header'da cart-badge'in olduğu sağ kümeye `<UserMenu />` import edip ekle. Eğer header şu anda 'use client' ise, UserMenu'yu mount etmek için header'ı RSC'ye çevirmek gerekebilir — bu durumda mevcut interactive parçaları (mobile menu toggle vb.) ayrı client component'a taşı.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add components/account/user-menu.tsx components/account/admin-link.tsx components/layout/header.tsx
git commit -m "feat(auth): add UserMenu dropdown and admin gizli link in header"
```

---

## Task 13: /hesap layout + sidebar

**Files:**
- Create: `components/account/account-sidebar.tsx`
- Create: `app/hesap/layout.tsx`

- [ ] **Step 1: account-sidebar.tsx**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, FileText, Heart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/hesap', label: 'Genel', icon: User },
  { href: '/hesap/profil', label: 'Profil', icon: User },
  { href: '/hesap/teklifler', label: 'Tekliflerim', icon: FileText },
  { href: '/hesap/favoriler', label: 'Favorilerim', icon: Heart },
  { href: '/hesap/bildirimler', label: 'Bildirimler', icon: Bell },
];

export function AccountSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Hesap menüsü" className="space-y-1">
      {ITEMS.map((it) => {
        const active = pathname === it.href;
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

- [ ] **Step 2: app/hesap/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { AccountSidebar } from '@/components/account/account-sidebar';

export const metadata: Metadata = {
  title: 'Hesabım | Zolarr',
};

export default function HesapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <AccountSidebar />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/account/account-sidebar.tsx app/hesap/layout.tsx
git commit -m "feat(account): add /hesap layout with sidebar"
```

---

## Task 14: /hesap dashboard + /hesap/profil + ProfileEditForm

**Files:**
- Create: `app/hesap/page.tsx`
- Create: `app/hesap/profil/page.tsx`
- Create: `components/account/profile-edit-form.tsx`

- [ ] **Step 1: profile-edit-form.tsx**

```tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileEditSchema } from '@/lib/validation/auth-schema';
import { updateProfileAction } from '@/lib/auth/actions';

interface Props {
  initial: { name: string; phone: string };
}

export function ProfileEditForm({ initial }: Props) {
  const [form, setForm] = React.useState(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = profileEditSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await updateProfileAction(r.data);
    setPending(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setErrors({ _form: res.error });
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="p-name" className="text-sm font-medium">Ad Soyad</label>
        <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="p-phone" className="text-sm font-medium">Telefon</label>
        <Input id="p-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90..." />
        {errors.phone && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.phone}</p>}
      </div>
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</Button>
        {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
      </div>
    </form>
  );
}
```

- [ ] **Step 2: app/hesap/page.tsx**

```tsx
import { getCurrentProfile } from '@/lib/auth/server';
import Link from 'next/link';
import { FileText, Heart, Bell, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TILES = [
  { href: '/hesap/profil', label: 'Profil', desc: 'Ad, telefon ve şifre', icon: User },
  { href: '/hesap/teklifler', label: 'Tekliflerim', desc: 'Geçmiş teklif talepleri', icon: FileText },
  { href: '/hesap/favoriler', label: 'Favorilerim', desc: 'Beğendiğiniz ürünler', icon: Heart },
  { href: '/hesap/bildirimler', label: 'Bildirimler', desc: 'Stok geldiğinde haber ver', icon: Bell },
];

export default async function HesapPage() {
  const profile = await getCurrentProfile();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Merhaba {profile?.name ?? profile?.email}</h1>
        <p className="text-[var(--color-text-muted)]">Hesap genel bakışı.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="glass rounded-2xl p-5 transition-all hover:border-[var(--color-brand)]/40">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
              <t.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-3 font-display text-lg font-semibold">{t.label}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: app/hesap/profil/page.tsx**

```tsx
import { getCurrentProfile } from '@/lib/auth/server';
import { ProfileEditForm } from '@/components/account/profile-edit-form';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const profile = await getCurrentProfile();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Profil</h1>
        <p className="text-sm text-[var(--color-text-muted)]">E-posta: {profile?.email}</p>
      </header>
      <ProfileEditForm initial={{ name: profile?.name ?? '', phone: profile?.phone ?? '' }} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/account/profile-edit-form.tsx app/hesap/page.tsx app/hesap/profil/page.tsx
git commit -m "feat(account): add /hesap dashboard and /hesap/profil edit"
```

---

## Task 15: User quotes — wire submitQuote + listUserQuotes + /hesap/teklifler

**Files:**
- Modify: `lib/server-actions/submit-quote.ts`
- Create: `lib/db/queries/user-quotes.ts`
- Create: `components/account/quote-list-item.tsx`
- Create: `app/hesap/teklifler/page.tsx`

- [ ] **Step 1: submit-quote.ts user_id capture**

`lib/server-actions/submit-quote.ts`'i oku. Tablo insert kısmında user_id ekle:

```ts
// (existing imports)
import { getCurrentUser } from '@/lib/auth/server';

// Inside submitQuote, before the for loop:
const user = await getCurrentUser();

// Inside the insert object, add:
user_id: user?.id ?? null,
```

- [ ] **Step 2: user-quotes.ts**

```ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/server';
import type { UserQuote } from '@/lib/db/types';

export async function listUserQuotes(): Promise<UserQuote[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quotes')
    .select('id,quote_number,city,installation_location,status,estimated_kwp,estimated_savings_try,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    quoteNumber: r.quote_number,
    city: r.city,
    installationLocation: r.installation_location,
    status: r.status,
    estimatedKwp: r.estimated_kwp !== null ? Number(r.estimated_kwp) : null,
    estimatedSavingsTry: r.estimated_savings_try !== null ? Number(r.estimated_savings_try) : null,
    createdAt: r.created_at,
  }));
}
```

- [ ] **Step 3: quote-list-item.tsx**

```tsx
import { formatTry } from '@/lib/utils/price';
import type { UserQuote } from '@/lib/db/types';

const STATUS_LABEL: Record<UserQuote['status'], string> = {
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  quoted: 'Teklif verildi',
  won: 'Kazandı',
  lost: 'Kapandı',
};

const LOCATION_LABEL: Record<string, string> = {
  roof: 'Çatı',
  roof_flat: 'Düz çatı',
  land: 'Arazi',
  carport: 'Carport',
  facade: 'Cephe',
};

export function QuoteListItem({ quote }: { quote: UserQuote }) {
  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-sm text-[var(--color-brand)]">{quote.quoteNumber}</p>
        <p className="font-medium">{quote.city} · {LOCATION_LABEL[quote.installationLocation] ?? quote.installationLocation}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{new Date(quote.createdAt).toLocaleDateString('tr-TR')}</p>
      </div>
      <div className="text-right text-sm">
        <p className="rounded-full bg-[var(--color-brand)]/15 px-3 py-1 text-xs font-medium text-[var(--color-brand)] inline-block">{STATUS_LABEL[quote.status]}</p>
        {quote.estimatedKwp !== null && (
          <p className="mt-1 font-mono">{quote.estimatedKwp.toFixed(2)} kWp</p>
        )}
        {quote.estimatedSavingsTry !== null && (
          <p className="text-xs text-[var(--color-text-muted)]">~ {formatTry(quote.estimatedSavingsTry)}/yıl</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: app/hesap/teklifler/page.tsx**

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { listUserQuotes } from '@/lib/db/queries/user-quotes';
import { QuoteListItem } from '@/components/account/quote-list-item';

export const dynamic = 'force-dynamic';

export default async function TekliflerPage() {
  const quotes = await listUserQuotes();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Tekliflerim</h1>
        <Button asChild><Link href="/teklif/al">Yeni Teklif</Link></Button>
      </header>
      {quotes.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Henüz teklif talebiniz yok.</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => <QuoteListItem key={q.id} quote={q} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add lib/server-actions/submit-quote.ts lib/db/queries/user-quotes.ts components/account/quote-list-item.tsx app/hesap/teklifler/page.tsx
git commit -m "feat(account): wire user_id into submitQuote and add /hesap/teklifler"
```

---

## Task 16: Favorites — queries, button (TDD), product detail wiring, page

**Files:**
- Create: `lib/db/queries/favorites.ts`
- Create: `lib/server-actions/favorites.ts`
- Create: `components/account/favorite-button.tsx`
- Create: `tests/components/account/favorite-button.test.tsx`
- Modify: `app/magaza/[slug]/page.tsx` — favorite button
- Create: `app/hesap/favoriler/page.tsx`

- [ ] **Step 1: favorites.ts query**

```ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { mapProductRow, type ProductRow } from './products-helpers';
import type { Product } from '../types';

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}

export async function listUserFavorites(userId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('product:products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data
    .map((r) => (r as { product: ProductRow | null }).product)
    .filter((p): p is ProductRow => !!p)
    .map(mapProductRow);
}
```

- [ ] **Step 2: server-actions/favorites.ts**

```ts
'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/server';

export async function toggleFavoriteAction(productId: string): Promise<{ ok: true; favorited: boolean }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
    revalidatePath('/hesap/favoriler');
    return { ok: true, favorited: false };
  } else {
    await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
    revalidatePath('/hesap/favoriler');
    return { ok: true, favorited: true };
  }
}
```

- [ ] **Step 3: favorite-button.tsx (TDD)**

Failing test:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const toggleMock = vi.fn();
vi.mock('@/lib/server-actions/favorites', () => ({
  toggleFavoriteAction: (...args: unknown[]) => toggleMock(...args),
}));

import { FavoriteButton } from '@/components/account/favorite-button';

describe('FavoriteButton', () => {
  it('shows guest message when no user', async () => {
    const user = userEvent.setup();
    render(<FavoriteButton productId="p1" initialFavorited={false} loggedIn={false} />);
    await user.click(screen.getByRole('button', { name: /Favoriye/i }));
    expect(await screen.findByText(/Giriş yapın/i)).toBeInTheDocument();
  });

  it('toggles state on click when logged in', async () => {
    toggleMock.mockResolvedValueOnce({ ok: true, favorited: true });
    const user = userEvent.setup();
    render(<FavoriteButton productId="p1" initialFavorited={false} loggedIn={true} />);
    await user.click(screen.getByRole('button', { name: /Favoriye Ekle/i }));
    expect(await screen.findByRole('button', { name: /Favoriden Çıkar/i })).toBeInTheDocument();
  });
});
```

Test fail, sonra implementation:

```tsx
'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toggleFavoriteAction } from '@/lib/server-actions/favorites';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  initialFavorited: boolean;
  loggedIn: boolean;
}

export function FavoriteButton({ productId, initialFavorited, loggedIn }: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [pending, setPending] = React.useState(false);
  const [hint, setHint] = React.useState<string | null>(null);

  async function onClick() {
    if (!loggedIn) {
      setHint('Giriş yapın');
      setTimeout(() => router.push(`/giris?next=/magaza`), 800);
      return;
    }
    setPending(true);
    const res = await toggleFavoriteAction(productId);
    setPending(false);
    if (res.ok) setFavorited(res.favorited);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label={favorited ? 'Favoriden Çıkar' : 'Favoriye Ekle'}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
          favorited
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
        )}
      >
        <Heart className={cn('h-5 w-5', favorited && 'fill-current')} />
      </button>
      {hint && <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Wire into product detail**

`app/magaza/[slug]/page.tsx` dosyasını oku. Server component'te `getCurrentUser()` ve `isFavorited(userId, product.id)` çağır; AddToCartButton yanına `<FavoriteButton productId={product.id} initialFavorited={fav} loggedIn={!!user} />` ekle.

- [ ] **Step 5: app/hesap/favoriler/page.tsx**

```tsx
import { listUserFavorites } from '@/lib/db/queries/favorites';
import { requireUser } from '@/lib/auth/server';
import { ShopProductCard } from '@/components/shop/shop-product-card';

export const dynamic = 'force-dynamic';

export default async function FavorilerPage() {
  const user = await requireUser();
  const products = await listUserFavorites(user.id);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Favorilerim</h1>
      {products.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Henüz favori ürününüz yok.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ShopProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Test + commit**

```bash
npx vitest run tests/components/account/favorite-button.test.tsx
npm run build
git add lib/db/queries/favorites.ts lib/server-actions/favorites.ts components/account/favorite-button.tsx tests/components/account/favorite-button.test.tsx app/hesap/favoriler/page.tsx app/magaza/\[slug\]/page.tsx
git commit -m "feat(account): add favorites toggle, listing, and product-detail wiring"
```

---

## Task 17: Stock alerts — queries, button, page

**Files:**
- Create: `lib/db/queries/stock-alerts.ts`
- Create: `lib/server-actions/stock-alerts.ts`
- Create: `components/account/stock-alert-button.tsx`
- Create: `components/account/stock-alert-list-item.tsx`
- Create: `app/hesap/bildirimler/page.tsx`
- Modify: `app/magaza/[slug]/page.tsx` — stock alert button on out-of-stock products

- [ ] **Step 1: stock-alerts.ts query**

```ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface StockAlertWithProduct {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  notified: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

export async function listUserStockAlerts(userId: string): Promise<StockAlertWithProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stock_alerts')
    .select('id,product_id,notified,notified_at,created_at,product:products(slug,name,images)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data
    .filter((r) => r.product)
    .map((r) => {
      const p = r.product as { slug: string; name: string; images: string[] };
      return {
        id: r.id,
        productId: r.product_id,
        productSlug: p.slug,
        productName: p.name,
        productImage: p.images[0] ?? null,
        notified: r.notified,
        notifiedAt: r.notified_at,
        createdAt: r.created_at,
      };
    });
}

export async function hasStockAlert(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stock_alerts')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}
```

- [ ] **Step 2: server-actions/stock-alerts.ts**

```ts
'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser, getCurrentProfile } from '@/lib/auth/server';

export async function subscribeStockAlertAction(productId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Profil bulunamadı.' };
  const supabase = await createClient();
  const { error } = await supabase.from('stock_alerts').upsert({
    user_id: profile.id,
    product_id: productId,
    email: profile.email,
    notified: false,
  });
  if (error) return { ok: false, error: 'Kaydedilemedi.' };
  revalidatePath('/hesap/bildirimler');
  return { ok: true };
}

export async function unsubscribeStockAlertAction(productId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from('stock_alerts').delete().eq('user_id', user.id).eq('product_id', productId);
  if (error) return { ok: false, error: 'Silinemedi.' };
  revalidatePath('/hesap/bildirimler');
  return { ok: true };
}
```

- [ ] **Step 3: stock-alert-button.tsx**

```tsx
'use client';

import * as React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { subscribeStockAlertAction, unsubscribeStockAlertAction } from '@/lib/server-actions/stock-alerts';
import { Button } from '@/components/ui/button';

interface Props {
  productId: string;
  initialSubscribed: boolean;
  loggedIn: boolean;
}

export function StockAlertButton({ productId, initialSubscribed, loggedIn }: Props) {
  const router = useRouter();
  const [subscribed, setSubscribed] = React.useState(initialSubscribed);
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    if (!loggedIn) {
      router.push(`/giris?next=/magaza`);
      return;
    }
    setPending(true);
    const res = subscribed
      ? await unsubscribeStockAlertAction(productId)
      : await subscribeStockAlertAction(productId);
    setPending(false);
    if (res.ok) setSubscribed(!subscribed);
  }

  return (
    <Button type="button" variant="secondary" onClick={onClick} disabled={pending}>
      {subscribed ? (
        <><BellOff className="h-4 w-4" /> Bildirimi Kaldır</>
      ) : (
        <><Bell className="h-4 w-4" /> Stoğa Gelince Haber Ver</>
      )}
    </Button>
  );
}
```

- [ ] **Step 4: stock-alert-list-item.tsx**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { unsubscribeStockAlertAction } from '@/lib/server-actions/stock-alerts';
import type { StockAlertWithProduct } from '@/lib/db/queries/stock-alerts';

export function StockAlertListItem({ alert }: { alert: StockAlertWithProduct }) {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-4">
      {alert.productImage && (
        <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl">
          <Image src={alert.productImage} alt={alert.productName} fill sizes="64px" className="object-cover" />
        </div>
      )}
      <div className="flex-1">
        <Link href={`/magaza/${alert.productSlug}`} className="font-medium hover:text-[var(--color-brand)]">
          {alert.productName}
        </Link>
        <p className="text-xs text-[var(--color-text-muted)]">
          {alert.notified ? `Bildirildi: ${new Date(alert.notifiedAt!).toLocaleDateString('tr-TR')}` : 'Stok bekleniyor'}
        </p>
      </div>
      <form action={async () => { 'use server'; await unsubscribeStockAlertAction(alert.productId); }}>
        <button type="submit" className="text-xs text-[var(--color-danger)] hover:underline">Kaldır</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Wire into product detail (out-of-stock only)**

`app/magaza/[slug]/page.tsx` — stock=0 olduğunda AddToCart yerine StockAlertButton göster (mevcut iniyalde fav button da eklenmiş olacak Task 16'dan).

- [ ] **Step 6: app/hesap/bildirimler/page.tsx**

```tsx
import { listUserStockAlerts } from '@/lib/db/queries/stock-alerts';
import { requireUser } from '@/lib/auth/server';
import { StockAlertListItem } from '@/components/account/stock-alert-list-item';

export const dynamic = 'force-dynamic';

export default async function BildirimlerPage() {
  const user = await requireUser();
  const alerts = await listUserStockAlerts(user.id);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Bildirimler</h1>
      {alerts.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Stok bildirimi aboneliğiniz yok.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => <StockAlertListItem key={a.id} alert={a} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Build + commit**

```bash
npm run build
git add lib/db/queries/stock-alerts.ts lib/server-actions/stock-alerts.ts components/account/stock-alert-button.tsx components/account/stock-alert-list-item.tsx app/hesap/bildirimler/page.tsx app/magaza/\[slug\]/page.tsx
git commit -m "feat(account): add stock alerts + product-detail integration"
```

---

## Task 18: Update /ayarlar deferred sections + AI rate limit boost

**Files:**
- Modify: `components/ayarlar/auth-deferred-section.tsx` (turns into dual mode based on user)
- Modify: `app/ayarlar/page.tsx`
- Modify: `lib/ai/rate-limit.ts` (add user-aware limit)
- Modify: `app/api/ai/chat/route.ts` (use new limit)

- [ ] **Step 1: rate-limit.ts — add AUTH_DAILY_LIMIT and checkAndIncrementForUser**

```ts
// add at top of file:
export const AUTH_DAILY_LIMIT = 50;

// add new function:
export async function checkAndIncrementForUser(userId: string): Promise<RateLimitResult> {
  const day = todayUtc();
  const supabase = adminClient();

  const { data: existing } = await supabase
    .from('ai_chat_usage')
    .select('message_count')
    .eq('ip_hash', `user:${userId}`)
    .eq('day', day)
    .maybeSingle();

  const current = existing?.message_count ?? 0;
  if (current >= AUTH_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: AUTH_DAILY_LIMIT };
  }

  const next = current + 1;
  await supabase.from('ai_chat_usage').upsert({
    ip_hash: `user:${userId}`,
    day,
    message_count: next,
    updated_at: new Date().toISOString(),
  });

  return { allowed: true, remaining: AUTH_DAILY_LIMIT - next, limit: AUTH_DAILY_LIMIT };
}
```

- [ ] **Step 2: chat route — branch on user**

`app/api/ai/chat/route.ts` — IP hash check yerine, önce `getCurrentUser()`. User varsa `checkAndIncrementForUser(user.id)`, yoksa eski IP yolu.

```ts
import { getCurrentUser } from '@/lib/auth/server';
// ...
const user = await getCurrentUser();
let limit;
try {
  limit = user
    ? await checkAndIncrementForUser(user.id)
    : await checkAndIncrement(extractIp(req));
} catch (err) { ... }
```

Geri kalan akış aynı.

- [ ] **Step 3: /ayarlar — show real account / notifications sections to logged-in users**

`app/ayarlar/page.tsx` dosyasını oku. Üstte `getCurrentUser()` çağır.

- Eğer kullanıcı varsa: Hesap Bilgileri ve Bildirimler placeholder'larını gerçek linklere çevir:
  - "Hesap Bilgileri" yerine "/hesap/profil sayfasında düzenleyin." link'i
  - "Bildirimler" yerine "/hesap/bildirimler sayfasında stok aboneliklerinizi yönetin." link'i
- Eğer yoksa: mevcut "Faz 7'de aktif olacak" yerine "Bu özelliği kullanmak için /giris ile giriş yapın." göster.

`auth-deferred-section.tsx`'in adını ve davranışını koru (geriye dönük); yeni bir varyant gerekiyorsa `account-link-section.tsx` olarak ekle.

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add lib/ai/rate-limit.ts app/api/ai/chat/route.ts app/ayarlar/page.tsx components/ayarlar/auth-deferred-section.tsx
git commit -m "feat(auth): boost AI rate limit to 50/day for users; activate ayarlar sections"
```

---

## Task 19: Final verification + completion report

**Files:**
- Create: `docs/superpowers/plans/2026-05-06-faz-7-completion.md`

- [ ] **Step 1: Doğrulama**

```bash
npx vitest run
npx tsc --noEmit
npm run build
```

Beklenen: tüm testler PASS, tsc 0 hata, build temiz. Yeni rotalar: /giris, /kayit, /sifremi-unuttum, /sifre-yenile, /auth/callback, /hesap, /hesap/profil, /hesap/teklifler, /hesap/favoriler, /hesap/bildirimler.

- [ ] **Step 2: Completion report**

```md
# Faz 7 — Auth & Hesap: Completion Report

**Tarih:** 2026-05-06
**Branch:** master
**Plan:** docs/superpowers/plans/2026-05-06-faz-7-auth-hesap.md

## Özet

Supabase Auth ile e-posta+şifre kimlik doğrulaması. /giris, /kayit, şifre sıfırlama akışları,
korumalı /hesap dashboard'u (profil, teklifler, favoriler, bildirimler). Header'a kullanıcı
menüsü ve admin gizli butonu eklendi. AI 50/gün rate limit aktifleşti (kayıtlı kullanıcı).

## Sayılar

- Görev: 19
- Test: <NNN> / <NNN> ✅
- TypeScript: temiz
- Build: temiz
- Yeni rota: 10

## Bilinen sınırlamalar

- /admin sayfaları → Faz 8'de
- Sipariş takibi (/hesap/siparisler, /siparis-takibi/[id]) → Faz 8 (orders/checkout) ile birlikte
- Google OAuth → ileride
- Verilerimi indir / Hesabımı sil → Faz 10 (KVKK polish)
- Push bildirim teslimi → Faz 9 (web-push)

## Kullanıcı eylemi gerekli

1. `supabase/migrations/combined_for_paste_v5.sql`'i Studio SQL Editor'a yapıştırıp Run.
2. Supabase Studio → Authentication → Providers → Email aktif mi kontrol et.
3. (Opsiyonel) Authentication → Email Templates → "Confirm signup" + "Reset password" Türkçeleştir.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/2026-05-06-faz-7-completion.md
git commit -m "docs: Phase 7 completion report"
```

---

## Self-Review

**Spec coverage (§5.1 Auth + §11 Ayarlar + §12.1 admin gizli):**

- /giris ✅ Task 9
- /kayit ✅ Task 10
- /sifremi-unuttum ✅ Task 11
- /sifre-yenile ✅ Task 11
- /hesap ✅ Task 14
- /hesap/profil ✅ Task 14 (specte yok ama profil edit gerekli; hesap dashboard'u alt-sayfası)
- /hesap/siparisler ⏳ Faz 8 (orders henüz yok)
- /hesap/teklifler ✅ Task 15
- /hesap/favoriler ✅ Task 16
- /hesap/bildirimler ✅ Task 17
- /siparis-takibi/[id] ⏳ Faz 8
- Admin gizli mantık ✅ Task 12 (UserMenu içinde role gate, /admin sayfaları henüz yok)
- Ayarlar Hesap Bilgileri ✅ Task 18 (artık /hesap/profil'e link)
- Ayarlar Bildirimler ✅ Task 18 (artık /hesap/bildirimler'e link)
- Verilerimi indir / Hesabımı sil ⏳ Faz 10
- AI 50 mesaj/gün (kayıtlı) ✅ Task 18

**Placeholder scan:** "TODO" yok. "Faz 8'de aktif olacak", "Faz 10'da KVKK", "/admin sayfaları Faz 8'de" — bilinçli sınır işaretleri.

**Type consistency:**
- `Profile.role` Task 2'de tanımlandı, Task 12'de AdminLink ve UserMenu, Task 4'te isAdmin aynı tipi kullanıyor
- `UserQuote` Task 2'de, Task 15'te `listUserQuotes` aynı tipi döndürüyor
- `StockAlertWithProduct` Task 17'de tanımlandı, hem listing query hem list-item component aynı şekli alıyor
- `signOutAction` redirect tipi: `redirect()` çağrısı `never` döner — tip olarak ActionResult döndürmüyor, form action olarak kullanılıyor

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-06-faz-7-auth-hesap.md`. Subagent-Driven ile yürütülecek.**
