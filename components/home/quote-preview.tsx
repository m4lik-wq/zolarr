'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
  { src: '/images/placeholder-project-1.svg', alt: 'Konut çatı GES kurulumu' },
  { src: '/images/placeholder-project-2.svg', alt: 'Ticari fabrika çatısı' },
  { src: '/images/placeholder-project-3.svg', alt: 'Tarımsal sera sulama' },
];

export function QuotePreview() {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center"
      aria-labelledby="quote-heading"
    >
      <div className="space-y-6">
        <h2 id="quote-heading" className="font-display text-3xl font-bold sm:text-4xl">
          Bize söyleyin, biz sizin yerinize hesaplayalım.
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Konum, çatınız ve faturanızı paylaşın; uzman mühendislerimiz sistem boyutunu, geri ödeme süresini
          ve finansman seçeneklerini şeffaf bir raporla sunsun.
        </p>
        <Button asChild size="lg">
          <Link href="/teklif/al">
            Detaylı Teklif Al
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--color-border-glass)]">
        <AnimatePresence mode="wait">
          {SLIDES.map((s, i) =>
            i === idx ? (
              <motion.div
                key={s.src}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Image src={s.src} alt={s.alt} fill className="object-cover" />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={
                i === idx
                  ? 'h-1.5 w-6 rounded-full bg-[var(--color-brand)] transition-all'
                  : 'h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)]/40 transition-all'
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
