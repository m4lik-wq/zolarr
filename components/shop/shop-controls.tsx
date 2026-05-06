'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SortBar, type SortBarValue, type SortKey } from './sort-bar';
import { FilterPanel, type FilterValue } from './filter-panel';
import { Pagination } from './pagination';

interface Props {
  totalCount: number;
  pageSize: number;
}

export function ShopControls({ totalCount, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortValue: SortBarValue = {
    q: searchParams.get('q') ?? '',
    sort: (searchParams.get('sort') as SortKey) || 'recommended',
    view: (searchParams.get('view') as 'grid' | 'list') || 'grid',
  };

  const filterValue: FilterValue = {
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) ?? [],
    inStock: searchParams.get('inStock') === '1',
  };

  const page = Number(searchParams.get('page') ?? '1') || 1;

  function pushParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    });
    if (!('page' in patch)) next.delete('page');
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="space-y-6">
      <SortBar
        value={sortValue}
        onChange={(v) => pushParams({ q: v.q || null, sort: v.sort, view: v.view })}
      />
      <FilterPanel
        value={filterValue}
        onChange={(v) =>
          pushParams({
            minPrice: v.minPrice || null,
            maxPrice: v.maxPrice || null,
            tags: v.tags.length ? v.tags.join(',') : null,
            inStock: v.inStock ? '1' : null,
          })
        }
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onChange={(p) => pushParams({ page: String(p) })}
      />
    </div>
  );
}
