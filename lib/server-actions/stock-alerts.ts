'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser, getCurrentProfile } from '@/lib/auth/server';

export async function subscribeStockAlertAction(
  productId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: 'Profil bulunamadı.' };
  const supabase = await createClient();
  const { error } = await supabase.from('stock_alerts').upsert({
    user_id: profile.id,
    product_id: productId,
    email: profile.email,
    notified: false,
  });
  if (error) return { ok: false, error: 'Kaydedilemedi.' };
  revalidatePath('/hesap/bildirimler');
  return { ok: true };
}

export async function unsubscribeStockAlertAction(
  productId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from('stock_alerts')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);
  if (error) return { ok: false, error: 'Silinemedi.' };
  revalidatePath('/hesap/bildirimler');
  return { ok: true };
}
