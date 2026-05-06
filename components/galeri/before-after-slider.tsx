'use client';

import * as React from 'react';
import Image from 'next/image';

interface Props {
  before: string;
  after: string;
  alt: string;
}

export function BeforeAfterSlider({ before, after, alt }: Props) {
  const [pos, setPos] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);

  function setFromClient(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, ratio)));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClient(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons === 0) return;
    setFromClient(e.clientX);
  }
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      className="relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black"
    >
      <Image src={before} alt={`${alt} — önce`} fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image src={after} alt={`${alt} — sonra`} fill sizes="100vw" className="object-cover" priority />
      </div>
      <div
        role="slider"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label="Önce / sonra karşılaştırması"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        className="absolute top-0 bottom-0 -translate-x-1/2 cursor-ew-resize"
        style={{ left: `${pos}%` }}
      >
        <div className="h-full w-1 bg-[var(--color-brand)]" />
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--color-brand)] bg-[var(--color-bg-elevated)] text-[var(--color-brand)]">
          ↔
        </div>
      </div>
      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
        Önce
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-[var(--color-brand)]/90 px-3 py-1 text-xs font-medium text-[var(--color-bg-base)]">
        Sonra
      </div>
    </div>
  );
}
