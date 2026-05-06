'use client';

import { motion } from 'framer-motion';
import { Search, FileText, Hammer, Activity } from 'lucide-react';
import { PROCESS_MOCK } from '@/lib/data/process-mock';

const ICONS = { search: Search, 'file-text': FileText, hammer: Hammer, activity: Activity } as const;

export function ProcessTimeline() {
  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="process-heading">
      <h2 id="process-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">
        4 adımda anahtar teslim
      </h2>
      <p className="mb-10 max-w-2xl text-[var(--color-text-muted)]">
        Süreci size anlatalım — her aşama şeffaf ve takip edilebilir.
      </p>
      <ol className="grid gap-6 md:grid-cols-4">
        {PROCESS_MOCK.map((s, i) => {
          const Icon = ICONS[s.iconName];
          return (
            <motion.li
              key={s.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass relative rounded-2xl p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-[var(--color-brand)]">
                  {String(s.number).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-brand)]/40 to-transparent" />
                <Icon className="h-5 w-5 text-[var(--color-brand)]" aria-hidden />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{s.description}</p>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
