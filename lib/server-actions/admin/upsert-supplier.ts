'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { supplierSchema } from '@/lib/validation/supplier-schema';

export type UpsertSupplierResult = { ok: true; id: string } | { ok: false; error: string };

function toRow(d: ReturnType<typeof supplierSchema.parse>) {
  return {
    slug: d.slug,
    name: d.name,
    base_url: d.baseUrl || null,
    adapter_slug: d.adapterSlug,
    enabled: d.enabled,
  };
}

export async function createSupplierAction(input: unknown): Promise<UpsertSupplierResult> {
  await requireAdmin();
  const r = supplierSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('suppliers')
    .insert(toRow(r.data))
    .select('id')
    .single();
  if (error) {
    console.error('[admin] createSupplierAction failed', { error });
    return { ok: false, error: 'Tedarikçi oluşturulamadı, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/tedarikciler');
  redirect(`/admin/tedarikciler/${(data as { id: string }).id}`);
}

export async function updateSupplierAction(
  id: string,
  input: unknown,
): Promise<UpsertSupplierResult> {
  await requireAdmin();
  const r = supplierSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  const sb = createAdminClient();
  const { error } = await sb.from('suppliers').update(toRow(r.data)).eq('id', id);
  if (error) {
    console.error('[admin] updateSupplierAction failed', { id, error });
    return { ok: false, error: 'Güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/tedarikciler');
  revalidatePath(`/admin/tedarikciler/${id}`);
  return { ok: true, id };
}
