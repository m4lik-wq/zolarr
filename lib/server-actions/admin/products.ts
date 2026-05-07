'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { adminProductSchema } from '@/lib/validation/admin-product-schema';
import { sendEmail } from '@/lib/email/send';
import { stockAlertEmail } from '@/lib/email/templates/stock-alert';
import { canReceive } from '@/lib/email/preferences';
import type { EmailPreferences } from '@/lib/db/types';

function toRow(d: ReturnType<typeof adminProductSchema.parse>) {
  return {
    slug: d.slug,
    name: d.name,
    short_description: d.shortDescription || null,
    description: d.description || null,
    category_id: d.categoryId || null,
    brand: d.brand || null,
    sku: d.sku || null,
    price: d.price,
    discount_price: d.discountPrice ?? null,
    stock: d.stock,
    track_stock: d.trackStock,
    is_active: d.isActive,
    is_featured: d.isFeatured,
    images: d.images,
    videos: d.videos,
    pdfs: d.pdfs,
    tags: d.tags,
    warranty_years: d.warrantyYears ?? null,
  };
}

export type ProductActionResult = { ok: true } | { ok: false; error: string };

export async function createProductAction(input: unknown): Promise<ProductActionResult> {
  await requireAdmin();
  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('products')
    .insert(toRow(parsed.data))
    .select('id')
    .single();
  if (error) {
    console.error('[admin] createProductAction failed', { error });
    return { ok: false, error: 'Ürün oluşturulamadı, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/urunler');
  redirect(`/admin/urunler/${(data as { id: string }).id}`);
}

export async function updateProductAction(
  id: string,
  input: unknown
): Promise<ProductActionResult> {
  await requireAdmin();
  const parsed = adminProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const sb = createAdminClient();
  const { data: existing } = await sb
    .from('products')
    .select('stock,name,slug')
    .eq('id', id)
    .maybeSingle();
  const existingProduct = existing as { stock: number; name: string; slug: string } | null;
  const oldStock = existingProduct?.stock ?? 0;
  const { error } = await sb.from('products').update(toRow(parsed.data)).eq('id', id);
  if (error) {
    console.error('[admin] updateProductAction failed', { id, error });
    return { ok: false, error: 'Ürün güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath('/admin/urunler');
  revalidatePath(`/admin/urunler/${id}`);

  if (existingProduct && oldStock === 0 && parsed.data.stock > 0) {
    const { data: alerts } = await sb
      .from('stock_alerts')
      .select('id,user_id,email')
      .eq('product_id', id)
      .eq('notified', false);
    const alertList = (alerts as Array<{ id: string; user_id: string; email: string }> | null) ?? [];
    if (alertList.length > 0) {
      const userIds = alertList.map((a) => a.user_id);
      const { data: profiles } = await sb
        .from('profiles')
        .select('id,name,email_preferences')
        .in('id', userIds);
      const profileList =
        (profiles as Array<{
          id: string;
          name: string | null;
          email_preferences: EmailPreferences | null;
        }> | null) ?? [];
      const profileMap = new Map(profileList.map((p) => [p.id, p]));
      await Promise.allSettled(
        alertList.map((alert) => {
          const profile = profileMap.get(alert.user_id);
          const prefs = profile?.email_preferences ?? null;
          if (!canReceive(prefs, 'stock_alerts')) return Promise.resolve();
          return sendEmail({
            to: alert.email,
            ...stockAlertEmail({
              productName: existingProduct.name,
              productSlug: existingProduct.slug,
              userName: profile?.name ?? null,
            }),
          });
        })
      );
      await sb
        .from('stock_alerts')
        .update({ notified: true, notified_at: new Date().toISOString() })
        .in(
          'id',
          alertList.map((a) => a.id)
        );
    }
  }

  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) {
    console.error('[admin] deleteProductAction failed', { id, error });
  }
  revalidatePath('/admin/urunler');
  redirect('/admin/urunler');
}
