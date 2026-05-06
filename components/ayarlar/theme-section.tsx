'use client';

import { useTheme } from 'next-themes';
import { SectionCard } from './section-card';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Aydınlık' },
  { value: 'dark', label: 'Karanlık' },
  { value: 'system', label: 'Sistem' },
];

export function ThemeSection() {
  const { theme, setTheme } = useTheme();
  return (
    <SectionCard title="Tema" description="Sayfayı aydınlık veya karanlık modda görüntüleyin.">
      <div className="flex gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              theme === o.value
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-bg-base)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
