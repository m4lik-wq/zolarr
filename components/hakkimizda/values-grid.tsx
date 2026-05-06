import { VALUES_MOCK } from '@/lib/data/values-mock';

export function ValuesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {VALUES_MOCK.map((v) => (
        <div key={v.title} className="glass rounded-2xl p-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <v.icon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{v.description}</p>
        </div>
      ))}
    </div>
  );
}
