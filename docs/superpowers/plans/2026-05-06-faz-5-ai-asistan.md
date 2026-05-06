# Faz 5 — AI Asistan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sağ alt köşede floating AI Asistan paneli ekle — Anthropic Claude API ile streaming sohbet, markdown render, Türkçe TTS, IP-based günlük rate limit.

**Architecture:** İstemci tarafı: Zustand store + glassmorphism panel + react-markdown + Web Speech API. Sunucu tarafı: Next.js Route Handler (`/api/ai/chat`) Anthropic SDK ile SSE streaming yapar; kullanıcı kimliği yokken IP hash'i kullanılarak Supabase'de günlük 10 mesaj limiti tutulur. RAG/admin doküman yönetimi Faz 8'e ertelendi (admin paneli ile birlikte gelir); auth tabanlı 50/gün limit Faz 7'ye ertelendi.

**Tech Stack:** Next.js 16 App Router, Anthropic SDK (`@anthropic-ai/sdk`), Claude Sonnet 4.6 + prompt cache, Zustand, react-markdown + remark-gfm, Web Speech API, Supabase Postgres (RLS).

---

## Pre-flight: Ortam değişkeni gerekli

Plan tamamlanmadan **önce** kullanıcı `.env.local` dosyasına şunu eklemeli:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Anahtar yoksa `/api/ai/chat` endpoint'i 500 dönecek. Plan içinde test mock'lanır, gerçek runtime için anahtar şart.

---

## Files to Create / Modify

| Path | Sorumluluk |
|------|------------|
| `supabase/migrations/0005_ai_chat_usage.sql` | IP başına günlük sayaç tablosu + RLS |
| `lib/ai/system-prompt.ts` | Zolarr hakkında sabit sistem prompt'u |
| `lib/ai/client.ts` | Anthropic SDK istemci sarmalayıcısı + prompt cache config |
| `lib/ai/rate-limit.ts` | IP hash + günlük 10 mesaj kontrolü (Supabase) |
| `lib/utils/text-cleaner.ts` | TTS için emoji/markdown temizleme |
| `app/api/ai/chat/route.ts` | POST endpoint, SSE streaming |
| `lib/store/chat.ts` | Zustand: mesajlar, isOpen, isStreaming |
| `components/ai/floating-button.tsx` | Sağ alt floating button |
| `components/ai/chat-panel.tsx` | Panel kabuğu (header + scrollable + input) |
| `components/ai/chat-message.tsx` | Mesaj baloncuğu + markdown + TTS |
| `components/ai/chat-input.tsx` | Textarea + gönder butonu |
| `components/ai/tts-controls.tsx` | 🔊 / ⏸ / ⏹ butonları |
| `components/ai/ai-mount.tsx` | FloatingButton + ChatPanel wrapper |
| `components/layout/floating/floating-stack.tsx` | AiMount eklenir |
| `tests/lib/text-cleaner.test.ts` | Emoji/markdown temizleme |
| `tests/lib/ai-rate-limit.test.ts` | Rate limit logic (mocked Supabase) |
| `tests/components/ai/chat-message.test.tsx` | Markdown + TTS button render |
| `tests/components/ai/chat-panel.test.tsx` | Panel açılma/kapanma |

---

## Task 1: Migration 0005 — ai_chat_usage tablosu

**Files:**
- Create: `supabase/migrations/0005_ai_chat_usage.sql`

- [ ] **Step 1: Migration yaz**

```sql
-- 0005_ai_chat_usage.sql
-- IP başına günlük AI sohbet sayacı

create table if not exists public.ai_chat_usage (
  ip_hash text not null,
  day date not null,
  message_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (ip_hash, day)
);

create index if not exists ai_chat_usage_day_idx on public.ai_chat_usage(day);

alter table public.ai_chat_usage enable row level security;

-- Sadece service role insert/update yapar; anon erişimi yok.
-- Policy gerekmez; service role RLS'i bypass eder.
```

- [ ] **Step 2: Kullanıcıya yapıştırma talimatı + commit**

