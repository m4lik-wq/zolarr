import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Category, CategoryNode } from '@/lib/db/types';
import { buildCategoryTree } from '@/lib/db/queries/categories-helpers';

export { buildCategoryTree };

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const flat = await getAllCategories();
  return buildCategoryTree(flat);
}
