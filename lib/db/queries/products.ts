import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/db/types';
import {
  normalizeProductFilters,
  PAGE_SIZE,
  type ProductFilters,
  type RawFilters,
  type SortKey,
} from '@/lib/db/queries/products-helpers';

export { normalizeProductFilters, PAGE_SIZE };
export type { ProductFilters, RawFilters, SortKey };

export async function getProducts(
  filters: ProductFilters
): Promise<{ items: Product[]; total: number }> {
  const supabase = await createClient();
  let q = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);

  if (filters.q) q = q.ilike('name', `%${filters.q}%`);
  if (filters.minPrice != null) q = q.gte('price', filters.minPrice);
  if (filters.maxPrice != null) q = q.lte('price', filters.maxPrice);
  if (filters.inStock) q = q.gt('stock', 0);
  if (filters.tags.length > 0) q = q.contains('tags', filters.tags);
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .single();
    if (cat) q = q.eq('category_id', cat.id);
  }

  switch (filters.sort) {
    case 'price_asc':
      q = q.order('price', { ascending: true });
      break;
    case 'price_desc':
      q = q.order('price', { ascending: false });
      break;
    case 'newest':
      q = q.order('created_at', { ascending: false });
      break;
    default:
      q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  q = q.range(from, from + PAGE_SIZE - 1);
  const { data, count, error } = await q;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as Product[], total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as Product | null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeSlug: string,
  limit = 4
): Promise<Product[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('slug', excludeSlug)
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}
