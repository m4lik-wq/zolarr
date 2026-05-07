import Link from 'next/link';
import { listAdminCategories } from '@/lib/db/queries/admin/categories';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminKategorilerPage() {
  const cats = await listAdminCategories();
  const byId = new Map(cats.map((c) => [c.id, c]));
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Kategoriler</h1>
        <Button asChild>
          <Link href="/admin/kategoriler/yeni">+ Yeni Kategori</Link>
        </Button>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Üst</th>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">
                  {c.parent_id ? byId.get(c.parent_id)?.name ?? '—' : '—'}
                </td>
                <td className="px-4 py-3">{c.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/kategoriler/${c.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cats.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Henüz kategori yok.</p>
        )}
      </div>
    </div>
  );
}
