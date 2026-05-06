import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopProductCard } from '@/components/shop/shop-product-card';
import { getFeaturedProducts } from '@/lib/db/queries/products';

export async function StockProducts() {
  const items = await getFeaturedProducts(8);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[var(--color-border-glass)] py-16" aria-labelledby="stock-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="stock-heading" className="font-display text-3xl font-bold sm:text-4xl">
              Stoktaki ürünler
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Hemen kargolanmaya hazır panel, invertör ve batarya seçenekleri.
            </p>
          </div>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/magaza">
              Tüm ürünler
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="secondary">
            <Link href="/magaza">Tüm ürünler</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
