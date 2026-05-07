'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/server';
import { emailPreferencesSchema } from '@/lib/validation/email-preferences-schema';

export type UpdateEmailPrefsResult = { ok: true } | { ok: false; error: string };

export async function updateEmailPreferencesAction(input: unknown): Promise<UpdateEmailPrefsResult> {
  const user = await requireUser();
  const r = emailPreferencesSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'Geçersiz tercih' };
  const sb = await createClient();
  const { error } = await sb.from('profiles').update({ email_preferences: r.data }).eq('id', user.id);
  if (error) {
    console.error('[email-prefs] update failed', { userId: user.id, error });
    return { ok: false, error: 'Tercihler güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath('/ayarlar/eposta');
  revalidatePath('/ayarlar');
  return { ok: true };
}
