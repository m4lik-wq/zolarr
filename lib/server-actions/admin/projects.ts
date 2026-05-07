'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { adminProjectSchema } from '@/lib/validation/admin-project-schema';

function toRow(d: ReturnType<typeof adminProjectSchema.parse>) {
  return {
    slug: d.slug,
    title: d.title,
    type: d.type,
    location: d.location,
    capacity_kwp: d.capacityKwp,
    cover_image: d.coverImage,
    description: d.description || null,
    before_image: d.beforeImage || null,
    after_image: d.afterImage || null,
    gallery_images: d.galleryImages,
    product_slugs: d.productSlugs,
    customer_quote: d.customerQuote || null,
    customer_name: d.customerName || null,
    annual_savings_try: d.annualSavingsTry ?? null,
    completion_date: d.completionDate || null,
    is_published: d.isPublished,
    sort_order: d.sortOrder,
  };
}

export type ProjectActionResult = { ok: true } | { ok: false; error: string };

export async function createProjectAction(input: unknown): Promise<ProjectActionResult> {
  await requireAdmin();
  const parsed = adminProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('projects')
    .insert(toRow(parsed.data))
    .select('id')
    .single();
  if (error) {
    console.error('[admin] createProjectAction failed', { error });
    return { ok: false, error: 'Proje oluşturulamadı, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/projeler');
  revalidatePath('/galeri');
  redirect(`/admin/projeler/${(data as { id: string }).id}`);
}

export async function updateProjectAction(
  id: string,
  input: unknown
): Promise<ProjectActionResult> {
  await requireAdmin();
  const parsed = adminProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { error } = await sb.from('projects').update(toRow(parsed.data)).eq('id', id);
  if (error) {
    console.error('[admin] updateProjectAction failed', { id, error });
    return { ok: false, error: 'Proje güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/projeler');
  revalidatePath(`/admin/projeler/${id}`);
  revalidatePath('/galeri');
  return { ok: true };
}

export async function deleteProjectAction(id: string): Promise<void> {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('projects').delete().eq('id', id);
  if (error) console.error('[admin] deleteProjectAction failed', { id, error });
  revalidatePath('/admin/projeler');
  revalidatePath('/galeri');
  redirect('/admin/projeler');
}
