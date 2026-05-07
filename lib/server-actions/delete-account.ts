'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const confirm = formData.get('confirm');
  if (confirm !== 'HESABIMI SİL') {
    redirect('/hesap/kvkk/sil?error=onay');
  }
  const sb = createAdminClient();
  // 1) Anonymize quote rows so admin can still see history but no PII linkage
  await sb.from('quotes').update({ user_id: null }).eq('user_id', user.id);
  // 2) Delete auth user (FK ON DELETE CASCADE handles profiles + addresses + favorites + stock_alerts)
  const { error } = await sb.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('[kvkk] deleteAccountAction failed', { userId: user.id, error });
    redirect('/hesap/kvkk/sil?error=silme');
  }
  redirect('/?hesap-silindi=1');
}
