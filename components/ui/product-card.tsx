'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BellPlus } from 'lucide-react';
import type { MockProduct } from '@/lib/data/products-mock';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Props {
  product: MockProduct;
  className?: string;
}

const priceFmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

export function ProductCard({ product, className }: Props) {
  const [idx, setIdx] = React.useState(0);
  const total = product.images.length;

  function prev() {
    setIdx((i) => (i - 1 + total) % total);
  }
  function next() {
    setIdx((i) => (i + 1) % total);
  }

  const currentImage = product.images[idx] ?? product.images[0];

  return (
    <article
      className={cn(
        'glass group relative flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/30',
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg-overlay)]">
        {currentImage && (
          <Image
            src={currentImage}
            alt={`${product.name} görseli ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Önceki görsel"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Sonraki görsel"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {product.images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    i === idx ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-text-muted)]/40'
                  )}
                />
              ))}
            </div>
          </>
        )}

        {product.badges.length > 0 && (
          <ul className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.badges.map((b) => (
              <li
                key={b}
                className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--color-bg-base)]"
              >
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-medium leading-tight">{product.name}</h3>
        <p className="font-mono text-lg font-semibold text-[var(--color-brand)]">
          {priceFmt.format(product.priceTry)}
        </p>
        <div className="mt-auto pt-2">
          {product.inStock ? (
            <Button asChild size="sm" className="w-full">
              <Link href={`/magaza/${product.slug}`}>İncele</Link>
            </Button>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-[var(--color-text-muted)]">Stokta yok</p>
              <Button type="button" variant="secondary" size="sm" className="w-full">
                <BellPlus className="h-4 w-4" />
                Gelince Haber Ver
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
