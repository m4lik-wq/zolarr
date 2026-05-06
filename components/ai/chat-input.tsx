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
