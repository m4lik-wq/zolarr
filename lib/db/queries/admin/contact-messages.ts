import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminContactMessage } from '@/lib/db/types';

export async function listAdminContactMessages(filter?: {
  status?: AdminContactMessage['status'];
}): Promise<AdminContactMessage[]> {
  await requireAdmin();
  const sb = createAdminClient();
  let q = sb.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (filter?.status) q = q.eq('status', filter.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map(mapMessageRow);
}

export async function getAdminContactMessage(id: string): Promise<AdminContactMessage | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('contact_messages')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapMessageRow(data as Record<string, unknown>);
}

function mapMessageRow(r: Record<string, unknown>): AdminContactMessage {
  return {
    id: r.id as string,
    messageNumber: r.message_number as string,
    name: r.name as string,
    email: r.email as string,
    phone: (r.phone as string | null) ?? null,
    subject: (r.subject as string | null) ?? null,
    body: r.body as string,
    status: r.status as AdminContactMessage['status'],
    createdAt: r.created_at as string,
  };
}
