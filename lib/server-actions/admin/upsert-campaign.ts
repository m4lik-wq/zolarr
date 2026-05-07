'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { campaignSchema } from '@/lib/validation/campaign-schema';

export type UpsertCampaignResult = { ok: true; id: string } | { ok: false; error: string };
export type CampaignActionResult = { ok: true } | { ok: false; error: string };

function emptyToNull(v: string | null | undefined): string | null {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function toRow(d: ReturnType<typeof campaignSchema.parse>) {
  return {
    title: d.title,
    subtitle: emptyToNull(d.subtitle ?? null),
    cta_label: emptyToNull(d.ctaLabel ?? null),
    cta_href: emptyToNull(d.ctaHref ?? null),
    bg_image_url: emptyToNull(d.bgImageUrl ?? null),
    starts_at: emptyToNull(d.startsAt ?? null),
    ends_at: emptyToNull(d.endsAt ?? null),
    is_active: d.isActive,
    sort_order: d.sortOrder,
  };
}

export async function createCampaignAction(input: unknown): Promise<UpsertCampaignResult> {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form gecersiz' };
  }
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('campaigns')
    .insert(toRow(parsed.data))
    .select('id')
    .single();
  if (error) {
    console.error('[admin] createCampaignAction failed', { error });
    return { ok: false, error: 'Kampanya olusturulamadi, lutfen tekrar deneyin.' };
  }
  revalidatePath('/admin/kampanyalar');
  revalidatePath('/');
  redirect(`/admin/kampanyalar/${(data as { id: string }).id}`);
}

export async function updateCampaignAction(
  id: string,
  input: unknown
): Promise<CampaignActionResult> {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form gecersiz' };
  }
  const sb = createAdminClient();
  const { error } = await sb.from('campaigns').update(toRow(parsed.data)).eq('id', id);
  if (error) {
    console.error('[admin] updateCampaignAction failed', { id, error });
    return { ok: false, error: 'Kampanya guncellenemedi, lutfen tekrar deneyin.' };
  }
  revalidatePath('/admin/kampanyalar');
  revalidatePath(`/admin/kampanyalar/${id}`);
  revalidatePath('/');
  return { ok: true };
}

export async function deleteCampaignAction(id: string): Promise<void> {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb.from('campaigns').delete().eq('id', id);
  if (error) console.error('[admin] deleteCampaignAction failed', { id, error });
  revalidatePath('/admin/kampanyalar');
  revalidatePath('/');
  redirect('/admin/kampanyalar');
}
