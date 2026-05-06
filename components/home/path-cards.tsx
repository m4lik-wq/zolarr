import Link from 'next/link';
import { Home, Building2, Sprout, ArrowRight } from 'lucide-react';
import { PATHS_MOCK } from '@/lib/data/paths-mock';

const ICONS = { home: Home, 'building-2': Building2, sprout: Sprout } as const;

export function PathCards() {
  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="paths-heading">
      <h2 id="paths-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">
        Hangi yoldan başlamak istersiniz?
      </h2>
      <p className="mb-10 max-w-2xl text-[var(--color-text-muted)]">
        İhtiyacınıza uygun teklif akışını seçin; sizi 24 saat içinde uzman bir mühendisle eşleştirelim.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {PATHS_MOCK.map((p) => {
          const Icon = ICONS[p.iconName];
          return (
            <Link
              key={p.slug}
              href={p.href}
              className="glass group flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40 hover:shadow-[var(--shadow-glow)]"
              aria-label={p.title}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mb-6 flex-1 text-sm text-[var(--color-text-muted)]">{p.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand)] transition-transform group-hover:translate-x-1">
                Devam et
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
