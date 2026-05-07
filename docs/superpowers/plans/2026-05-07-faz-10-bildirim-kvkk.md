# Faz 10 — Bildirim Genişletme + KVKK Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** Mevcut e-posta/bildirim akışını tamamla (stok uyarısı, bayi onay/red, quote won/lost durum) ve KVKK gereği "Verilerimi indir" + "Hesabımı sil" + e-posta tercihleri akışlarını ekle.

**Architecture:**
- E-posta tercihleri: `profiles.email_preferences` JSONB kolonu — kullanıcı bazlı opt-out
- Stok uyarısı: ürün stok 0 → pozitif olduğunda DB trigger değil, server action içinde (admin ürün düzenlerken) tetiklenir
- KVKK export: kullanıcının tüm DB kayıtlarını JSON olarak indirme
- KVKK delete: `auth.users` cascade silme (RLS + trigger zaten cleanup yapıyor)
- Unsubscribe: HMAC-imzalı token ile tek-tıkla opt-out endpoint

**Tech Stack:**
- Mevcut: Supabase, Resend, Server Actions, Vitest
- Yeni: `crypto` (Node native) HMAC için, yeni migration (`0011_email_prefs.sql`)

---

## Task 1: Migration — email_preferences kolonu

**Files:**
- Create: `supabase/migrations/0011_email_preferences.sql`
- Create: `supabase/migrations/combined_for_paste_v9.sql` (paste-ready)
- Modify: `lib/db/types.ts` (Profile type'a alan ekle)

- [ ] **Step 1: Migration yaz**

```sql
-- 0011_email_preferences.sql
alter table public.profiles
  add column if not exists email_preferences jsonb not null default '{
    "marketing": true,
    "stock_alerts": true,
    "quote_status": true,
    "dealer_status": true
  }'::jsonb;

-- Unsubscribe için secret (kullanıcı bazlı, HMAC için)
alter table public.profiles
  add column if not exists unsubscribe_secret text not null default encode(gen_random_bytes(16), 'hex');
```

- [ ] **Step 2: combined_for_paste_v9 oluştur**

`combined_for_paste_v8.sql` içeriği + `0011` migration'ı birleşik.

- [ ] **Step 3: Profile type'a kolonları ekle**

`lib/db/types.ts` içindeki `Profile` interface'ine:

```ts
export interface EmailPreferences {
  marketing: boolean;
  stock_alerts: boolean;
  quote_status: boolean;
  dealer_status: boolean;
}

export interface Profile {
  // ... existing
  emailPreferences: EmailPreferences;
  unsubscribeSecret: string;
}
```

`getCurrentProfile()` query'sini güncelle: `.select('id,email,name,phone,role,avatar_url,created_at,updated_at,email_preferences,unsubscribe_secret')` ve mapping'e ekle.

- [ ] **Step 4: Build + commit**

```powershell
npm run build
git add supabase/migrations/0011_email_preferences.sql supabase/migrations/combined_for_paste_v9.sql lib/db/types.ts lib/auth/server.ts
git commit -m "feat(db): add email_preferences + unsubscribe_secret to profiles"
```

⚠️ **User must apply v9 in Supabase Studio.**

---

## Task 2: Email helper — preference check + unsubscribe URL

**Files:**
- Create: `lib/email/preferences.ts`
- Create: `lib/email/unsubscribe.ts`
- Test: `tests/lib/email/preferences.test.ts`
- Test: `tests/lib/email/unsubscribe.test.ts`

- [ ] **Step 1: Failing tests**

```ts
// tests/lib/email/preferences.test.ts
import { describe, it, expect } from 'vitest';
import { canReceive } from '@/lib/email/preferences';

describe('canReceive', () => {
  it('returns true for default prefs', () => {
    expect(canReceive({ marketing: true, stock_alerts: true, quote_status: true, dealer_status: true }, 'marketing')).toBe(true);
  });
  it('returns false when category disabled', () => {
    expect(canReceive({ marketing: false, stock_alerts: true, quote_status: true, dealer_status: true }, 'marketing')).toBe(false);
  });
  it('returns true for null prefs (default opt-in)', () => {
    expect(canReceive(null, 'stock_alerts')).toBe(true);
  });
});
```

```ts
// tests/lib/email/unsubscribe.test.ts
import { describe, it, expect } from 'vitest';
import { signUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/email/unsubscribe';

describe('unsubscribe tokens', () => {
  const userId = '11111111-1111-1111-1111-111111111111';
  const secret = 'abc123';
  const category = 'marketing';

  it('signs and verifies a valid token', () => {
    const token = signUnsubscribeToken(userId, category, secret);
    const result = verifyUnsubscribeToken(token, secret);
    expect(result).toEqual({ ok: true, userId, category });
  });
  it('rejects token with wrong secret', () => {
    const token = signUnsubscribeToken(userId, category, secret);
    expect(verifyUnsubscribeToken(token, 'wrong').ok).toBe(false);
  });
  it('rejects malformed token', () => {
    expect(verifyUnsubscribeToken('not-a-token', secret).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Test fail**

- [ ] **Step 3: Implementation**

```ts
// lib/email/preferences.ts
import type { EmailPreferences } from '@/lib/db/types';

export type EmailCategory = 'marketing' | 'stock_alerts' | 'quote_status' | 'dealer_status';

export function canReceive(prefs: EmailPreferences | null | undefined, category: EmailCategory): boolean {
  if (!prefs) return true;
  return prefs[category] !== false;
}
```

```ts
// lib/email/unsubscribe.ts
import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import type { EmailCategory } from './preferences';

export function signUnsubscribeToken(userId: string, category: EmailCategory, secret: string): string {
  const payload = `${userId}:${category}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export type VerifyResult =
  | { ok: true; userId: string; category: EmailCategory }
  | { ok: false };

export function verifyUnsubscribeToken(token: string, secret: string): VerifyResult {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');
    if (parts.length !== 3) return { ok: false };
    const [userId, category, sig] = parts as [string, string, string];
    const expected = createHmac('sha256', secret).update(`${userId}:${category}`).digest('hex').slice(0, 32);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return { ok: false };
    if (!timingSafeEqual(a, b)) return { ok: false };
    return { ok: true, userId, category: category as EmailCategory };
  } catch {
    return { ok: false };
  }
}
```

- [ ] **Step 4: Tests pass**

- [ ] **Step 5: Commit**

```powershell
git add lib/email/preferences.ts lib/email/unsubscribe.ts tests/lib/email/preferences.test.ts tests/lib/email/unsubscribe.test.ts
git commit -m "feat(email): add preference check + HMAC unsubscribe token helpers"
```

---

## Task 3: Quote durum e-posta şablonu + update-quote hook

**Files:**
- Create: `lib/email/templates/quote-status.ts`
- Create: `tests/lib/email/templates/quote-status.test.ts`
- Modify: `lib/server-actions/admin/update-quote.ts`
- Modify: `lib/db/queries/admin/quotes.ts` (e-postaya gerekli alanları döndür)

- [ ] **Step 1: Test yaz**

```ts
// tests/lib/email/templates/quote-status.test.ts
import { describe, it, expect } from 'vitest';
import { quoteStatusEmail } from '@/lib/email/templates/quote-status';

describe('quoteStatusEmail', () => {
  const base = { quoteNumber: 'ZQT-X', contactName: 'Ali Y', oldStatus: 'new' as const, newStatus: 'contacted' as const, adminNotes: null };
  it('subject reflects status change', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'won' });
    expect(e.subject.toLowerCase()).toMatch(/teklif/);
  });
  it('won status uses positive language', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'won' });
    expect(e.html.toLowerCase()).toMatch(/teşekkür|kazandık|hoş/);
  });
  it('lost status is empathetic', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'lost' });
    expect(e.html.toLowerCase()).toMatch(/değerlendir|tekrar/);
  });
  it('contacted/quoted is informative', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'quoted' });
    expect(e.html).toContain('Ali');
  });
});
```

- [ ] **Step 2: Şablonu yaz**

```ts
// lib/email/templates/quote-status.ts
import { renderEmail, escapeHtml } from '../template';

export type QuoteStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

export interface QuoteStatusEmailData {
  quoteNumber: string;
  contactName: string;
  oldStatus: QuoteStatus;
  newStatus: QuoteStatus;
  adminNotes: string | null;
}

export interface RenderedEmail { subject: string; html: string; }

const HEADLINE: Record<QuoteStatus, string> = {
  new: 'Teklif talebiniz alındı',
  contacted: 'Sizinle iletişime geçtik',
  quoted: 'Teklifiniz hazır',
  won: 'Teşekkürler — birlikte yola çıkıyoruz!',
  lost: 'Bu seferlik bir araya gelemedik',
};

const BODY: Record<QuoteStatus, (firstName: string, notes: string | null) => string> = {
  new: (n) => `<p>Merhaba ${n}, talebinizi aldık.</p>`,
  contacted: (n) => `<p>Merhaba ${n}, ekibimiz size dönüş yaptı. Detayları konuşmak için müsait olduğunuzu bekliyoruz.</p>`,
  quoted: (n, notes) => `<p>Merhaba ${n}, teklifimiz hazır.</p>${notes ? `<p style="background:#0a0a0a;border-left:3px solid #5DD62C;padding:12px 16px;border-radius:8px;color:#ddd;">${escapeHtml(notes)}</p>` : ''}`,
  won: (n) => `<p>Merhaba ${n}, bizi tercih ettiğiniz için teşekkürler. Kurulum sürecinde sürekli iletişimde olacağız.</p>`,
  lost: (n, notes) => `<p>Merhaba ${n}, bu sefer beraber çalışamadık ama her zaman değerlendirmek isteriz. İhtiyaç olursa bize tekrar ulaşabilirsiniz.</p>${notes ? `<p style="color:#888;font-size:13px;">Notumuz: ${escapeHtml(notes)}</p>` : ''}`,
};

export function quoteStatusEmail(d: QuoteStatusEmailData): RenderedEmail {
  const firstName = escapeHtml(d.contactName.split(' ')[0] ?? d.contactName);
  const subject = `${HEADLINE[d.newStatus]} · ${d.quoteNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">${HEADLINE[d.newStatus]}</h2>
    ${BODY[d.newStatus](firstName, d.adminNotes)}
    <p style="margin:24px 0 0;color:#888;font-size:13px;"><strong>Teklif No:</strong> ${escapeHtml(d.quoteNumber)}</p>
  `;
  return { subject, html: renderEmail({ title: subject, body }) };
}
```

- [ ] **Step 3: Test pass**

- [ ] **Step 4: update-quote action'a entegre et**

`lib/server-actions/admin/update-quote.ts`'i güncelle. Status değişimi tespit edip kullanıcıya e-posta gönder. ÖNEMLİ: status değişti VE prefs.quote_status izin veriyorsa.

```ts
// Add to imports:
import { sendEmail } from '@/lib/email/send';
import { quoteStatusEmail } from '@/lib/email/templates/quote-status';
import { canReceive } from '@/lib/email/preferences';

// In updateQuoteAction, after successful update:
// Yeni quote satırını oku (e-posta için contact_email + name + status lazım)
const { data: q } = await sb.from('quotes').select('quote_number,contact_name,contact_email,status,admin_notes,user_id').eq('id', input.id).maybeSingle();
if (q && input.status && input.status !== oldStatus) {
  // user_id varsa profile prefs'i çek; yoksa misafir teklif → preference check yok (default opt-in)
  let canSend = true;
  if (q.user_id) {
    const { data: p } = await sb.from('profiles').select('email_preferences').eq('id', q.user_id).maybeSingle();
    canSend = canReceive(p?.email_preferences as never, 'quote_status');
  }
  if (canSend) {
    await Promise.allSettled([
      sendEmail({
        to: q.contact_email,
        ...quoteStatusEmail({
          quoteNumber: q.quote_number,
          contactName: q.contact_name,
          oldStatus: oldStatus as never,
          newStatus: input.status,
          adminNotes: q.admin_notes ?? null,
        }),
      }),
    ]);
  }
}
```

`oldStatus`'ü almak için patch'ten ÖNCE eski status'u sorgula:

```ts
const { data: existing } = await sb.from('quotes').select('status').eq('id', input.id).maybeSingle();
const oldStatus = existing?.status as string | undefined;
// ... existing update logic ...
```

- [ ] **Step 5: Build + tests**

- [ ] **Step 6: Commit**

```powershell
git add lib/email/templates/quote-status.ts tests/lib/email/templates/quote-status.test.ts lib/server-actions/admin/update-quote.ts
git commit -m "feat(email): notify customer on quote status change (won/lost/contacted/quoted)"
```

---

## Task 4: Dealer onay/red e-posta + update-dealer hook

**Files:**
- Create: `lib/email/templates/dealer-status.ts`
- Create: `tests/lib/email/templates/dealer-status.test.ts`
- Modify: `lib/server-actions/admin/update-dealer.ts`

Aynı pattern: status değişimi tespit + e-posta + preference check (`canReceive(..., 'dealer_status')`).

- [ ] **Step 1-3: Test + şablon (Task 3 ile aynı yapı)**

```ts
// lib/email/templates/dealer-status.ts
import { renderEmail, escapeHtml } from '../template';

export type DealerStatus = 'new' | 'reviewing' | 'approved' | 'rejected';

export interface DealerStatusEmailData {
  applicationNumber: string;
  contactName: string;
  companyName: string;
  newStatus: DealerStatus;
  adminNotes: string | null;
}

const SUBJECT: Record<DealerStatus, string> = {
  new: 'Bayi başvurunuz alındı',
  reviewing: 'Bayi başvurunuz incelemede',
  approved: 'Bayilik başvurunuz onaylandı 🎉',
  rejected: 'Bayilik başvurunuz hakkında',
};

export function dealerStatusEmail(d: DealerStatusEmailData) {
  const firstName = escapeHtml(d.contactName.split(' ')[0] ?? d.contactName);
  const subject = `${SUBJECT[d.newStatus]} · ${d.applicationNumber}`;
  let body = `<h2 style="margin:0 0 16px;color:#fff;">${SUBJECT[d.newStatus]}</h2>`;
  if (d.newStatus === 'reviewing') {
    body += `<p>Merhaba ${firstName}, <strong>${escapeHtml(d.companyName)}</strong> başvurunuz inceleme aşamasında. 3 iş günü içinde dönüş yapacağız.</p>`;
  } else if (d.newStatus === 'approved') {
    body += `<p>Merhaba ${firstName}, <strong>${escapeHtml(d.companyName)}</strong> bayilik başvurunuz onaylandı. Yetkili kişimiz sözleşme süreci için sizinle iletişime geçecek.</p>`;
  } else if (d.newStatus === 'rejected') {
    body += `<p>Merhaba ${firstName}, <strong>${escapeHtml(d.companyName)}</strong> başvurunuzu değerlendirdik ancak bu süreçte bayilik açmıyoruz. İlginiz için teşekkür ederiz.</p>`;
    if (d.adminNotes) body += `<p style="color:#888;font-size:13px;">Notumuz: ${escapeHtml(d.adminNotes)}</p>`;
  }
  return { subject, html: renderEmail({ title: subject, body }) };
}
```

- [ ] **Step 4: Hook into update-dealer**

Aynı pattern: oldStatus al, update yap, status değiştiyse + canReceive(..., 'dealer_status') ise e-posta gönder. Misafir başvurular için preference check yok (default opt-in).

- [ ] **Step 5: Commit**

```powershell
git add lib/email/templates/dealer-status.ts tests/lib/email/templates/dealer-status.test.ts lib/server-actions/admin/update-dealer.ts
git commit -m "feat(email): notify applicant on dealer application status change"
```

---

## Task 5: Stock alert e-postası — ürün düzenleme hook'u

**Files:**
- Modify: `lib/server-actions/admin/products.ts` (updateProductAction)
- Create: `lib/email/templates/stock-alert.ts`
- Create: `tests/lib/email/templates/stock-alert.test.ts`

Stok 0 → pozitif geçişinde subscribed users'a e-posta + `stock_alerts.notified=true` set.

- [ ] **Step 1: Şablon test**

```ts
// tests/lib/email/templates/stock-alert.test.ts
import { describe, it, expect } from 'vitest';
import { stockAlertEmail } from '@/lib/email/templates/stock-alert';

describe('stockAlertEmail', () => {
  it('mentions product name and link', () => {
    const e = stockAlertEmail({ productName: 'Solar Panel 540W', productSlug: 'solar-panel-540w', userName: 'Ali' });
    expect(e.html).toContain('Solar Panel 540W');
    expect(e.html).toContain('/magaza/solar-panel-540w');
  });
});
```

- [ ] **Step 2: Şablon yaz**

```ts
// lib/email/templates/stock-alert.ts
import { renderEmail, escapeHtml } from '../template';

export interface StockAlertEmailData {
  productName: string;
  productSlug: string;
  userName: string | null;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zolarr.com';

export function stockAlertEmail(d: StockAlertEmailData) {
  const greeting = d.userName ? `Merhaba ${escapeHtml(d.userName.split(' ')[0] ?? d.userName)}` : 'Merhaba';
  const subject = `${d.productName} stoğa girdi`;
  const body = `
    <h2 style="margin:0 0 16px;color:#fff;">${greeting},</h2>
    <p>Beklediğiniz ürün <strong>${escapeHtml(d.productName)}</strong> tekrar stoğa girdi.</p>
    <div style="margin-top:24px;">
      <a href="${SITE}/magaza/${escapeHtml(d.productSlug)}" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Ürünü gör</a>
    </div>
    <p style="margin-top:24px;color:#888;font-size:13px;">Stok sınırlı olabilir; mümkünse hemen sipariş verin.</p>
  `;
  return { subject, html: renderEmail({ title: subject, body }) };
}
```

- [ ] **Step 3: updateProductAction'a entegre et**

```ts
// In lib/server-actions/admin/products.ts updateProductAction, BEFORE update:
const { data: current } = await sb.from('products').select('stock,name,slug').eq('id', id).maybeSingle();
const oldStock = current?.stock ?? 0;
// ... existing update ...

// AFTER successful update, if stock went 0 → positive:
if (oldStock === 0 && parsed.data.stock > 0) {
  // Notify all unnotified subscribers
  const { data: alerts } = await sb.from('stock_alerts')
    .select('id,user_id,email')
    .eq('product_id', id)
    .eq('notified', false);
  if (alerts && alerts.length > 0) {
    const userIds = alerts.map((a) => a.user_id);
    const { data: profiles } = await sb.from('profiles').select('id,name,email_preferences').in('id', userIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    await Promise.allSettled(alerts.map((alert) => {
      const profile = profileMap.get(alert.user_id);
      const prefs = profile?.email_preferences as never;
      if (!canReceive(prefs, 'stock_alerts')) return Promise.resolve();
      return sendEmail({
        to: alert.email,
        ...stockAlertEmail({
          productName: current!.name,
          productSlug: current!.slug,
          userName: profile?.name ?? null,
        }),
      });
    }));
    // Mark all as notified
    await sb.from('stock_alerts').update({ notified: true, notified_at: new Date().toISOString() })
      .in('id', alerts.map((a) => a.id));
  }
}
```

- [ ] **Step 4: Build + tests + commit**

```powershell
git add lib/email/templates/stock-alert.ts tests/lib/email/templates/stock-alert.test.ts lib/server-actions/admin/products.ts
git commit -m "feat(email): notify subscribed users when product back in stock"
```

---

## Task 6: E-posta tercihler UI — /ayarlar/eposta

**Files:**
- Create: `app/ayarlar/eposta/page.tsx`
- Create: `components/settings/email-preferences-form.tsx`
- Create: `lib/server-actions/update-email-preferences.ts`
- Test: `tests/lib/server-actions/update-email-preferences.test.ts`

Mevcut /ayarlar sayfası varsa link ekle; yoksa standalone.

- [ ] **Step 1: Server action test**

```ts
// (mock approach: ensure schema validation)
```

- [ ] **Step 2: Server action**

```ts
'use server';
import 'server-only';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/server';

const schema = z.object({
  marketing: z.boolean(),
  stock_alerts: z.boolean(),
  quote_status: z.boolean(),
  dealer_status: z.boolean(),
});

export async function updateEmailPreferencesAction(input: unknown) {
  const user = await requireUser();
  const r = schema.safeParse(input);
  if (!r.success) return { ok: false as const, error: 'Geçersiz tercih' };
  const sb = await createClient();
  const { error } = await sb.from('profiles').update({ email_preferences: r.data }).eq('id', user.id);
  if (error) {
    console.error('[email-prefs] update failed', error);
    return { ok: false as const, error: 'Tercihler güncellenemedi.' };
  }
  revalidatePath('/ayarlar/eposta');
  return { ok: true as const };
}
```

- [ ] **Step 3: Form component**

Client component, 4 checkbox + Kaydet butonu. Mevcut ayarlar pattern'ine uy.

- [ ] **Step 4: Page**

```tsx
// app/ayarlar/eposta/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth/server';
import { EmailPreferencesForm } from '@/components/settings/email-preferences-form';

export const dynamic = 'force-dynamic';

export default async function EmailPrefsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/giris?next=/ayarlar/eposta');
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">E-posta Tercihleri</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Hangi tür e-postaları almak istediğinizi seçin.</p>
      <EmailPreferencesForm initial={profile.emailPreferences} />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

---

## Task 7: Tek-tıkla unsubscribe endpoint — /eposta/cik

**Files:**
- Create: `app/eposta/cik/page.tsx` (server component)
- Create: `lib/server-actions/unsubscribe-via-token.ts`

URL: `/eposta/cik?token=BASE64URL`

- [ ] **Step 1: Action**

```ts
'use server';
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe';

export async function unsubscribeViaTokenAction(token: string) {
  const sb = createAdminClient();
  // Token format: userId:category:sig — secret each user's
  // We need to look up user first, but secret is per-user. So we need to know userId from token.
  // Decode token (without verifying) to extract userId, then fetch secret, verify, then update.
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');
    if (parts.length !== 3) return { ok: false as const, error: 'Geçersiz bağlantı' };
    const userId = parts[0];
    const { data: profile } = await sb.from('profiles').select('unsubscribe_secret,email_preferences').eq('id', userId).maybeSingle();
    if (!profile) return { ok: false as const, error: 'Kullanıcı bulunamadı' };
    const verified = verifyUnsubscribeToken(token, profile.unsubscribe_secret);
    if (!verified.ok) return { ok: false as const, error: 'Bağlantı geçersiz veya süresi dolmuş.' };
    const newPrefs = { ...(profile.email_preferences as Record<string, boolean>), [verified.category]: false };
    const { error } = await sb.from('profiles').update({ email_preferences: newPrefs }).eq('id', verified.userId);
    if (error) return { ok: false as const, error: 'İşlem başarısız' };
    return { ok: true as const, category: verified.category };
  } catch {
    return { ok: false as const, error: 'Geçersiz bağlantı' };
  }
}
```

- [ ] **Step 2: Page**

```tsx
// app/eposta/cik/page.tsx
import { unsubscribeViaTokenAction } from '@/lib/server-actions/unsubscribe-via-token';

interface Props { searchParams: Promise<{ token?: string }>; }

export const dynamic = 'force-dynamic';

const LABEL: Record<string, string> = {
  marketing: 'pazarlama',
  stock_alerts: 'stok bildirimleri',
  quote_status: 'teklif durum bildirimleri',
  dealer_status: 'bayi başvuru bildirimleri',
};

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) return <main className="container mx-auto max-w-md p-8 text-center">Bağlantı eksik.</main>;
  const result = await unsubscribeViaTokenAction(token);
  return (
    <main className="container mx-auto max-w-md p-8 text-center">
      <h1 className="font-display text-2xl font-bold">E-posta Aboneliği</h1>
      {result.ok ? (
        <p className="mt-4">{LABEL[result.category] ?? result.category} e-postalarından çıkış yapıldı. <a href="/ayarlar/eposta" className="text-[var(--color-brand)]">Tüm tercihleri yönet</a>.</p>
      ) : (
        <p className="mt-4 text-[var(--color-danger)]">{result.error}</p>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Mevcut e-postalara unsubscribe URL ekle**

`lib/email/template.ts` footer'ında "Tercihler" linkini token-bazlı yap. Her gönderimde token üret. Bu büyük refactor — `sendEmail` artık `userId` ve `category` opsiyonel kabul etsin, yoksa generic `/ayarlar/eposta` linki versin.

```ts
// sendEmail({ to, subject, html, replyTo, unsubscribe?: { userId, secret, category } })
// renderEmail footer'a token-bazlı link ekle
```

- [ ] **Step 4: Commit**

```powershell
git commit -m "feat(email): one-click unsubscribe via HMAC token"
```

---

## Task 8: KVKK — Verilerimi indir

**Files:**
- Create: `app/api/kvkk/verilerimi-indir/route.ts`
- Create: `app/hesap/kvkk/page.tsx` (link buradan)

GET `/api/kvkk/verilerimi-indir` → JSON file (Content-Disposition: attachment).

- [ ] **Step 1: Route handler**

```ts
// app/api/kvkk/verilerimi-indir/route.ts
import { NextResponse } from 'next/server';
import { requireUser, getCurrentProfile } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const sb = await createClient();
  const [addresses, favorites, stockAlerts, quotes] = await Promise.all([
    sb.from('addresses').select('*').eq('user_id', user.id),
    sb.from('favorites').select('*').eq('user_id', user.id),
    sb.from('stock_alerts').select('*').eq('user_id', user.id),
    sb.from('quotes').select('*').eq('user_id', user.id),
  ]);
  const data = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile,
    addresses: addresses.data ?? [],
    favorites: favorites.data ?? [],
    stock_alerts: stockAlerts.data ?? [],
    quotes: quotes.data ?? [],
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="zolarr-verileriniz-${user.id}.json"`,
    },
  });
}
```

- [ ] **Step 2: KVKK sayfası — verileri indir butonu + hesap silme**

```tsx
// app/hesap/kvkk/page.tsx
import Link from 'next/link';

