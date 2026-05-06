'use client';

import * as React from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CAMPAIGNS_MOCK } from '@/lib/data/campaigns-mock';
import { Button } from '@/components/ui/button';

export function ProductSlider() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: 'start', dragFree: true });

  const scrollPrev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = React.useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section
      className="border-t border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 py-16"
      aria-labelledby="campaigns-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="campaigns-heading" className="font-display text-3xl font-bold sm:text-4xl">
              Öne çıkan ürün ve kampanyalar
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Sınırlı süreli fırsatları kaçırmayın.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button type="button" variant="icon" size="icon" onClick={scrollPrev} aria-label="Önceki">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button type="button" variant="icon" size="icon" onClick={scrollNext} aria-label="Sonraki">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex gap-4">
            {CAMPAIGNS_MOCK.map((c) => (
              <li
                key={c.slug}
                className="glass group relative flex min-w-[260px] flex-col gap-2 rounded-2xl p-6 sm:min-w-[320px]"
              >
                <span className="inline-flex w-fit rounded-full bg-[var(--color-brand)]/15 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
                  {c.badge}
                </span>
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <p className="flex-1 text-sm text-[var(--color-text-muted)]">{c.subtitle}</p>
                <Button asChild size="sm" className="mt-2 w-fit">
                  <Link href={c.href}>{c.cta}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
