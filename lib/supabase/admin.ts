import 'server-only';
import { createClient } from '@supabase/supabase-js';

let cachedAdmin: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin env eksik');
  cachedAdmin = createClient(url, key, { auth: { persistSession: false } });
  return cachedAdmin;
}
