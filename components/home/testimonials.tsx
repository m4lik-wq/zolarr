'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS_MOCK } from '@/lib/data/testimonials-mock';
import { Button } from '@/components/ui/button';

export function Testimonials() {
  const [ref, embla] = useEmblaCarousel({ loop: true, align: 'start' });

  const prev = React.useCallback(() => embla?.scrollPrev(), [embla]);
  const next = React.useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section className="border-t border-[var(--color-border-glass)] py-16" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="testimonials-heading" className="font-display text-3xl font-bold sm:text-4xl">
              Müşterilerimiz ne diyor?
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Türkiye genelinden 1.450+ memnun müşteri.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button type="button" variant="icon" size="icon" onClick={prev} aria-label="Önceki">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button type="button" variant="icon" size="icon" onClick={next} aria-label="Sonraki">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div ref={ref} className="overflow-hidden">
          <ul className="flex gap-4">
            {TESTIMONIALS_MOCK.map((t) => (
              <li key={t.name} className="glass min-w-[280px] rounded-2xl p-6 sm:min-w-[360px]">
                <Quote className="mb-3 h-6 w-6 text-[var(--color-brand)]" aria-hidden />
                <p className="mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between border-t border-[var(--color-border-glass)] pt-3">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t.role} · {t.city}</p>
                  </div>
                  <div className="flex gap-0.5" aria-label={`${t.rating} yıldız`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[var(--color-brand)] text-[var(--color-brand)]" />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
