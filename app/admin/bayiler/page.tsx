import Link from 'next/link';
import { listAdminDealers } from '@/lib/db/queries/admin/dealers';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminDealer } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminDealer['status'], string> = {
  new: 'Yeni',
  reviewing: 'İncelemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBayilerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = (sp.status as AdminDealer['status']) || undefined;
  const dealers = await listAdminDealers({ status });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Bayi Başvuruları</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{dealers.length} kayıt</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Başvuru No</th>
              <th className="px-4 py-3">Firma</th>
              <th className="px-4 py-3">Yetkili</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((d) => (
              <tr key={d.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-mono text-[var(--color-brand)]">
                  {d.applicationNumber}
                </td>
                <td className="px-4 py-3">{d.companyName}</td>
                <td className="px-4 py-3">{d.contactName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} label={STATUS_LABEL[d.status]} />
                </td>
                <td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/bayiler/${d.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dealers.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Kayıt yok.</p>
        )}
      </div>
    </div>
  );
}
