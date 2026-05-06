import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/db/types';

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}

export async function listUserFavorites(userId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('product:products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data
    .map((r) => (r as unknown as { product: Product | null }).product)
    .filter((p): p is Product => !!p);
}
