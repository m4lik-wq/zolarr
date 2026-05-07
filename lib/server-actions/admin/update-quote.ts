'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { sendEmail } from '@/lib/email/send';
import { quoteStatusEmail } from '@/lib/email/templates/quote-status';
import { canReceive } from '@/lib/email/preferences';
import type { EmailPreferences } from '@/lib/db/types';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
const ADMIN_NOTES_MAX = 2000;

export type UpdateQuoteResult = { ok: true } | { ok: false; error: string };

export async function updateQuoteAction(input: {
  id: string;
  status?: (typeof STATUSES)[number];
  adminNotes?: string;
  responded?: boolean;
}): Promise<UpdateQuoteResult> {
  await requireAdmin();
  if (typeof input.adminNotes === 'string' && input.adminNotes.length > ADMIN_NOTES_MAX) {
    return { ok: false, error: `Admin notu en fazla ${ADMIN_NOTES_MAX} karakter olabilir.` };
  }
  const sb = createAdminClient();
  const { data: existing } = await sb.from('quotes').select('status').eq('id', input.id).maybeSingle();
  const oldStatus = (existing as { status?: string } | null)?.status ?? null;
  const patch: Record<string, unknown> = {};
  if (input.status && STATUSES.includes(input.status)) patch.status = input.status;
  if (typeof input.adminNotes === 'string') patch.admin_notes = input.adminNotes || null;
  if (typeof input.responded === 'boolean') {
    patch.responded = input.responded;
    patch.responded_at = input.responded ? new Date().toISOString() : null;
  }
  const { error } = await sb.from('quotes').update(patch).eq('id', input.id);
  if (error) {
    console.error('[admin] updateQuoteAction failed', { id: input.id, error });
    return { ok: false, error: 'Kayıt güncellenemedi, lütfen tekrar deneyin.' };
  }
  revalidatePath(`/admin/teklifler/${input.id}`);
  revalidatePath('/admin/teklifler');
  revalidatePath('/admin');

  if (input.status && oldStatus && input.status !== oldStatus) {
    const { data: q } = await sb
      .from('quotes')
      .select('quote_number,contact_name,contact_email,status,admin_notes,user_id')
      .eq('id', input.id)
      .maybeSingle();
    if (q) {
      let canSend = true;
      const userId = (q as { user_id?: string | null }).user_id;
      if (userId) {
        const { data: p } = await sb
          .from('profiles')
          .select('email_preferences')
          .eq('id', userId)
          .maybeSingle();
        const prefs = (p as { email_preferences?: EmailPreferences } | null)?.email_preferences ?? null;
        canSend = canReceive(prefs, 'quote_status');
      }
      if (canSend) {
        const quote = q as {
          quote_number: string;
          contact_name: string;
          contact_email: string;
          status: string;
          admin_notes: string | null;
        };
        await Promise.allSettled([
          sendEmail({
            to: quote.contact_email,
            ...quoteStatusEmail({
              quoteNumber: quote.quote_number,
              contactName: quote.contact_name,
              oldStatus: oldStatus as never,
              newStatus: quote.status as never,
              adminNotes: quote.admin_notes,
            }),
          }),
        ]);
      }
    }
  }

  return { ok: true };
}
