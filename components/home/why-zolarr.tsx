import { ShieldCheck, Zap, Wrench, Leaf, Phone, BadgePercent } from 'lucide-react';
import { BENEFITS_MOCK } from '@/lib/data/benefits-mock';

const ICONS = {
  'shield-check': ShieldCheck,
  zap: Zap,
  wrench: Wrench,
  leaf: Leaf,
  phone: Phone,
  'badge-percent': BadgePercent,
} as const;

export function WhyZolarr() {
  return (
    <section className="border-t border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 py-16" aria-labelledby="why-heading">
      <div className="container mx-auto px-4">
        <h2 id="why-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">Neden Zolarr?</h2>
        <p className="mb-10 max-w-2xl text-[var(--color-text-muted)]">
          Sade bir teklifin ardındaki 6 nedenle başlayın.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS_MOCK.map((b) => {
            const Icon = ICONS[b.iconName];
            return (
              <article key={b.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-base)] p-6 transition-colors hover:border-[var(--color-brand)]/40">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 font-display text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{b.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
