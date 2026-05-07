'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;

export type UpdateQuoteResult = { ok: true } | { ok: false; error: string };

export async function updateQuoteAction(input: {
  id: string;
  status?: (typeof STATUSES)[number];
  adminNotes?: string;
  responded?: boolean;
}): Promise<UpdateQuoteResult> {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  if (typeof input.responded === 'boolean') {
    patch.responded = input.responded;
    if (input.responded) patch.responded_at = new Date().toISOString();
  }
  const { error } = await sb.from('quotes').update(patch).eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/teklifler/${input.id}`);
  revalidatePath('/admin/teklifler');
  revalidatePath('/admin');
  return { ok: true };
}
