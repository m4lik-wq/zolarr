'use server';

import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe';
import type { EmailPreferences } from '@/lib/db/types';

export type UnsubscribeResult =
  | { ok: true; category: string }
  | { ok: false; error: string };

export async function unsubscribeViaTokenAction(token: string): Promise<UnsubscribeResult> {
  if (!token) return { ok: false, error: 'Bağlantı eksik.' };
  const sb = createAdminClient();
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');
    if (parts.length !== 3) return { ok: false, error: 'Geçersiz bağlantı.' };
    const userId = parts[0];
    if (!userId) return { ok: false, error: 'Geçersiz bağlantı.' };
    const { data: profile } = await sb
      .from('profiles')
      .select('unsubscribe_secret,email_preferences')
      .eq('id', userId)
      .maybeSingle();
    if (!profile) return { ok: false, error: 'Kullanıcı bulunamadı.' };
    const p = profile as { unsubscribe_secret: string; email_preferences: EmailPreferences | null };
    const verified = verifyUnsubscribeToken(token, p.unsubscribe_secret);
    if (!verified.ok) return { ok: false, error: 'Bağlantı geçersiz veya süresi dolmuş.' };
    const currentPrefs: EmailPreferences = p.email_preferences ?? {
      marketing: true,
      stock_alerts: true,
      quote_status: true,
      dealer_status: true,
    };
    const newPrefs = { ...currentPrefs, [verified.category]: false };
    const { error } = await sb
      .from('profiles')
      .update({ email_preferences: newPrefs })
      .eq('id', verified.userId);
    if (error) {
      console.error('[unsubscribe] update failed', { userId: verified.userId, error });
      return { ok: false, error: 'İşlem başarısız.' };
    }
    return { ok: true, category: verified.category };
  } catch {
    return { ok: false, error: 'Geçersiz bağlantı.' };
  }
}
