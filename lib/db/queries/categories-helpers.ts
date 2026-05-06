import type { Category, CategoryNode } from '@/lib/db/types';

export function buildCategoryTree(flat: Category[]): CategoryNode[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of flat) {
    const list = byParent.get(c.parent_id) ?? [];
    list.push(c);
    byParent.set(c.parent_id, list);
  }
  function build(parentId: string | null): CategoryNode[] {
    const items = byParent.get(parentId) ?? [];
    return items
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ ...c, children: build(c.id) }));
  }
  return build(null);
}
