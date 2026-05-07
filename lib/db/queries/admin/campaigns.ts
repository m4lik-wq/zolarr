import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Campaign } from '@/lib/db/types';

function mapCampaign(r: Record<string, unknown>): Campaign {
  return {
    id: r.id as string,
    title: r.title as string,
    subtitle: (r.subtitle as string | null) ?? null,
    ctaLabel: (r.cta_label as string | null) ?? null,
    ctaHref: (r.cta_href as string | null) ?? null,
    bgImageUrl: (r.bg_image_url as string | null) ?? null,
    startsAt: (r.starts_at as string | null) ?? null,
    endsAt: (r.ends_at as string | null) ?? null,
    isActive: r.is_active as boolean,
    sortOrder: r.sort_order as number,
    createdAt: r.created_at as string,
  };
}

export async function listAdminCampaigns(): Promise<Campaign[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb
    .from('campaigns')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapCampaign);
}

export async function getAdminCampaign(id: string): Promise<Campaign | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from('campaigns').select('*').eq('id', id).maybeSingle();
  return data ? mapCampaign(data as Record<string, unknown>) : null;
}
