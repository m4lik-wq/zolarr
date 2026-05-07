'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { adminCategorySchema } from '@/lib/validation/admin-category-schema';

function toRow(d: ReturnType<typeof adminCategorySchema.parse>) {
  return {
    slug: d.slug,
    name: d.name,
    description: d.description || null,
    parent_id: d.parentId || null,
    icon: d.icon || null,
    sort_order: d.sortOrder,
  };
}

export type CategoryActionResult = { ok: true } | { ok: false; error: string };

export async function createCategoryAction(input: unknown): Promise<CategoryActionResult> {
  await requireAdmin();
  const r = adminCategorySchema.safeParse(input);
  if (!r.success) {
    return { ok: false, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('categories')
    .insert(toRow(r.data))
    .select('id')
    .single();
  if (error) {
    console.error('[admin] createCategoryAction failed', { error });
    return { ok: false, error: 'Kategori oluşturulamadı, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/kategoriler');
  redirect(`/admin/kategoriler/${(data as { id: string }).id}`);
}

export async function updateCategoryAction(
  id: string,
  input: unknown
): Promise<CategoryActionResult> {
  await requireAdmin();
  const r = adminCategorySchema.safeParse(input);
  if (!r.success) {
    return { ok: false, error: r.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { error } = await sb.from('categories').update(toRow(r.data)).eq('id', id);
  if (error) {
    console.error('[admin] updateCategoryAction failed', { id, error });
    return { ok: false, error: 'Kategori güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/kategoriler');
  revalidatePath(`/admin/kategoriler/${id}`);
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) console.error('[admin] deleteCategoryAction failed', { id, error });
  revalidatePath('/admin/kategoriler');
  redirect('/admin/kategoriler');
}
