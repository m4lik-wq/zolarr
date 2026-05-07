import Link from 'next/link';
import { listSuppliers } from '@/lib/db/queries/admin/suppliers';
import { Button } from '@/components/ui/button';
import { SyncButton } from '@/components/admin/sync-button';
import { StatusBadge } from '@/components/admin/status-badge';

export const dynamic = 'force-dynamic';

export default async function AdminTedarikcilerPage() {
  const list = await listSuppliers();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Tedarikçiler</h1>
        <Button asChild>
          <Link href="/admin/tedarikciler/yeni">+ Yeni Tedarikçi</Link>
        </Button>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Adapter</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Son sync</th>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.adapterSlug}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={s.enabled ? 'approved' : 'archived'}
                    label={s.enabled ? 'Aktif' : 'Kapalı'}
                  />
                </td>
                <td className="px-4 py-3 text-xs">
                  {s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString('tr-TR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <SyncButton supplierId={s.id} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/tedarikciler/${s.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Henüz tedarikçi yok.</p>
        )}
      </div>
    </div>
  );
}
