'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TAG_OPTIONS: { key: string; label: string }[] = [
  { key: 'kargo_bedava', label: 'Kargo Bedava' },
  { key: 'tercih_edilen', label: 'Tercih Edilen' },
  { key: 'cok_satan', label: 'Çok Satan' },
  { key: 'premium', label: 'Premium' },
  { key: 'yeni', label: 'Yeni' },
  { key: 'kampanyada', label: 'Kampanyada' },
];

export interface FilterValue {
  minPrice: string;
  maxPrice: string;
  tags: string[];
  inStock: boolean;
}

interface Props {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
}

export function FilterPanel({ value, onChange }: Props) {
  const [local, setLocal] = React.useState<FilterValue>(value);
  React.useEffect(() => setLocal(value), [value]);

  function toggleTag(key: string) {
    setLocal((p) => ({
      ...p,
      tags: p.tags.includes(key) ? p.tags.filter((t) => t !== key) : [...p.tags, key],
    }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(local);
      }}
      className="space-y-6"
      aria-label="Ürün filtreleri"
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Fiyat Aralığı (TL)</legend>
        <div className="flex gap-2">
          <Input
            id="minPrice"
            inputMode="numeric"
            placeholder="Min"
            aria-label="Min fiyat"
            value={local.minPrice}
            onChange={(e) => setLocal((p) => ({ ...p, minPrice: e.target.value }))}
          />
          <Input
            id="maxPrice"
            inputMode="numeric"
            placeholder="Max"
            aria-label="Max fiyat"
            value={local.maxPrice}
            onChange={(e) => setLocal((p) => ({ ...p, maxPrice: e.target.value }))}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Etiketler</legend>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleTag(t.key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                local.tags.includes(t.key)
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/50'
              )}
              aria-pressed={local.tags.includes(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={local.inStock}
          onChange={(e) => setLocal((p) => ({ ...p, inStock: e.target.checked }))}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        Sadece stoktakiler
      </label>

      <Button type="submit" className="w-full">Filtreyi uygula</Button>
    </form>
  );
}
