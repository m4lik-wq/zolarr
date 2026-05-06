'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';

export function ChatPanel() {
  const {
    isOpen,
    close,
    messages,
    isStreaming,
    errorMessage,
    appendUserMessage,
    startAssistantMessage,
    appendAssistantDelta,
    finishAssistantMessage,
    setError,
  } = useChatStore();
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
            ...useChatStore
              .getState()
              .messages.filter((m) => m.id !== id)
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
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-overlay)]"
        >
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
