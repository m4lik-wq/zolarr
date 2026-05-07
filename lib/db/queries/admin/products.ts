import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Product } from '@/lib/db/types';

export async function listAdminProducts(): Promise<Product[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Product[];
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as Product;
}
