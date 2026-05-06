import { describe, it, expect } from 'vitest';
import {
  normalizeProductFilters,
  type RawFilters,
} from '@/lib/db/queries/products-helpers';

describe('normalizeProductFilters', () => {
  it('parses price range, tags, sort, and page', () => {
    const raw: RawFilters = {
      q: 'panel',
      minPrice: '100',
      maxPrice: '5000',
      tags: 'kargo_bedava,premium',
      sort: 'price_asc',
      page: '2',
      inStock: '1',
      categorySlug: 'mono',
    };
    const out = normalizeProductFilters(raw);
    expect(out.q).toBe('panel');
    expect(out.minPrice).toBe(100);
    expect(out.maxPrice).toBe(5000);
    expect(out.tags).toEqual(['kargo_bedava', 'premium']);
    expect(out.sort).toBe('price_asc');
    expect(out.page).toBe(2);
    expect(out.inStock).toBe(true);
    expect(out.categorySlug).toBe('mono');
  });

  it('falls back to defaults', () => {
    const out = normalizeProductFilters({});
    expect(out.q).toBe('');
    expect(out.minPrice).toBeNull();
    expect(out.maxPrice).toBeNull();
    expect(out.tags).toEqual([]);
    expect(out.sort).toBe('recommended');
    expect(out.page).toBe(1);
    expect(out.inStock).toBe(false);
  });
});
