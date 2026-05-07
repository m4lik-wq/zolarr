import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminUser } from '@/lib/db/types';

export async function listAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('profiles')
    .select('id,email,name,phone,role,created_at')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    email: r.email as string,
    name: (r.name as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    role: r.role as AdminUser['role'],
    createdAt: r.created_at as string,
  }));
}
