'use client';

import { motion } from 'framer-motion';
import { Search, Layers, Wrench, Zap } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: Search,
    title: 'Keşif',
    desc: 'Çatınızı ve elektrik faturanızı inceleriz. Tüm analiz ücretsiz.',
  },
  {
    num: '02',
    icon: Layers,
    title: 'Tasarım',
    desc: 'Mühendislerimiz size özel sistem ve maliyet planı hazırlar.',
  },
  {
    num: '03',
    icon: Wrench,
    title: 'Kurulum',
    desc: 'TSE sertifikalı ekibimiz 1-2 günde panelleri çatınıza kurar.',
  },
  {
    num: '04',
    icon: Zap,
    title: 'İşletim',
    desc: 'Sistem aktif. Üretilen elektrik faturanızı %90 azaltır.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16 md:mb-24"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-gold)] font-mono mb-4">
            ── Süreç
          </p>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.1] tracking-tight">
            Çatınızdaki sistem,{' '}
            <span className="italic text-[var(--color-brand)]">dört adımda</span>{' '}
            hayata geçer.
          </h2>
        </motion.div>

        {/* Steps grid with connecting line */}
        <div className="relative">
          {/* Horizontal connector line on desktop */}
          <div
            className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-warm-gold)]/40 to-transparent"
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  {/* Big number */}
                  <div className="font-display text-7xl md:text-8xl text-[var(--color-warm-gold)]/20 leading-none mb-2 select-none">
                    {step.num}
                  </div>
                  {/* Icon circle */}
                  <div className="absolute top-2 left-0 w-12 h-12 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shadow-sm">
                    <Icon className="h-5 w-5 text-[var(--color-brand)]" />
                  </div>
                  {/* Content */}
                  <div className="mt-4">
                    <h3 className="font-display text-2xl md:text-3xl mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
