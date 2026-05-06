'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteWizardStore } from '@/lib/store/quote-wizard';

const SLIDES = [
  { src: '/images/placeholder-project-1.svg', alt: 'Konut çatı GES' },
  { src: '/images/placeholder-project-2.svg', alt: 'Ticari fabrika çatısı' },
  { src: '/images/placeholder-project-3.svg', alt: 'Tarımsal sera sulama' },
];

export function StepIntro() {
  const next = useQuoteWizardStore((s) => s.next);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Bize söyleyin, biz sizin yerinize hesaplayalım.
        </h1>
        <p className="text-[var(--color-text-muted)]">
          7 kısa adımda ihtiyacınızı belirleyelim. Uzmanımız 24 saat içinde size dönüş yapacak.
        </p>
        <Button size="lg" onClick={next}>
          Devam Et
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-border-glass)]">
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
      </div>
    </div>
  );
}
