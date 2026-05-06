import { describe, it, expect } from 'vitest';
import { mapProjectRow, filterProjectsByType, type ProjectRow } from '@/lib/db/queries/projects-helpers';

const row: ProjectRow = {
  id: 'a',
  slug: 'antalya-villa',
  title: 'Antalya Villa',
  type: 'konut',
  location: 'Antalya',
  capacity_kwp: '12',
  cover_image: '/x.svg',
  description: 'desc',
  before_image: null,
  after_image: null,
  gallery_images: [],
  product_slugs: [],
  customer_quote: null,
  customer_name: null,
  annual_savings_try: '38500',
  completion_date: '2024-08-15',
  is_published: true,
  sort_order: 10,
  created_at: '2024-01-01',
  updated_at: '2024-01-02',
};

describe('mapProjectRow', () => {
  it('converts capacity_kwp string to number', () => {
    expect(mapProjectRow(row).capacityKwp).toBe(12);
  });

  it('converts annual_savings_try string to number', () => {
    expect(mapProjectRow(row).annualSavingsTry).toBe(38500);
  });

  it('preserves slug, title, type', () => {
    const m = mapProjectRow(row);
    expect(m.slug).toBe('antalya-villa');
    expect(m.title).toBe('Antalya Villa');
    expect(m.type).toBe('konut');
  });

  it('coerces null annual_savings_try to null', () => {
    expect(mapProjectRow({ ...row, annual_savings_try: null }).annualSavingsTry).toBeNull();
  });
});

describe('filterProjectsByType', () => {
  const a = mapProjectRow(row);
  const b = mapProjectRow({ ...row, id: 'b', slug: 'x', type: 'ticari' });
  const c = mapProjectRow({ ...row, id: 'c', slug: 'y', type: 'tarim' });

  it('returns all when type is "all"', () => {
    expect(filterProjectsByType([a, b, c], 'all')).toHaveLength(3);
  });

  it('filters by single type', () => {
    expect(filterProjectsByType([a, b, c], 'konut')).toEqual([a]);
  });
});
