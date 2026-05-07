import 'server-only';
import { createClient } from '@/lib/supabase/server';
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

export async function getActiveCampaign(): Promise<Campaign | null> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapCampaign(data as Record<string, unknown>);
}
