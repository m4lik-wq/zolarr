import { getRelatedProducts } from '@/lib/db/queries/products';
import { ShopProductCard } from './shop-product-card';

interface Props {
  categoryId: string | null;
  excludeSlug: string;
}

export async function RelatedProducts({ categoryId, excludeSlug }: Props) {
  const items = await getRelatedProducts(categoryId, excludeSlug, 4);
  if (items.length === 0) return null;
  return (
    <section className="mt-12 border-t border-[var(--color-border-glass)] pt-10">
      <h2 className="mb-6 font-display text-2xl font-bold">İlgili Ürünler</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
