import { notFound } from 'next/navigation';
import { getSupplier, listSupplierProducts } from '@/lib/db/queries/admin/suppliers';
import { listAdapters } from '@/lib/suppliers/registry';
import { SupplierForm } from '@/components/admin/supplier-form';
import { SyncButton } from '@/components/admin/sync-button';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TedarikciDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const [supplier, products] = await Promise.all([getSupplier(id), listSupplierProducts(id)]);
  if (!supplier) notFound();
  const adapters = listAdapters().map((a) => ({ slug: a.slug, displayName: a.displayName }));
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{supplier.name}</h1>
        <SyncButton supplierId={supplier.id} />
      </header>
      <SupplierForm
        mode="edit"
        initial={{
          id: supplier.id,
          slug: supplier.slug,
          name: supplier.name,
          baseUrl: supplier.baseUrl,
          adapterSlug: supplier.adapterSlug,
          enabled: supplier.enabled,
        }}
        adapters={adapters}
      />

      {supplier.lastSyncError && (
        <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4">
          <p className="text-sm text-[var(--color-danger)]">
            <strong>Son sync hatası:</strong> {supplier.lastSyncError}
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Bağlı Ürünler ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            Henüz ürün bağlı değil. (Şu an UI&apos;da ekleme yok — DB üzerinden{' '}
            <code className="font-mono text-xs">supplier_products</code> tablosuna manuel insert
            yapın. UI Faz 12&apos;de eklenebilir.)
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg-elevated)] text-left">
                <tr>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Son fiyat</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Son sync</th>
                  <th className="px-4 py-3">Hata</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[var(--color-border-glass)]">
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-xs">
                      <a
                        href={p.supplierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-brand)] hover:underline"
                      >
                        {p.supplierUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">{p.lastPrice ?? '—'}</td>
                    <td className="px-4 py-3">{p.lastStock ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {p.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleString('tr-TR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-danger)]">
                      {p.lastError ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
