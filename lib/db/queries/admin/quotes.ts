import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { AdminQuote } from '@/lib/db/types';

export async function listAdminQuotes(filter?: { status?: AdminQuote['status'] }): Promise<AdminQuote[]> {
  await requireAdmin();
  const sb = createAdminClient();
  let q = sb.from('quotes').select('*').order('created_at', { ascending: false });
  if (filter?.status) q = q.eq('status', filter.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map(mapQuoteRow);
}

export async function getAdminQuote(id: string): Promise<AdminQuote | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb.from('quotes').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapQuoteRow(data as Record<string, unknown>);
}

function mapQuoteRow(r: Record<string, unknown>): AdminQuote {
  return {
    id: r.id as string,
    quoteNumber: r.quote_number as string,
    contactName: r.contact_name as string,
    contactPhone: r.contact_phone as string,
    contactEmail: r.contact_email as string,
    city: r.city as string,
    district: (r.district as string | null) ?? null,
    installationLocation: r.installation_location as string,
    description: (r.description as string | null) ?? null,
    status: r.status as AdminQuote['status'],
    estimatedKwp: r.estimated_kwp !== null && r.estimated_kwp !== undefined ? Number(r.estimated_kwp) : null,
    estimatedSavingsTry:
      r.estimated_savings_try !== null && r.estimated_savings_try !== undefined ? Number(r.estimated_savings_try) : null,
    estimatedPaybackYears:
      r.estimated_payback_years !== null && r.estimated_payback_years !== undefined
        ? Number(r.estimated_payback_years)
        : null,
    adminNotes: (r.admin_notes as string | null) ?? null,
    responded: Boolean(r.responded),
    respondedAt: (r.responded_at as string | null) ?? null,
    createdAt: r.created_at as string,
    appliances: Array.isArray(r.appliances) ? (r.appliances as AdminQuote['appliances']) : [],
  };
}
