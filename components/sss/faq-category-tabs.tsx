'use client';

import type { Faq } from '@/lib/db/types';
import { cn } from '@/lib/utils';

const CATEGORY_LABEL: Record<Faq['category'] | 'all', string> = {
  all: 'Tümü',
  genel: 'Genel',
  teknik: 'Teknik',
  fiyat: 'Fiyat',
  kurulum: 'Kurulum',
  garanti: 'Garanti',
};

const ORDER: ('all' | Faq['category'])[] = ['all', 'genel', 'teknik', 'fiyat', 'kurulum', 'garanti'];

export type FaqFilter = 'all' | Faq['category'];

export function FaqCategoryTabs({ value, onChange }: { value: FaqFilter; onChange: (v: FaqFilter) => void }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {ORDER.map((c) => (
        <button
          key={c}
          role="tab"
          type="button"
          aria-selected={value === c}
          onClick={() => onChange(c)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm transition-colors',
            value === c
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-bg-base)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
          )}
        >
          {CATEGORY_LABEL[c]}
        </button>
      ))}
    </div>
  );
}
