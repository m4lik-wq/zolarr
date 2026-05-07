import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Category } from '@/lib/db/types';

export async function listAdminCategories(): Promise<Category[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('categories').select('*').order('sort_order');
  if (error || !data) return [];
  return data as Category[];
}

export async function getAdminCategory(id: string): Promise<Category | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from('categories').select('*').eq('id', id).maybeSingle();
  return (data as Category | null) ?? null;
}