`supabase/migrations/combined_for_paste_v3.sql` dosyasına da ekle (sadece bu migration'ı içeren, paste-ready):

```sql
-- combined_for_paste_v3.sql
-- Sadece 0005 migration. Studio SQL Editor'a yapıştırıp Run.

[0005_ai_chat_usage.sql tüm içeriği aynen]

-- Doğrulama
select to_regclass('public.ai_chat_usage') is not null as table_exists;
```

```bash
git add supabase/migrations/0005_ai_chat_usage.sql supabase/migrations/combined_for_paste_v3.sql
git commit -m "feat(db): add ai_chat_usage rate limit table"
```

---

## Task 2: Anthropic SDK kurulumu

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Paket yükle**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: TypeScript çalışıyor mu doğrula**

```bash
npx tsc --noEmit
```

Beklenen: 0 hata.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @anthropic-ai/sdk"
```

---

## Task 3: Sistem prompt'u

**Files:**
- Create: `lib/ai/system-prompt.ts`

- [ ] **Step 1: Yaz**

```ts
// Zolarr AI Asistan — sistem prompt'u.
// Bu metin Faz 8'de admin paneli üzerinden düzenlenebilir hale gelecek.

export const ZOLARR_SYSTEM_PROMPT = `Sen Zolarr'ın resmi AI asistanısın. Zolarr, Türkiye'de güneş enerjisi sistemleri kuran bir firma.

# Rolün
- Müşterilerin güneş enerjisi sorularına Türkçe, sade ve doğru cevap ver
- Şirket, ürünler, kurulum süreci, garanti, teklif alma hakkında bilgi ver
- Yatırım geri dönüş süresi, sistem boyutu, kabataslak fiyat gibi hesaplamalarda yardımcı ol
- Spesifik teklif veya bağlayıcı taahhüt verme — bunun için /teklif/al sayfasına yönlendir
- Cevaplarını markdown formatında ver (\`*kalın*\`, \`*italik*\`, \`-\` listeler), ama başlık (\`#\`) sınırlı kullan

# Şirket bilgileri
- Adı: Zolarr
- Hizmetler: Konut, işyeri, tarımsal güneş enerjisi sistemleri
- Süreç: Keşif → Teklif → Sözleşme → Kurulum → Devreye alma
- Garanti: Panel 25 yıl, invertör 5–10 yıl, işçilik 2 yıl
- İletişim: WhatsApp sağ alt floating buton, /iletisim sayfasında telefon ve form
- Teklif almak: /teklif/al sayfasında 7 adımlı sihirbaz

# Yönlendirmeler
- "Detaylı teklif istiyorum" → /teklif/al
- "Ürünleri görmek istiyorum" → /magaza
- "Sepetim" → /sepet
- "Bayi olmak istiyorum" → /teklif/ver

# Yanıt kuralları
- Cevaplar **kısa ve net** olsun (2–4 paragraf yeter)
- Emoji'leri ölçülü kullan (örn. 🔆 ☀️) — abartma
- Türkçe imla ve dilbilgisine dikkat et
- Belirsizsen "Tam emin değilim, /iletisim sayfasından bize ulaşın" de`;
```

- [ ] **Step 2: Commit**

```bash
git add lib/ai/system-prompt.ts
git commit -m "feat(ai): add Zolarr AI system prompt"
```

---

## Task 4: Anthropic istemcisi

**Files:**
- Create: `lib/ai/client.ts`

- [ ] **Step 1: Yaz**

```ts
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

let cachedClient: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY ortam değişkeni tanımlı değil');
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export const AI_MODEL = 'claude-sonnet-4-6' as const;
export const AI_MAX_TOKENS = 1024;
```

- [ ] **Step 2: Commit**

```bash
git add lib/ai/client.ts
git commit -m "feat(ai): add Anthropic client wrapper"
```

---

## Task 5: Rate limit (IP başına 10/gün)

**Files:**
- Create: `lib/ai/rate-limit.ts`
- Create: `tests/lib/ai-rate-limit.test.ts`

- [ ] **Step 1: Failing test yaz**

```ts
// tests/lib/ai-rate-limit.test.ts
import { describe, it, expect } from 'vitest';
import { hashIp, ANON_DAILY_LIMIT } from '@/lib/ai/rate-limit';

describe('rate-limit utils', () => {
  it('hashIp deterministically hashes the same input to the same output', () => {
    expect(hashIp('1.2.3.4')).toBe(hashIp('1.2.3.4'));
  });

  it('hashIp produces different hashes for different IPs', () => {
    expect(hashIp('1.2.3.4')).not.toBe(hashIp('5.6.7.8'));
  });

  it('hashIp output is non-empty hex', () => {
    expect(hashIp('1.2.3.4')).toMatch(/^[a-f0-9]{32,}$/);
  });

  it('exposes ANON_DAILY_LIMIT = 10', () => {
    expect(ANON_DAILY_LIMIT).toBe(10);
  });
});
```

- [ ] **Step 2: Çalıştır, fail olmalı**

```bash
npx vitest run tests/lib/ai-rate-limit.test.ts
```

Beklenen: `Cannot find module '@/lib/ai/rate-limit'`.

- [ ] **Step 3: Implementation**

```ts
// lib/ai/rate-limit.ts
import 'server-only';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const ANON_DAILY_LIMIT = 10;

const RATE_LIMIT_SALT = 'zolarr-ai-2026-05';

export function hashIp(ip: string): string {
  return createHash('sha256').update(`${RATE_LIMIT_SALT}:${ip}`).digest('hex');
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env eksik');
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

// Mesaj göndermeden ÖNCE çağrılır. Limit dolmuşsa allowed=false döner ve sayaç artmaz.
export async function checkAndIncrement(ip: string): Promise<RateLimitResult> {
  const ipHash = hashIp(ip);
  const day = todayUtc();
  const supabase = adminClient();

  const { data: existing, error: fetchError } = await supabase
    .from('ai_chat_usage')
    .select('message_count')
    .eq('ip_hash', ipHash)
    .eq('day', day)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Rate limit okunamadı: ${fetchError.message}`);
  }

  const current = existing?.message_count ?? 0;
  if (current >= ANON_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: ANON_DAILY_LIMIT };
  }

  const next = current + 1;
  const { error: upsertError } = await supabase.from('ai_chat_usage').upsert({
    ip_hash: ipHash,
    day,
    message_count: next,
    updated_at: new Date().toISOString(),
  });

  if (upsertError) {
    throw new Error(`Rate limit yazılamadı: ${upsertError.message}`);
  }

  return { allowed: true, remaining: ANON_DAILY_LIMIT - next, limit: ANON_DAILY_LIMIT };
}

export function extractIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}
```

- [ ] **Step 4: Test geçsin**

```bash
npx vitest run tests/lib/ai-rate-limit.test.ts
```

Beklenen: 4 / 4 PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/ai/rate-limit.ts tests/lib/ai-rate-limit.test.ts
git commit -m "feat(ai): add IP-based daily rate limit (10/day anon)"
```

---

## Task 6: TTS metin temizleyici

**Files:**
- Create: `lib/utils/text-cleaner.ts`
- Create: `tests/lib/text-cleaner.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/lib/text-cleaner.test.ts
import { describe, it, expect } from 'vitest';
import { cleanForSpeech } from '@/lib/utils/text-cleaner';

describe('cleanForSpeech', () => {
  it('strips emojis', () => {
    expect(cleanForSpeech('Merhaba 🔆 dünya ☀️')).toBe('Merhaba dünya');
  });

  it('strips markdown bold/italic markers', () => {
    expect(cleanForSpeech('**Kalın** ve *italik* metin')).toBe('Kalın ve italik metin');
  });

  it('strips heading markers', () => {
    expect(cleanForSpeech('# Başlık\nMetin')).toBe('Başlık. Metin');
  });

  it('replaces list markers with comma', () => {
    expect(cleanForSpeech('- Madde bir\n- Madde iki')).toBe('Madde bir, Madde iki');
  });

  it('replaces URLs with the word "link"', () => {
    expect(cleanForSpeech('Bilgi: https://example.com adresinde')).toBe('Bilgi: link adresinde');
  });

  it('collapses repeated whitespace', () => {
    expect(cleanForSpeech('iki   üç')).toBe('iki üç');
  });
});
```

- [ ] **Step 2: Test fail olsun**

```bash
npx vitest run tests/lib/text-cleaner.test.ts
```

- [ ] **Step 3: Implementation**

```ts
// lib/utils/text-cleaner.ts
// AI mesajını sesli okuma için temizler.

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/gu;
const URL_RE = /https?:\/\/\S+/g;

export function cleanForSpeech(text: string): string {
  let out = text;
  out = out.replace(URL_RE, 'link');
  out = out.replace(EMOJI_RE, '');
  out = out.replace(/^\s*#{1,6}\s+(.+)$/gm, '$1.');
  out = out.replace(/^\s*[-*+]\s+/gm, '');
  out = out.replace(/\*\*(.+?)\*\*/g, '$1');
  out = out.replace(/\*(.+?)\*/g, '$1');
  out = out.replace(/`([^`]+)`/g, '$1');
  out = out.replace(/\n+/g, ', ');
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}
```

- [ ] **Step 4: Test geçsin + commit**

```bash
npx vitest run tests/lib/text-cleaner.test.ts
git add lib/utils/text-cleaner.ts tests/lib/text-cleaner.test.ts
git commit -m "feat(ai): add text cleaner for TTS (strip emoji/markdown/urls)"
```

---

## Task 7: Chat API endpoint (streaming)

**Files:**
- Create: `app/api/ai/chat/route.ts`

- [ ] **Step 1: Implementation**

```ts
// app/api/ai/chat/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnthropic, AI_MODEL, AI_MAX_TOKENS } from '@/lib/ai/client';
import { ZOLARR_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { checkAndIncrement, extractIp } from '@/lib/ai/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Form geçersiz' }, { status: 400 });
  }

  const ip = extractIp(req);
  let limit;
  try {
    limit = await checkAndIncrement(ip);
  } catch (err) {
    console.error('[ai/chat] rate limit hata:', err);
    return NextResponse.json(
      { error: 'Sunucu hatası, lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          'Bugünkü mesaj hakkınız doldu (10 mesaj/gün). Yarın tekrar deneyin veya /iletisim sayfasından bize ulaşın.',
      },
      { status: 429 }
    );
  }

  const anthropic = getAnthropic();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        const response = anthropic.messages.stream({
          model: AI_MODEL,
          max_tokens: AI_MAX_TOKENS,
          system: [
            {
              type: 'text',
              text: ZOLARR_SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: parsed.data.messages,
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(
              enc.encode(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch (err) {
        console.error('[ai/chat] stream hata:', err);
        controller.enqueue(
          enc.encode(`data: ${JSON.stringify({ error: 'Stream hatası' })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-RateLimit-Limit': String(limit.limit),
      'X-RateLimit-Remaining': String(limit.remaining),
    },
  });
}
```

- [ ] **Step 2: Build çalışsın + commit**

```bash
npx tsc --noEmit
git add app/api/ai/chat/route.ts
git commit -m "feat(ai): add /api/ai/chat streaming endpoint with rate limit"
```

---

## Task 8: Chat Zustand store

**Files:**
- Create: `lib/store/chat.ts`

- [ ] **Step 1: Yaz**

```ts
'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface State {
  isOpen: boolean;
  isStreaming: boolean;
  messages: ChatMessage[];
  errorMessage: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  appendUserMessage: (content: string) => void;
  startAssistantMessage: () => string;
  appendAssistantDelta: (id: string, delta: string) => void;
  finishAssistantMessage: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useChatStore = create<State>((set) => ({
  isOpen: false,
  isStreaming: false,
  messages: [],
  errorMessage: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  appendUserMessage: (content) =>
    set((s) => ({
      messages: [...s.messages, { id: newId(), role: 'user', content }],
      errorMessage: null,
    })),
  startAssistantMessage: () => {
    const id = newId();
    set((s) => ({
      messages: [...s.messages, { id, role: 'assistant', content: '' }],
      isStreaming: true,
    }));
    return id;
  },
  appendAssistantDelta: (id, delta) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + delta } : m
      ),
    })),
  finishAssistantMessage: () => set({ isStreaming: false }),
  setError: (message) => set({ errorMessage: message, isStreaming: false }),
  reset: () => set({ messages: [], errorMessage: null, isStreaming: false }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add lib/store/chat.ts
git commit -m "feat(ai): add chat Zustand store"
```

---

## Task 9: TTS controls

**Files:**
- Create: `components/ai/tts-controls.tsx`

- [ ] **Step 1: Yaz**

```tsx
'use client';

import * as React from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { cleanForSpeech } from '@/lib/utils/text-cleaner';

interface Props {
  text: string;
}

type Status = 'idle' | 'speaking' | 'paused';

export function TtsControls({ text }: Props) {
  const [status, setStatus] = React.useState<Status>('idle');
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const cleaned = cleanForSpeech(text);
    if (!cleaned) return;
    const u = new SpeechSynthesisUtterance(cleaned);
    u.lang = 'tr-TR';
    u.onend = () => setStatus('idle');
    u.onerror = () => setStatus('idle');
    utteranceRef.current = u;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setStatus('speaking');
  }

  function pause() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  }

  function resume() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setStatus('speaking');
    }
  }

  function stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setStatus('idle');
    }
  }

  return (
    <div className="mt-2 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
      {status === 'idle' && (
        <button type="button" onClick={speak} aria-label="Sesli oku" className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]">
          <Volume2 className="h-3.5 w-3.5" /> Sesli oku
        </button>
      )}
      {status === 'speaking' && (
        <>
          <button type="button" onClick={pause} aria-label="Duraklat" className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]">
            <Pause className="h-3.5 w-3.5" /> Duraklat
          </button>
          <button type="button" onClick={stop} aria-label="Durdur" className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]">
            <Square className="h-3.5 w-3.5" /> Durdur
          </button>
        </>
      )}
      {status === 'paused' && (
        <>
          <button type="button" onClick={resume} aria-label="Devam et" className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]">
            <Play className="h-3.5 w-3.5" /> Devam et
          </button>
          <button type="button" onClick={stop} aria-label="Durdur" className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]">
            <Square className="h-3.5 w-3.5" /> Durdur
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ai/tts-controls.tsx
git commit -m "feat(ai): add TTS controls (Web Speech API, tr-TR)"
```

---

## Task 10: Chat message component

**Files:**
- Create: `components/ai/chat-message.tsx`
- Create: `tests/components/ai/chat-message.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// tests/components/ai/chat-message.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatMessage } from '@/components/ai/chat-message';

