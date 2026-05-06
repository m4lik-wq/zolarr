import type { Product } from '@/lib/db/types';
import { ShopProductCard } from './shop-product-card';

interface Props {
  products: Product[];
  view?: 'grid' | 'list';
}

export function ProductGrid({ products, view = 'grid' }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-12 text-center">
        <p className="font-display text-lg font-semibold">
          Aradığınız kriterlere uyan ürün bulunamadı.
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Filtreleri sıfırlayıp tekrar deneyin veya farklı bir kategori seçin.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        view === 'grid'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
          : 'space-y-4'
      }
    >
      {products.map((p) => (
        <ShopProductCard
          key={p.id}
          product={p}
          className={view === 'list' ? 'flex-row sm:flex' : ''}
        />
      ))}
    </div>
  );
}
