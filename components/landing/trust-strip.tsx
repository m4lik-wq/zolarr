'use client';

import { motion } from 'framer-motion';

const BADGES = [
  { label: 'TSE', sub: 'Sertifikalı' },
  { label: 'IEC 61215', sub: 'Solar standart' },
  { label: 'GÜNDER', sub: 'Üye' },
  { label: 'EPDK', sub: 'Yetkili' },
  { label: 'ISO 9001', sub: 'Kalite' },
];

export function TrustStrip() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] items-center gap-6 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-8 bg-[var(--color-warm-gold)]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[var(--color-text-muted)] font-mono">
              Sertifikalı kurulum partneri
            </span>
          </motion.div>

          <ul className="flex flex-wrap items-center gap-3 lg:gap-5 lg:justify-end">
            {BADGES.map((b, i) => (
              <motion.li
                key={b.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="group"
              >
                <div className="flex items-baseline gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] transition-all duration-200 hover:border-[var(--color-warm-gold)] hover:bg-[var(--color-warm-gold-soft)]">
                  <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-warm-gold)] transition-colors">
                    {b.label}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] hidden md:inline">
                    · {b.sub}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
