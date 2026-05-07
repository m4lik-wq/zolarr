import Link from 'next/link';
import { listAdminProjects } from '@/lib/db/queries/admin/projects';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/db/types';

const TYPE_LABEL: Record<Project['type'], string> = {
  konut: 'Konut',
  ticari: 'Ticari',
  tarim: 'Tarım',
};

export const dynamic = 'force-dynamic';

export default async function AdminProjelerPage() {
  const projects = await listAdminProjects();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Projeler</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{projects.length} kayıt</p>
        </div>
        <Button asChild>
          <Link href="/admin/projeler/yeni">+ Yeni Proje</Link>
        </Button>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Konum</th>
              <th className="px-4 py-3">Kapasite</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3">{TYPE_LABEL[p.type]}</td>
                <td className="px-4 py-3">{p.location}</td>
                <td className="px-4 py-3">{p.capacityKwp} kWp</td>
                <td className="px-4 py-3">
                  {p.isPublished ? (
                    <span className="rounded-full bg-[var(--color-brand)]/15 px-2 py-1 text-xs text-[var(--color-brand)]">
                      Yayında
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text-muted)]">
                      Taslak
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/projeler/${p.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Henüz proje yok.</p>
        )}
      </div>
    </div>
  );
}