export default function KvkkPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="font-display text-2xl font-bold">Verilerim ve Hesabım (KVKK)</h1>
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Verilerimi indir</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Tüm Zolarr hesap verilerinizi JSON formatında indirin.</p>
        <Link href="/api/kvkk/verilerimi-indir" className="mt-4 inline-block rounded-2xl bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-bg-base)]" prefetch={false}>İndir (JSON)</Link>
      </section>
      <section className="glass rounded-2xl p-6 border border-[var(--color-danger)]/30">
        <h2 className="text-lg font-semibold text-[var(--color-danger)]">Hesabımı sil</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Bu işlem geri alınamaz. Profil + adresler + favoriler + stok uyarıları silinecek. Teklif kayıtları kalır ama kullanıcı bilgisi anonimleşir.</p>
        <Link href="/hesap/kvkk/sil" className="mt-4 inline-block rounded-2xl border border-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-danger)]">Hesap silme sayfasına git</Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

---

## Task 9: KVKK — Hesabımı sil

**Files:**
- Create: `app/hesap/kvkk/sil/page.tsx`
- Create: `lib/server-actions/delete-account.ts`

İki adımlı: e-posta onayı ile kelime yazma + tıklama.

- [ ] **Step 1: Action**

```ts
'use server';
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function deleteAccountAction(formData: FormData) {
  const user = await requireUser();
  const confirm = formData.get('confirm');
  if (confirm !== 'HESABIMI SİL') {
    return { ok: false as const, error: 'Onay metni eşleşmiyor.' };
  }
  const sb = createAdminClient();
  // 1) Anonymize quotes (preserve quote history but strip user_id)
  await sb.from('quotes').update({ user_id: null }).eq('user_id', user.id);
  // 2) Cascade delete (profiles, addresses, favorites, stock_alerts via FK ON DELETE CASCADE)
  await sb.auth.admin.deleteUser(user.id);
  redirect('/?hesap-silindi=1');
}
```

