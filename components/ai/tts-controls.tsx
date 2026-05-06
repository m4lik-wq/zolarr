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
        <button
          type="button"
          onClick={speak}
          aria-label="Sesli oku"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]"
        >
          <Volume2 className="h-3.5 w-3.5" /> Sesli oku
        </button>
      )}
      {status === 'speaking' && (
        <>
          <button
            type="button"
            onClick={pause}
            aria-label="Duraklat"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]"
          >
            <Pause className="h-3.5 w-3.5" /> Duraklat
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label="Durdur"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]"
          >
            <Square className="h-3.5 w-3.5" /> Durdur
          </button>
        </>
      )}
      {status === 'paused' && (
        <>
          <button
            type="button"
            onClick={resume}
            aria-label="Devam et"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]"
          >
            <Play className="h-3.5 w-3.5" /> Devam et
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label="Durdur"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-[var(--color-bg-overlay)]"
          >
            <Square className="h-3.5 w-3.5" /> Durdur
          </button>
        </>
      )}
    </div>
  );
}
