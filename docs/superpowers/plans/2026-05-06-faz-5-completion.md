# Faz 5 — AI Asistan: Completion Report

**Tarih:** 2026-05-06
**Branch:** master
**Plan:** docs/superpowers/plans/2026-05-06-faz-5-ai-asistan.md

## Özet

Sağ alt köşede 380×600 floating AI Asistan paneli; Anthropic Claude Sonnet 4.6 ile streaming
sohbet (SSE), markdown render, Türkçe TTS, IP başına günlük 10 mesaj limit. RAG ve admin
doküman yönetimi Faz 8'e ertelendi.

- Migration 0005 `ai_chat_usage` tablosu (paste-ready: `combined_for_paste_v3.sql`)
- `@anthropic-ai/sdk` kurulumu
- `lib/ai/system-prompt.ts` — Zolarr için sabit Türkçe sistem promptu
- `lib/ai/client.ts` — `getAnthropic()` lazy istemci, model `claude-sonnet-4-6`, `max_tokens=1024`
- `lib/ai/rate-limit.ts` — sha256 IP hash + Supabase upsert (TDD, 4 test)
- `lib/utils/text-cleaner.ts` — emoji/markdown/URL temizleme (TDD, 6 test)
- `app/api/ai/chat/route.ts` — POST endpoint, prompt cache + SSE streaming
- `lib/store/chat.ts` — Zustand store (mesajlar, isOpen, isStreaming, error)
- `components/ai/floating-button.tsx` — sparkles ikonu, framer-motion entrance
- `components/ai/chat-panel.tsx` — SSE consumer, auto-scroll, mobile fullscreen (TDD, 2 test)
- `components/ai/chat-message.tsx` — react-markdown + remark-gfm (TDD, 3 test)
- `components/ai/chat-input.tsx` — Enter ile gönder, streaming sırasında kilitli
- `components/ai/tts-controls.tsx` — Web Speech API tr-TR, oynat/duraklat/durdur
- `components/ai/ai-mount.tsx` + `floating-stack.tsx` entegrasyonu

## Sayılar

- Görev: 14
- Commit: 13 (`ae0dc56..108dfe5`)
- Test: 119 / 119 ✅ (38 test dosyası, +15 yeni)
- TypeScript: temiz (`tsc --noEmit` 0 hata)
- Build: temiz (`next build` 9 route, `/api/ai/chat` dynamic)

## Bilinen sınırlamalar

- **Çalışması için iki kullanıcı eylemi gerekli** (aşağıda)
- RAG (PDF chunk + pgvector) → Faz 8'de admin paneli ile birlikte
- Auth-based 50/gün limit → Faz 7'de
- Sistem prompt admin düzenleme → Faz 8'de
- Konuşma geçmişi sadece sayfa açıkken kalıcı (sayfa yenilenince temizlenir)

## Kullanıcı eylemi gerekli

1. **Migration:** `supabase/migrations/combined_for_paste_v3.sql`'i Studio SQL Editor'a
   yapıştırıp **Run** — `ai_chat_usage` tablosunu oluşturur (rate limit için).
2. **API anahtarı:** `.env.local` dosyasına şu satırı ekle:

   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

   Anahtar olmadan endpoint 500 döner. Anahtar alma:
   https://console.anthropic.com/settings/keys

3. Sonra `npm run dev` → herhangi bir sayfada sağ alt köşedeki AI butonuna tıkla → mesaj at.

## Spec coverage (§8)

- (8.1) Floating panel sağ alt, 380×600, mobile fullscreen: ✅
- (8.2) Genel sorulara cevap, sistem boyutu, kabataslak fiyat, ürün önerisi, yönlendirme: ✅
  (sistem promptunda kodlandı)
- (8.2.5) Teknik bilgi RAG: ⏳ Faz 8'de admin paneli ile
- (8.3) Markdown render, emoji ölçülü, paragraf/liste yapısı: ✅
- (8.4) TTS 🔊/⏸/⏯/⏹, tr-TR, emoji+markdown temizliği: ✅
- (8.5) RAG admin yönetimi: ⏳ Faz 8'de
- (8.6) Anonim 10/gün, kayıtlı 50/gün: ✅ kısmen — anonim 10/gün hazır, auth 50/gün Faz 7

## Implementation notları

- Vitest, `'server-only'` paketini çözemediği için `tests/stubs/server-only.ts` boş stub'u
  ile alias verildi (`vitest.config.ts`). Production'da Next.js sınırı uyguluyor.
- `text-cleaner` — plan kodunda iki ufak hata vardı (emoji `️` variation selector
  kapsanmıyordu, başlık değişimi trailing newline'ı bırakıyordu); subagent kendi testleriyle
  yakaladı, düzeltti, 6/6 yeşil.
- AI butonu `bottom-24 right-6`, WhatsApp butonu `bottom-6 right-6` — çakışma yok.
- Prompt cache açık (`cache_control: { type: 'ephemeral' }`) — sistem promptu cache'lenir.
