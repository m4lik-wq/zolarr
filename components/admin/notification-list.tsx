import Link from 'next/link';
import type { Notification } from '@/lib/db/types';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<Notification['type'], string> = {
  NEW_QUOTE: 'Yeni teklif talebi',
  NEW_DEALER: 'Yeni bayi başvurusu',
  NEW_CONTACT: 'Yeni iletişim mesajı',
  NEW_ORDER: 'Yeni sipariş',
  PRICE_INCREASE: 'Fiyat artışı uyarısı',
  PRICE_DECREASE: 'Fiyat düşüşü uyarısı',
  OUT_OF_STOCK: 'Stok bitti',
  SUPPLIER_GONE: 'Tedarikçi sayfası kayboldu',
};

function targetHref(n: Notification): string | null {
  const p = n.payload as Record<string, string>;
  if (n.type === 'NEW_QUOTE' && p.quote_id) return `/admin/teklifler/${p.quote_id}`;
  if (n.type === 'NEW_DEALER' && p.dealer_id) return `/admin/bayiler/${p.dealer_id}`;
  if (n.type === 'NEW_CONTACT' && p.message_id) return `/admin/iletisim/${p.message_id}`;
  return null;
}

function payloadSummary(n: Notification): string {
  const p = n.payload as Record<string, string>;
  if (n.type === 'NEW_QUOTE') return `${p.contact_name ?? '-'} — ${p.city ?? '-'} (${p.quote_number ?? '-'})`;
  if (n.type === 'NEW_DEALER') return p.company_name ?? '-';
  if (n.type === 'NEW_CONTACT') return `${p.name ?? '-'} — ${p.email ?? ''}`;
  return '';
}

export function NotificationList({ items }: { items: Notification[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)]">Henüz bildirim yok.</p>;
  }
  return (
    <ul className="divide-y divide-[var(--color-border-glass)]">
      {items.map((n) => {
        const href = targetHref(n);
        const body = (
          <div className={cn('flex items-start justify-between gap-3 py-3', !n.isRead && 'font-medium')}>
            <div className="flex-1">
              <p className="text-sm">{TYPE_LABEL[n.type]}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{payloadSummary(n)}</p>
            </div>
            <time className="text-xs text-[var(--color-text-muted)]">
              {new Date(n.createdAt).toLocaleString('tr-TR')}
            </time>
          </div>
        );
        return (
          <li key={n.id}>
            {href ? (
              <Link href={href} className="block transition-colors hover:bg-[var(--color-bg-overlay)] -mx-3 px-3 rounded-xl">{body}</Link>
            ) : body}
          </li>
        );
      })}
    </ul>
  );
}
