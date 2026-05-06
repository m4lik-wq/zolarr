import { CountUp } from '@/components/ui/count-up';
import { STATS_MOCK } from '@/lib/data/stats-mock';

export function StatsCounters() {
  return (
    <section className="container mx-auto px-4 py-16" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="mb-10 font-display text-3xl font-bold sm:text-4xl">
        Sayılarla Zolarr
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_MOCK.map((s) => (
          <li key={s.label} className="glass rounded-2xl p-6">
            <p className="font-mono text-4xl font-bold text-[var(--color-brand)]">
              <CountUp value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{s.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
