'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/server';
import { syncSupplier } from '@/lib/suppliers/sync';

export type SyncSupplierResult =
  | { ok: true; alerts: number; updated: number; errors: number; total: number }
  | { ok: false; error: string };

export async function syncSupplierAction(supplierId: string): Promise<SyncSupplierResult> {
  await requireAdmin();
  try {
    const result = await syncSupplier(supplierId);
    revalidatePath('/admin/tedarikciler');
    revalidatePath(`/admin/tedarikciler/${supplierId}`);
    return {
      ok: true,
      alerts: result.alerts,
      updated: result.updated,
      errors: result.errors,
      total: result.total,
    };
  } catch (e) {
    console.error('[admin] syncSupplierAction failed', { supplierId, error: e });
    return { ok: false, error: 'Sync sırasında bir hata oluştu.' };
  }
}
