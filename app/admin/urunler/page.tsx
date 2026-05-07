import Link from 'next/link';
import Image from 'next/image';
import { listAdminProducts } from '@/lib/db/queries/admin/products';
import { Button } from '@/components/ui/button';
import { formatTry } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

export default async function AdminUrunlerPage() {
  const products = await listAdminProducts();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Ürünler</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{products.length} kayıt</p>
        </div>
        <Button asChild>
          <Link href="/admin/urunler/yeni">+ Yeni Ürün</Link>
        </Button>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Görsel</th>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-[var(--color-bg-elevated)]" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku ?? '—'}</td>
                <td className="px-4 py-3">{formatTry(p.price)}</td>
                <td className="px-4 py-3">{p.track_stock ? p.stock : '∞'}</td>
                <td className="px-4 py-3">
                  {p.is_active ? (
                    <span className="rounded-full bg-[var(--color-brand)]/15 px-2 py-1 text-xs text-[var(--color-brand)]">
                      Aktif
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text-muted)]">
                      Pasif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/urunler/${p.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Henüz ürün yok.</p>
        )}
      </div>
    </div>
  );
}
