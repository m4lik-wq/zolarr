'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { sendEmail } from '@/lib/email/send';
import { dealerStatusEmail } from '@/lib/email/templates/dealer-status';

const STATUSES = ['new', 'reviewing', 'approved', 'rejected'] as const;
const ADMIN_NOTES_MAX = 2000;

export type UpdateDealerResult = { ok: true } | { ok: false; error: string };

export async function updateDealerAction(input: {
  id: string;
  status?: (typeof STATUSES)[number];
  adminNotes?: string;
}): Promise<UpdateDealerResult> {
  await requireAdmin();
  if (typeof input.adminNotes === 'string' && input.adminNotes.length > ADMIN_NOTES_MAX) {
    return { ok: false, error: `Admin notu en fazla ${ADMIN_NOTES_MAX} karakter olabilir.` };
  }
  const sb = createAdminClient();
  const { data: existing } = await sb
    .from('dealer_applications')
    .select('status')
    .eq('id', input.id)
    .maybeSingle();
  const oldStatus = (existing as { status?: string } | null)?.status ?? null;
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  const { error } = await sb.from('dealer_applications').update(patch).eq('id', input.id);
  if (error) {
    console.error('[admin] updateDealerAction failed', { id: input.id, error });
    return { ok: false, error: 'Kayıt güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath(`/admin/bayiler/${input.id}`);
  revalidatePath('/admin/bayiler');
  revalidatePath('/admin');

  if (input.status && oldStatus && input.status !== oldStatus) {
    const { data: d } = await sb
      .from('dealer_applications')
      .select('application_number,contact_name,contact_email,company_name,status,admin_notes')
      .eq('id', input.id)
      .maybeSingle();
    if (d) {
      const dealer = d as {
        application_number: string;
        contact_name: string;
        contact_email: string;
        company_name: string;
        status: string;
        admin_notes: string | null;
      };
      await Promise.allSettled([
        sendEmail({
          to: dealer.contact_email,
          ...dealerStatusEmail({
            applicationNumber: dealer.application_number,
            contactName: dealer.contact_name,
            companyName: dealer.company_name,
            newStatus: dealer.status as never,
            adminNotes: dealer.admin_notes,
          }),
        }),
      ]);
    }
  }

  return { ok: true };
}
