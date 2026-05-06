'use client';

import * as React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'newest';
export type ViewMode = 'grid' | 'list';

export interface SortBarValue {
  q: string;
  sort: SortKey;
  view: ViewMode;
}

interface Props {
  value: SortBarValue;
  onChange: (next: SortBarValue) => void;
}

export function SortBar({ value, onChange }: Props) {
  const [q, setQ] = React.useState(value.q);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange({ ...value, q });
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex flex-1 items-center gap-2 min-w-[200px]">
        <Input
          type="search"
          placeholder="Ürün ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Ürün arama"
        />
        <Button type="submit" size="sm">
          <Search className="h-4 w-4" />
          Ara
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-[var(--color-text-muted)]">Sıralama</label>
        <select
          id="sort"
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value as SortKey })}
          className="h-9 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        >
          <option value="recommended">Önerilen</option>
          <option value="price_asc">Fiyat (artan)</option>
          <option value="price_desc">Fiyat (azalan)</option>
          <option value="newest">Yeni eklenen</option>
        </select>
      </div>

      <div className="flex gap-1" role="group" aria-label="Görünüm">
        <Button
          type="button"
          variant={value.view === 'grid' ? 'primary' : 'icon'}
          size="icon"
          aria-label="Izgara görünüm"
          aria-pressed={value.view === 'grid'}
          onClick={() => onChange({ ...value, view: 'grid' })}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={value.view === 'list' ? 'primary' : 'icon'}
          size="icon"
          aria-label="Liste görünüm"
          aria-pressed={value.view === 'list'}
          onClick={() => onChange({ ...value, view: 'list' })}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
