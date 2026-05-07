import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { mapFaqRow } from '@/lib/db/queries/faqs-helpers';
import type { Faq } from '@/lib/db/types';

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: Faq['category'];
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function listAdminFaqs(): Promise<Faq[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('faqs')
    .select('*')
    .order('category')
    .order('sort_order');
  if (error || !data) return [];
  return (data as FaqRow[]).map(mapFaqRow);
}

export async function getAdminFaq(id: string): Promise<Faq | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('faqs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapFaqRow(data as FaqRow);
}