describe('ChatMessage', () => {
  it('renders user content as plain text', () => {
    render(<ChatMessage role="user" content="Merhaba" />);
    expect(screen.getByText('Merhaba')).toBeInTheDocument();
  });

  it('renders assistant markdown bold', () => {
    render(<ChatMessage role="assistant" content="Bu **kalın** metin" />);
    expect(screen.getByText('kalın').tagName.toLowerCase()).toBe('strong');
  });

  it('shows TTS button only for assistant messages', () => {
    const { rerender } = render(<ChatMessage role="user" content="x" />);
    expect(screen.queryByLabelText(/Sesli oku/i)).not.toBeInTheDocument();
    rerender(<ChatMessage role="assistant" content="x" />);
    expect(screen.getByLabelText(/Sesli oku/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Test fail olsun**

```bash
npx vitest run tests/components/ai/chat-message.test.tsx
```

- [ ] **Step 3: Implementation**

```tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TtsControls } from './tts-controls';
import { cn } from '@/lib/utils';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: Props) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
          isUser
            ? 'bg-[var(--color-brand)] text-[var(--color-bg-base)]'
            : 'bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)]'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {content.length > 0 && <TtsControls text={content} />}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Test geçsin + commit**

```bash
npx vitest run tests/components/ai/chat-message.test.tsx
git add components/ai/chat-message.tsx tests/components/ai/chat-message.test.tsx
git commit -m "feat(ai): add ChatMessage with markdown render and TTS"
```

---

## Task 11: Chat input

**Files:**
- Create: `components/ai/chat-input.tsx`

- [ ] **Step 1: Yaz**

```tsx
'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat';

interface Props {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: Props) {
  const { isStreaming } = useChatStore();
  const [value, setValue] = React.useState('');
  const ref = React.useRef<HTMLTextAreaElement>(null);

  function submit() {
    const text = value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setValue('');
    ref.current?.focus();
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 border-t border-[var(--color-border-glass)] p-3"
    >
      <textarea
        ref={ref}
        rows={1}
        maxLength={2000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        disabled={isStreaming}
        placeholder="Sorunuzu yazın..."
        aria-label="Mesajınız"
        className="max-h-24 flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
      />
      <button
        type="submit"
        disabled={isStreaming || !value.trim()}
        aria-label="Gönder"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)] text-[var(--color-bg-base)] transition-opacity disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ai/chat-input.tsx
git commit -m "feat(ai): add chat input with Enter-to-send"
```

---

## Task 12: Chat panel

**Files:**
- Create: `components/ai/chat-panel.tsx`
- Create: `tests/components/ai/chat-panel.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// tests/components/ai/chat-panel.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChatPanel } from '@/components/ai/chat-panel';
import { useChatStore } from '@/lib/store/chat';

describe('ChatPanel', () => {
  beforeEach(() => useChatStore.setState({ isOpen: true, messages: [], errorMessage: null, isStreaming: false }));

  it('renders header and empty-state hint when no messages', () => {
    render(<ChatPanel />);
    expect(screen.getByText(/Zolarr AI Asistan/i)).toBeInTheDocument();
    expect(screen.getByText(/Merhaba/i)).toBeInTheDocument();
  });

  it('returns null when not open', () => {
    useChatStore.setState({ isOpen: false });
    const { container } = render(<ChatPanel />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Test fail olsun**

```bash
npx vitest run tests/components/ai/chat-panel.test.tsx
```

- [ ] **Step 3: Implementation**

```tsx
'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';

export function ChatPanel() {
  const { isOpen, close, messages, isStreaming, errorMessage, appendUserMessage, startAssistantMessage, appendAssistantDelta, finishAssistantMessage, setError } = useChatStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (!isOpen) return null;

  async function send(text: string) {
    appendUserMessage(text);
    const id = startAssistantMessage();
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...useChatStore.getState().messages
              .filter((m) => m.id !== id)
              .map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? 'Sunucu hatası');
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError('Sunucu cevabı boş');
        return;
      }
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          const m = part.match(/^data: (.+)$/);
          if (!m) continue;
          try {
            const evt = JSON.parse(m[1]!);
            if (evt.delta) appendAssistantDelta(id, evt.delta);
            if (evt.error) setError(evt.error);
          } catch {
            // yoksay
          }
        }
      }
    } catch (err) {
      console.error('[chat] fetch hata:', err);
      setError('Bağlantı hatası, tekrar deneyin.');
    } finally {
      finishAssistantMessage();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[600px] max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-glass)] sm:right-6 max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:h-full max-sm:w-full max-sm:max-h-none max-sm:rounded-none">
      <header className="flex items-center justify-between border-b border-[var(--color-border-glass)] px-4 py-3">
        <h2 className="font-display text-base font-semibold">Zolarr AI Asistan</h2>
        <button type="button" onClick={close} aria-label="Kapat" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-overlay)]">
          <X className="h-5 w-5" />
        </button>
      </header>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Merhaba! Güneş enerjisi sistemleri, ürünlerimiz veya teklif süreci hakkında ne öğrenmek istersiniz?
          </p>
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role} content={m.content} />
        ))}
        {errorMessage && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {errorMessage}
          </p>
        )}
      </div>
      <ChatInput onSend={send} />
    </div>
  );
}
```

- [ ] **Step 4: Test geçsin + commit**

```bash
npx vitest run tests/components/ai/chat-panel.test.tsx
git add components/ai/chat-panel.tsx tests/components/ai/chat-panel.test.tsx
git commit -m "feat(ai): add ChatPanel with SSE streaming consumer"
```

---

## Task 13: Floating button + AiMount

**Files:**
- Create: `components/ai/floating-button.tsx`
- Create: `components/ai/ai-mount.tsx`
- Modify: `components/layout/floating/floating-stack.tsx`

- [ ] **Step 1: floating-button.tsx**

```tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat';

export function FloatingButton() {
  const { isOpen, toggle } = useChatStore();

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? 'AI asistanı kapat' : 'AI asistanı aç'}
      aria-expanded={isOpen}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring' }}
      className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-bg-base)] shadow-[var(--shadow-glow)] transition-transform hover:scale-110"
    >
      <Sparkles className="h-6 w-6" />
    </motion.button>
  );
}
```

- [ ] **Step 2: ai-mount.tsx**

```tsx
'use client';

import { FloatingButton } from './floating-button';
import { ChatPanel } from './chat-panel';

export function AiMount() {
  return (
    <>
      <FloatingButton />
      <ChatPanel />
    </>
  );
}
```

- [ ] **Step 3: floating-stack.tsx güncelle**

```tsx
import { AiMount } from '@/components/ai/ai-mount';
import { WhatsAppButton } from './whatsapp-button';
import { MobileCta } from './mobile-cta';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { Toaster } from '@/components/ui/toaster';

export function FloatingStack() {
  return (
    <>
      <AiMount />
      <WhatsAppButton />
      <MobileCta />
      <CookieBanner />
      <Toaster />
    </>
  );
}
```

- [ ] **Step 4: Build temiz mi + commit**

```bash
npm run build
git add components/ai/floating-button.tsx components/ai/ai-mount.tsx components/layout/floating/floating-stack.tsx
git commit -m "feat(ai): mount AI floating button and chat panel in layout"
```

---

## Task 14: Final doğrulama + completion report

**Files:**
- Create: `docs/superpowers/plans/2026-05-06-faz-5-completion.md`

- [ ] **Step 1: Doğrulama**

```bash
npm test
npx tsc --noEmit
npm run build
```

Beklenen: tüm testler PASS, tsc 0 hata, build clean.

- [ ] **Step 2: Completion report**

```md
# Faz 5 — AI Asistan: Completion Report

**Tarih:** 2026-05-06
**Branch:** master
**Plan:** docs/superpowers/plans/2026-05-06-faz-5-ai-asistan.md

## Özet

Sağ alt köşede 380×600 floating AI Asistan paneli; Anthropic Claude Sonnet 4.6 ile streaming
sohbet (SSE), markdown render, Türkçe TTS, IP başına günlük 10 mesaj limit. RAG ve admin
doküman yönetimi Faz 8'e ertelendi.

- Migration 0005 ai_chat_usage tablosu — kullanıcı uyguladı
- /api/ai/chat endpoint streaming + rate limit
- Sistem prompt'u (Faz 8'de admin editable olacak)
- Floating button + ChatPanel + ChatMessage + ChatInput + TtsControls
- Web Speech API ile Türkçe okuma; emoji/markdown/URL temizliği

## Sayılar

- Görev: 14
- Test: <NNN> / <NNN> ✅
- TypeScript: temiz
- Build: temiz

## Bilinen sınırlamalar

- RAG (PDF chunk + pgvector) → Faz 8'de admin paneli ile birlikte
- Auth-based 50/gün limit → Faz 7'de
- Sistem prompt admin düzenleme → Faz 8'de
- Konuşma geçmişi sadece sayfa açıkken kalıcı (sayfa yenilenince temizlenir)

## Kullanıcı eylemi gerekli

1. `.env.local`'a `ANTHROPIC_API_KEY=...` eklendi mi kontrol et
2. `supabase/migrations/combined_for_paste_v3.sql`'i Studio SQL Editor'a yapıştırıp Run
3. `npm run dev` → anasayfada sağ alt köşede AI butonu → mesaj at
```

- [ ] **Step 3: commit**

```bash
git add docs/superpowers/plans/2026-05-06-faz-5-completion.md
git commit -m "docs: Phase 5 completion report"
```

---

## Self-Review

**Spec coverage (§8):**
- (8.1) Floating panel sağ alt, 380×600, mobile fullscreen: ✅ Task 12 + 13.
- (8.2) Genel sorulara cevap, sistem boyutu, kabataslak fiyat, ürün önerisi, yönlendirme: ✅ Task 3 sistem prompt'u + chat API.
- (8.2.5) Teknik bilgi RAG: ⏳ Faz 8'de admin paneli ile.
- (8.3) Markdown render, emoji ölçülü, paragraf/liste yapısı: ✅ Task 10 react-markdown.
- (8.4) TTS 🔊/⏸/⏯/⏹, tr-TR, emoji+markdown temizliği: ✅ Task 6 + Task 9.
- (8.5) RAG admin yönetimi: ⏳ Faz 8'de.
- (8.6) Anonim 10/gün, kayıtlı 50/gün: ✅ kısmen — anonim 10/gün Task 5'te. Auth 50/gün Faz 7.

**Placeholder scan:** Tüm task'larda kod tam, "TODO" yok.

**Type consistency:**
- `ChatMessage` (store) ile `ChatMessage` (component) farklı: store'daki tip `ChatMessage` interface adı, component'te aynı isim ama component'in props'unda `id` yok. Component'i `role` + `content` alıyor — tutarlı.
- `appendAssistantDelta(id, delta)` ile `startAssistantMessage()` dönüş tipi `string` (id) — tutarlı.
- `extractIp(req: Request)` Web Request — Next.js Route Handler imzasıyla tutarlı.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-06-faz-5-ai-asistan.md`. Subagent-Driven ile yürütülecek.**


