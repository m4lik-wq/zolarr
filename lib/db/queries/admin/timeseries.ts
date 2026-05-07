import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { fillMissingDays, rangeToDates, type DayCount } from '@/lib/utils/date-series';

async function countByDay(table: string, days: number): Promise<DayCount[]> {
  const sb = createAdminClient();
  const { start, end } = rangeToDates(days);
  const startIso = `${start}T00:00:00Z`;
  const { data, error } = await sb
    .from(table)
    .select('created_at')
    .gte('created_at', startIso)
    .order('created_at', { ascending: true });
  if (error || !data) return fillMissingDays([], start, end);
  const buckets = new Map<string, number>();
  for (const row of data as Array<{ created_at: string }>) {
    const day = row.created_at.slice(0, 10);
    buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  const aggregated: DayCount[] = Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
  return fillMissingDays(aggregated, start, end);
}

export async function quotesPerDay(days: number): Promise<DayCount[]> {
  await requireAdmin();
  return countByDay('quotes', days);
}

export async function dealersPerDay(days: number): Promise<DayCount[]> {
  await requireAdmin();
  return countByDay('dealer_applications', days);
}

export async function contactsPerDay(days: number): Promise<DayCount[]> {
  await requireAdmin();
  return countByDay('contact_messages', days);
}

export async function signupsPerDay(days: number): Promise<DayCount[]> {
  await requireAdmin();
  return countByDay('profiles', days);
}
