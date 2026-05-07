import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncSupplier } from '@/lib/suppliers/sync';
import { sendEmail } from '@/lib/email/send';
import { supplierSyncSummaryEmail } from '@/lib/email/templates/supplier-sync-summary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = createAdminClient();
  const { data: suppliers } = await sb
    .from('suppliers')
    .select('id,name')
    .eq('enabled', true);
  const list = ((suppliers ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    name: r.name as string,
  }));

  const summaries: Array<{
    name: string;
    total: number;
    updated: number;
    alerts: number;
    errors: number;
  }> = [];
  let totalAlerts = 0;
  let totalErrors = 0;

  for (const s of list) {
    try {
      const result = await syncSupplier(s.id);
      summaries.push({
        name: s.name,
        total: result.total,
        updated: result.updated,
        alerts: result.alerts,
        errors: result.errors,
      });
      totalAlerts += result.alerts;
      totalErrors += result.errors;
    } catch (e) {
      console.error('[cron] sync failed for supplier', { supplierId: s.id, error: e });
      summaries.push({ name: s.name, total: 0, updated: 0, alerts: 0, errors: 1 });
      totalErrors++;
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && (totalAlerts > 0 || totalErrors > 0)) {
    await sendEmail({
      to: adminEmail,
      ...supplierSyncSummaryEmail({
        runAt: new Date().toISOString(),
        suppliers: summaries,
        totalAlerts,
        totalErrors,
      }),
    });
  }

  return NextResponse.json({
    ok: true,
    totalSuppliers: list.length,
    summaries,
    totalAlerts,
    totalErrors,
  });
}
