import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminDealer } from '@/lib/db/types';

export async function listAdminDealers(filter?: {
  status?: AdminDealer['status'];
}): Promise<AdminDealer[]> {
  await requireAdmin();
  const sb = createAdminClient();
  let q = sb.from('dealer_applications').select('*').order('created_at', { ascending: false });
  if (filter?.status) q = q.eq('status', filter.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map(mapDealerRow);
}

export async function getAdminDealer(id: string): Promise<AdminDealer | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('dealer_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapDealerRow(data as Record<string, unknown>);
}

function mapDealerRow(r: Record<string, unknown>): AdminDealer {
  return {
    id: r.id as string,
    applicationNumber: r.application_number as string,
    companyName: r.company_name as string,
    contactName: r.contact_name as string,
    contactEmail: r.contact_email as string,
    contactPhone: r.contact_phone as string,
    serviceCategories: Array.isArray(r.service_categories) ? (r.service_categories as string[]) : [],
    serviceAreas: Array.isArray(r.service_areas) ? (r.service_areas as string[]) : [],
    experienceYears:
      r.experience_years !== null && r.experience_years !== undefined
        ? Number(r.experience_years)
        : null,
    status: r.status as AdminDealer['status'],
    adminNotes: (r.admin_notes as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}
