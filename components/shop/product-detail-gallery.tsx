'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  alt: string;
}

export function ProductDetailGallery({ images, alt }: Props) {
  const [idx, setIdx] = React.useState(0);
  const total = images.length;
  if (total === 0) return null;

  const cur = images[idx] ?? images[0]!;
  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]">
        <Image
          src={cur}
          alt={`${alt} ${idx + 1}/${total}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Önceki"
              onClick={() => setIdx((i) => (i - 1 + total) % total)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-base)]/85 p-2 hover:bg-[var(--color-bg-overlay)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Sonraki"
              onClick={() => setIdx((i) => (i + 1) % total)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-base)]/85 p-2 hover:bg-[var(--color-bg-overlay)]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Görsel ${i + 1}`}
            className={cn(
              'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
              i === idx
                ? 'border-[var(--color-brand)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
            )}
          >
            <Image src={src} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
