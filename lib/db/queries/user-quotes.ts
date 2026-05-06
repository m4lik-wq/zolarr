import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/server';
import type { UserQuote } from '@/lib/db/types';

export async function listUserQuotes(): Promise<UserQuote[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quotes')
    .select('id,quote_number,city,installation_location,status,estimated_kwp,estimated_savings_try,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    quoteNumber: r.quote_number,
    city: r.city,
    installationLocation: r.installation_location,
    status: r.status,
    estimatedKwp: r.estimated_kwp !== null ? Number(r.estimated_kwp) : null,
    estimatedSavingsTry: r.estimated_savings_try !== null ? Number(r.estimated_savings_try) : null,
    createdAt: r.created_at,
  }));
}
