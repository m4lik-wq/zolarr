import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Notification } from '@/lib/db/types';

export interface DashboardStats {
  newQuotes: number;
  newDealers: number;
  newContacts: number;
  totalUsers: number;
  unreadNotifications: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();
  const sb = createAdminClient();
  const [q, d, c, u, n] = await Promise.all([
    sb.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    sb.from('dealer_applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    sb.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ]);
  return {
    newQuotes: q.count ?? 0,
    newDealers: d.count ?? 0,
    newContacts: c.count ?? 0,
    totalUsers: u.count ?? 0,
    unreadNotifications: n.count ?? 0,
  };
}

export async function getRecentNotifications(limit = 10): Promise<Notification[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('notifications')
    .select('id,type,payload,is_read,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    type: r.type as Notification['type'],
    payload: r.payload as Record<string, unknown>,
    isRead: r.is_read as boolean,
    createdAt: r.created_at as string,
  }));
}
