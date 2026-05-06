'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DealerSuccess({ applicationNumber }: { applicationNumber: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand)]/15"
      >
        <Check className="h-10 w-10 text-[var(--color-brand)]" strokeWidth={3} />
      </motion.div>
      <h2 className="mt-6 font-display text-2xl font-bold">Başvurunuz alındı!</h2>
      <p className="mt-2 max-w-md text-[var(--color-text-muted)]">
        Başvurunuz incelemeye alındı. 5 iş günü içinde size dönüş yapılacak.
      </p>
      <p className="mt-6 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-bg-elevated)] px-6 py-3 font-mono text-xl font-semibold text-[var(--color-brand)]">
        {applicationNumber}
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Anasayfaya Dön</Link>
      </Button>
    </div>
  );
}
