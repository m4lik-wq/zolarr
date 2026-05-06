export type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'newest';

export interface RawFilters {
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  tags?: string;
  sort?: string;
  page?: string;
  inStock?: string;
  categorySlug?: string;
}

export interface ProductFilters {
  q: string;
  minPrice: number | null;
  maxPrice: number | null;
  tags: string[];
  sort: SortKey;
  page: number;
  inStock: boolean;
  categorySlug: string | null;
}

export const PAGE_SIZE = 12;

export function normalizeProductFilters(raw: RawFilters): ProductFilters {
  const sortKeys: SortKey[] = ['recommended', 'price_asc', 'price_desc', 'newest'];
  return {
    q: raw.q?.trim() ?? '',
    minPrice: raw.minPrice ? Number(raw.minPrice) : null,
    maxPrice: raw.maxPrice ? Number(raw.maxPrice) : null,
    tags: raw.tags ? raw.tags.split(',').filter(Boolean) : [],
    sort: sortKeys.includes(raw.sort as SortKey) ? (raw.sort as SortKey) : 'recommended',
    page: raw.page ? Math.max(1, parseInt(raw.page, 10) || 1) : 1,
    inStock: raw.inStock === '1' || raw.inStock === 'true',
    categorySlug: raw.categorySlug ?? null,
  };
}
