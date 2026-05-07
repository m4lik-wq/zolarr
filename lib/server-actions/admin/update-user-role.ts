'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

const ROLES = ['customer', 'moderator', 'assistant', 'admin'] as const;

export type UpdateUserRoleResult = { ok: true } | { ok: false; error: string };

export async function updateUserRoleAction(input: {
  id: string;
  role: (typeof ROLES)[number];
}): Promise<UpdateUserRoleResult> {
  const requester = await requireAdmin();
  if (!ROLES.includes(input.role)) return { ok: false, error: 'Geçersiz rol' };
  if (input.id === requester.id && input.role !== 'admin') {
    return { ok: false, error: 'Kendi admin rolünüzü kaldıramazsınız.' };
  }
  const sb = createAdminClient();
  const { error } = await sb.from('profiles').update({ role: input.role }).eq('id', input.id);
  if (error) {
    console.error('[admin] updateUserRoleAction failed', { id: input.id, error });
    return { ok: false, error: 'Rol güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/kullanicilar');
  revalidatePath('/admin');
  return { ok: true };
}
