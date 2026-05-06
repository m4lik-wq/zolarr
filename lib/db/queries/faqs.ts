import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { mapFaqRow } from './faqs-helpers';
import type { Faq } from '../types';

export async function listFaqs(): Promise<Faq[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('category')
    .order('sort_order');
  if (error || !data) return [];
  return data.map(mapFaqRow);
}
