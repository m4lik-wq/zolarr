import Link from 'next/link';
import { Bell } from 'lucide-react';
import { getRecentNotifications } from '@/lib/db/queries/admin/dashboard';

export async function NotificationBell() {
  const recent = await getRecentNotifications(5);
  const unreadCount = recent.filter((n) => !n.isRead).length;

  return (
    <Link
      href="/admin"
      aria-label={`Admin bildirimleri (${unreadCount} okunmamış)`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] hover:border-[var(--color-brand)]/40"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-brand)] px-1 text-xs font-medium text-[var(--color-bg-base)]">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
