'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'reviewing', 'approved', 'rejected'] as const;
const ADMIN_NOTES_MAX = 2000;

export type UpdateDealerResult = { ok: true } | { ok: false; error: string };

export async function updateDealerAction(input: {
  id: string;
  status?: (typeof STATUSES)[number];
  adminNotes?: string;
}): Promise<UpdateDealerResult> {
  await requireAdmin();
  if (typeof input.adminNotes === 'string' && input.adminNotes.length > ADMIN_NOTES_MAX) {
    return { ok: false, error: `Admin notu en fazla ${ADMIN_NOTES_MAX} karakter olabilir.` };
  }
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  const { error } = await sb.from('dealer_applications').update(patch).eq('id', input.id);
  if (error) {
    console.error('[admin] updateDealerAction failed', { id: input.id, error });
    return { ok: false, error: 'Kayıt güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath(`/admin/bayiler/${input.id}`);
  revalidatePath('/admin/bayiler');
  revalidatePath('/admin');
  return { ok: true };
}
