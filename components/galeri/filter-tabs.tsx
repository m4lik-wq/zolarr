'use client';

import { cn } from '@/lib/utils';
import type { ProjectTypeFilter } from '@/lib/db/queries/projects-helpers';

const TABS: { value: ProjectTypeFilter; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'konut', label: 'Konut' },
  { value: 'ticari', label: 'Ticari' },
  { value: 'tarim', label: 'Tarımsal' },
];

interface Props {
  value: ProjectTypeFilter;
  onChange: (v: ProjectTypeFilter) => void;
}

export function FilterTabs({ value, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Proje tipi filtresi" className="flex flex-wrap gap-2">
      {TABS.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm transition-colors',
            value === t.value
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-bg-base)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
