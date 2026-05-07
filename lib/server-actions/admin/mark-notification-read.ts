'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

export type MarkNotificationResult = { ok: true } | { ok: false; error: string };

export async function markNotificationReadAction(id: string): Promise<MarkNotificationResult> {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) {
    console.error('[admin] markNotificationReadAction failed', { id, error });
    return { ok: false, error: 'Bildirim güncellenemedi.' };
  }
  revalidatePath('/admin');
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<MarkNotificationResult> {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('notifications').update({ is_read: true }).eq('is_read', false);
  if (error) {
    console.error('[admin] markAllNotificationsReadAction failed', { error });
    return { ok: false, error: 'Bildirimler güncellenemedi.' };
  }
  revalidatePath('/admin');
  return { ok: true };
}
