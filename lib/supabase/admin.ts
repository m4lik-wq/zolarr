import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Service-role admin client. Typed as a generic SupabaseClient so that
// arbitrary tables (quotes, dealer_applications, contact_messages, ...) can be
// selected/updated without each one being declared in lib/db/types.ts.
let cachedAdmin: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin env eksik');
  cachedAdmin = createClient(url, key, { auth: { persistSession: false } });
  return cachedAdmin;
}
