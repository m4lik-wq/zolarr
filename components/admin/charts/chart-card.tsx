interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: Props) {
  return (
    <section className="glass rounded-2xl p-6">
      <header className="mb-4">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
      </header>
      <div className="h-64">{children}</div>
    </section>
  );
}
