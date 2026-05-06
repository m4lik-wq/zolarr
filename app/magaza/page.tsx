import { Suspense } from 'react';
import {
  getProducts,
  normalizeProductFilters,
  PAGE_SIZE,
  type RawFilters,
} from '@/lib/db/queries/products';
import { getCategoryTree } from '@/lib/db/queries/categories';
import { CategoryTree } from '@/components/shop/category-tree';
import { ProductGrid } from '@/components/shop/product-grid';
import { ShopControls } from '@/components/shop/shop-controls';

// Prevent SSG attempts during build until DB/Supabase is fully provisioned.
// Without this, `next build` may fail when prerendering /magaza if Supabase
// returns errors (e.g. tables not yet migrated). `force-dynamic` defers
// rendering to request-time, where the queries return empty arrays gracefully.
export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PageProps {
  searchParams: Promise<RawFilters>;
}

export const metadata = {
  title: 'E-Mağaza | Zolarr',
  description: 'Güneş paneli, invertör, batarya ve aksesuarlar — Zolarr E-Mağaza.',
};

export default async function MagazaPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = normalizeProductFilters(raw);
  const [tree, { items, total }] = await Promise.all([
    getCategoryTree(),
    getProducts(filters),
  ]);

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <CategoryTree categories={tree} activeSlug={filters.categorySlug} />
        <Suspense>
          <ShopControls totalCount={total} pageSize={PAGE_SIZE} />
        </Suspense>
      </aside>

      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4 border-b border-[var(--color-border-glass)] pb-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">E-Mağaza</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {total} ürün gösteriliyor
            </p>
          </div>
        </header>
        <ProductGrid
          products={items}
          view={raw.sort === 'list' ? 'list' : 'grid'}
        />
      </div>
    </div>
  );
}
