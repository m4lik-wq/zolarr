'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/server';

export async function toggleFavoriteAction(
  productId: string
): Promise<{ ok: true; favorited: boolean }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
    revalidatePath('/hesap/favoriler');
    return { ok: true, favorited: false };
  } else {
    await supabase
      .from('favorites')
      .insert({ user_id: user.id, product_id: productId });
    revalidatePath('/hesap/favoriler');
    return { ok: true, favorited: true };
  }
}
