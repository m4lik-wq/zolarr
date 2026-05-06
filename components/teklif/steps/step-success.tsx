'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  quoteNumber: string;
}

export function StepSuccess({ quoteNumber }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-brand)]/15"
      >
        <Check className="h-12 w-12 text-[var(--color-brand)]" strokeWidth={3} />
      </motion.div>
      <h2 className="mt-6 font-display text-3xl font-bold">Teklifiniz gönderildi!</h2>
      <p className="mt-2 max-w-md text-[var(--color-text-muted)]">
        Uzmanımız 24 saat içinde size dönüş yapacak. Aşağıdaki teklif numarasını saklayın.
      </p>
      <p className="mt-6 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-bg-elevated)] px-6 py-3 font-mono text-xl font-semibold text-[var(--color-brand)]">
        {quoteNumber}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">Anasayfaya Dön</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/magaza">Mağazaya Göz At</Link>
        </Button>
      </div>
    </div>
  );
}
