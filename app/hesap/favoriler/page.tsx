import { listUserFavorites } from '@/lib/db/queries/favorites';
import { requireUser } from '@/lib/auth/server';
import { ShopProductCard } from '@/components/shop/shop-product-card';

export const dynamic = 'force-dynamic';

export default async function FavorilerPage() {
  const user = await requireUser();
  const products = await listUserFavorites(user.id);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Favorilerim</h1>
      {products.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Henüz favori ürününüz yok.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
