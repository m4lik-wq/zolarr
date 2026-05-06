import { describe, it, expect } from 'vitest';
import { buildCategoryTree } from '@/lib/db/queries/categories-helpers';
import type { Category } from '@/lib/db/types';

const flat: Category[] = [
  {
    id: '1',
    slug: 'paneller',
    name: 'Güneş Panelleri',
    description: null,
    parent_id: null,
    icon: null,
    sort_order: 1,
    created_at: '',
  },
  {
    id: '2',
    slug: 'mono',
    name: 'Monokristal',
    description: null,
    parent_id: '1',
    icon: null,
    sort_order: 1,
    created_at: '',
  },
  {
    id: '3',
    slug: 'poli',
    name: 'Polikristal',
    description: null,
    parent_id: '1',
    icon: null,
    sort_order: 2,
    created_at: '',
  },
  {
    id: '4',
    slug: 'bataryalar',
    name: 'Bataryalar',
    description: null,
    parent_id: null,
    icon: null,
    sort_order: 2,
    created_at: '',
  },
];

describe('buildCategoryTree', () => {
  it('groups children under parent and orders by sort_order', () => {
    const tree = buildCategoryTree(flat);
    expect(tree).toHaveLength(2);
    expect(tree[0]!.slug).toBe('paneller');
    expect(tree[0]!.children).toHaveLength(2);
    expect(tree[0]!.children[0]!.slug).toBe('mono');
    expect(tree[1]!.slug).toBe('bataryalar');
    expect(tree[1]!.children).toHaveLength(0);
  });
});
