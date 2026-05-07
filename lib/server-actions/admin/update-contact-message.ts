'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export type UpdateContactMessageResult = { ok: true } | { ok: false; error: string };

export async function updateContactMessageAction(input: {
  id: string;
  status?: (typeof STATUSES)[number];
}): Promise<UpdateContactMessageResult> {
  await requireAdmin();
  const sb = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  const { error } = await sb.from('contact_messages').update(patch).eq('id', input.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/iletisim/${input.id}`);
  revalidatePath('/admin/iletisim');
  revalidatePath('/admin');
  return { ok: true };
}
