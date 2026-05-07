'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
const ADMIN_NOTES_MAX = 2000;

export type UpdateQuoteResult = { ok: true } | { ok: false; error: string };

export async function updateQuoteAction(input: {
  id: string;
  status?: (typeof STATUSES)[number];
  adminNotes?: string;
  responded?: boolean;
}): Promise<UpdateQuoteResult> {
  await requireAdmin();
  if (typeof input.adminNotes === 'string' && input.adminNotes.length > ADMIN_NOTES_MAX) {
    return { ok: false, error: `Admin notu en fazla ${ADMIN_NOTES_MAX} karakter olabilir.` };
  }
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  if (typeof input.responded === 'boolean') {
    patch.responded = input.responded;
    patch.responded_at = input.responded ? new Date().toISOString() : null;
  }
  const { error } = await sb.from('quotes').update(patch).eq('id', input.id);
  if (error) {
    console.error('[admin] updateQuoteAction failed', { id: input.id, error });
    return { ok: false, error: 'Kayıt güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath(`/admin/teklifler/${input.id}`);
  revalidatePath('/admin/teklifler');
  revalidatePath('/admin');
  return { ok: true };
}
