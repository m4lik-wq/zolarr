'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'reviewing', 'approved', 'rejected'] as const;

export type UpdateDealerResult = { ok: true } | { ok: false; error: string };

export async function updateDealerAction(input: {
  id: string;
  status?: (typeof STATUSES)[number];
  adminNotes?: string;
}): Promise<UpdateDealerResult> {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  const { error } = await sb.from('dealer_applications').update(patch).eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/bayiler/${input.id}`);
  revalidatePath('/admin/bayiler');
  revalidatePath('/admin');
  return { ok: true };
}
