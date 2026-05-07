import Link from 'next/link';
import { listAdminCampaigns } from '@/lib/db/queries/admin/campaigns';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/status-badge';

export const dynamic = 'force-dynamic';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('tr-TR');
}

export default async function AdminKampanyalarPage() {
  const list = await listAdminCampaigns();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Kampanyalar</h1>
        <Button asChild>
          <Link href="/admin/kampanyalar/yeni">+ Yeni Kampanya</Link>
        </Button>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Baslik</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Baslangic</th>
              <th className="px-4 py-3">Bitis</th>
              <th className="px-4 py-3">Sira</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={c.isActive ? 'approved' : 'archived'}
                    label={c.isActive ? 'Aktif' : 'Kapali'}
                  />
                </td>
                <td className="px-4 py-3 text-xs">{formatDate(c.startsAt)}</td>
                <td className="px-4 py-3 text-xs">{formatDate(c.endsAt)}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/kampanyalar/${c.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Duzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Henuz kampanya yok.</p>
        )}
      </div>
    </div>
  );
}