- [ ] **Step 2: Page (form with confirm input)**

```tsx
// app/hesap/kvkk/sil/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/server';
import { deleteAccountAction } from '@/lib/server-actions/delete-account';

export const dynamic = 'force-dynamic';

export default async function HesapSilPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/giris');
  return (
    <div className="container mx-auto max-w-md px-4 py-8 space-y-4">
      <h1 className="font-display text-2xl font-bold text-[var(--color-danger)]">Hesabımı sil</h1>
      <p className="text-sm">Onaylamak için aşağıdaki metni aynen yazın: <code>HESABIMI SİL</code></p>
      <form action={deleteAccountAction} className="space-y-4">
        <input name="confirm" required className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4" />
        <button type="submit" className="w-full rounded-2xl bg-[var(--color-danger)] px-4 py-2 font-medium text-white">Hesabımı kalıcı olarak sil</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

---

## Task 10: KVKK metinler — sayfa içerikleri

**Files:**
- Modify: `app/kvkk/page.tsx` (varsa) ya da Create

Statik KVKK aydınlatma metni. İçerik: hangi veriler toplanır, nasıl saklanır, kullanıcı hakları (Madde 11). Hukuki şablon — kullanıcının avukatı kontrol etmeli.

- [ ] **Step 1: KVKK sayfası**

KVKK Madde 10 (Aydınlatma) + Madde 11 (Kullanıcı hakları) içerik. 200-400 satır metin. Linkler `/hesap/kvkk` sayfasına.

- [ ] **Step 2: Commit**

---

## Task 11: Header'da admin için NotificationBell client refresh

(Opsiyonel — eğer realtime gerekiyorsa. Şimdilik ATLA — bell zaten static load'da çalışıyor.)

---

## Task 12: Final verification + completion report

**Files:**
- Create: `docs/superpowers/plans/2026-05-07-faz-10-completion.md`

- [ ] **Step 1: Tam test çalıştır**

```powershell
npm test -- --run
```

Beklenen: 200+/200+ (178 + ~24 yeni).

- [ ] **Step 2: Build**

```powershell
npm run build
```

- [ ] **Step 3: Manuel test (kullanıcı)**

1. Admin'de bir teklifin status'unu değiştir → kullanıcıya e-posta?
2. Bayi başvurusunu approve/reject yap → bayiye e-posta?
3. Bir ürünün stock'unu 0'dan pozitife çıkar (önce favorisinde + stok uyarısı kayıtlı) → e-posta?
4. /ayarlar/eposta'da bir kategoriyi kapat → o kategoriden e-posta gelmiyor mu?
5. /eposta/cik?token=... linki çalışıyor mu? (Test: bir e-postada gelen unsubscribe linke tıkla)
6. /api/kvkk/verilerimi-indir → JSON download iniyor mu?
7. /hesap/kvkk/sil → onay metni yazınca hesap siliniyor mu?

- [ ] **Step 4: Completion raporu**

Standart format: tamamlanan task tablosu, dosyalar, sayılar, sınırlamalar, sonraki faz.

- [ ] **Step 5: Commit + push**

```powershell
git add docs/superpowers/plans/2026-05-07-faz-10-completion.md
git commit -m "docs: Faz 10 completion report"
git push origin master
```

---

## Self-Review

- [ ] Her task TDD pattern (template testleri var)
- [ ] Status email'leri preference check yapıyor
- [ ] Stock alert hem `notified=true` set ediyor hem e-posta atıyor (idempotency)
- [ ] Unsubscribe HMAC ile imzalı, secret per-user
- [ ] KVKK delete: quotes anonymize + auth.users delete
- [ ] KVKK export: user-only verileri kapsıyor (admin verileri dışarıda)

## Kapsam Dışı (Faz 11+)

- Realtime notification bell (websockets)
- Push notifications (FCM/APNs)
- Tedarikçi sync, fiyat alarmları (Faz 11)
- Admin dashboard analytics (Faz 12)
- AI RAG (Faz 13)
