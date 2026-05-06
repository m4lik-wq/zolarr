import * as React from 'react';

export function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-6">
      <header>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}
