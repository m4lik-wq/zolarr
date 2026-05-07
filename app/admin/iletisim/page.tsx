import Link from 'next/link';
import { listAdminContactMessages } from '@/lib/db/queries/admin/contact-messages';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminContactMessage } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminContactMessage['status'], string> = {
  new: 'Yeni',
  read: 'Okundu',
  replied: 'Yanıtlandı',
  archived: 'Arşivlendi',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminIletisimPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = (sp.status as AdminContactMessage['status']) || undefined;
  const messages = await listAdminContactMessages({ status });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">İletişim Mesajları</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{messages.length} kayıt</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Mesaj No</th>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Konu</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-mono text-[var(--color-brand)]">
                  {m.messageNumber}
                </td>
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.subject ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} label={STATUS_LABEL[m.status]} />
                </td>
                <td className="px-4 py-3">{new Date(m.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/iletisim/${m.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {messages.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Kayıt yok.</p>
        )}
      </div>
    </div>
  );
}
