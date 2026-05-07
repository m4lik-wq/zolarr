'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { adminFaqSchema } from '@/lib/validation/admin-faq-schema';

function toRow(d: ReturnType<typeof adminFaqSchema.parse>) {
  return {
    question: d.question,
    answer: d.answer,
    category: d.category,
    sort_order: d.sortOrder,
    is_published: d.isPublished,
  };
}

export type FaqActionResult = { ok: true } | { ok: false; error: string };

export async function createFaqAction(input: unknown): Promise<FaqActionResult> {
  await requireAdmin();
  const parsed = adminFaqSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('faqs')
    .insert(toRow(parsed.data))
    .select('id')
    .single();
  if (error) {
    console.error('[admin] createFaqAction failed', { error });
    return { ok: false, error: 'SSS oluşturulamadı, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/sss');
  revalidatePath('/sss');
  redirect(`/admin/sss/${(data as { id: string }).id}`);
}

export async function updateFaqAction(
  id: string,
  input: unknown
): Promise<FaqActionResult> {
  await requireAdmin();
  const parsed = adminFaqSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { error } = await sb.from('faqs').update(toRow(parsed.data)).eq('id', id);
  if (error) {
    console.error('[admin] updateFaqAction failed', { id, error });
    return { ok: false, error: 'SSS güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/sss');
  revalidatePath(`/admin/sss/${id}`);
  revalidatePath('/sss');
  return { ok: true };
}

export async function deleteFaqAction(id: string): Promise<void> {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('faqs').delete().eq('id', id);
  if (error) console.error('[admin] deleteFaqAction failed', { id, error });
  revalidatePath('/admin/sss');
  revalidatePath('/sss');
  redirect('/admin/sss');
}
