import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/db/queries/products';
import { ProductDetailGallery } from '@/components/shop/product-detail-gallery';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { ProductDetailTabs } from '@/components/shop/product-detail-tabs';
import { RelatedProducts } from '@/components/shop/related-products';
import { formatTry, calcDiscountPercent, effectivePrice } from '@/lib/utils/price';
import { getCurrentUser } from '@/lib/auth/server';
import { isFavorited } from '@/lib/db/queries/favorites';
import { FavoriteButton } from '@/components/account/favorite-button';

// Match /magaza listing: defer to request-time so build doesn't try to SSG
// every product slug while DB/Supabase may not be fully provisioned.
// `force-dynamic` overrides `revalidate`, but we keep both for parity with
// the listing page so future migration to ISR is a one-line change.
export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Ürün bulunamadı | Zolarr' };
  return {
    title: `${product.name} | Zolarr E-Mağaza`,
    description: product.short_description ?? product.name,
  };
}

const TAG_LABELS: Record<string, string> = {
  kargo_bedava: '🚚 Kargo Bedava',
  tercih_edilen: '🏆 Tercih Edilen',
  cok_satan: '🔥 Çok Satan',
  premium: '💎 Premium',
  yeni: '⭐ Yeni',
  kampanyada: '🎁 Kampanyada',
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const inStock = product.stock > 0;
  const discountPct = calcDiscountPercent(product.price, product.discount_price);
  const finalPrice = effectivePrice(product.price, product.discount_price);
  const user = await getCurrentUser();
  const favorited = user ? await isFavorited(user.id, product.id) : false;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductDetailGallery images={product.images} alt={product.name} />
        <div className="space-y-4">
          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-[var(--color-brand)]/15 px-3 py-1 font-mono text-xs text-[var(--color-brand)]"
                >
                  {TAG_LABELS[t] ?? t}
                </li>
              ))}
            </ul>
          )}
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
          {(product.brand || product.sku) && (
            <p className="text-sm text-[var(--color-text-muted)]">
              {product.brand}
              {product.sku ? ` · ${product.sku}` : ''}
            </p>
          )}
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-3xl font-bold text-[var(--color-brand)]">
              {formatTry(finalPrice)}
            </p>
            {discountPct != null && (
              <>
                <p className="font-mono text-lg text-[var(--color-text-muted)] line-through">
                  {formatTry(product.price)}
                </p>
                <span className="rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 font-mono text-xs text-[var(--color-danger)]">
                  -{discountPct}%
                </span>
              </>
            )}
          </div>
          <p
            className={
              inStock ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'
            }
          >
            {inStock ? `✅ Stokta — ${product.stock} adet hazır` : '❌ Stokta yok'}
          </p>
          <div className="flex flex-wrap items-start gap-3 pt-4">
            <div className="flex-1 min-w-[220px]">
              <AddToCartButton
                productId={product.id}
                slug={product.slug}
                name={product.name}
                priceTry={finalPrice}
                image={product.images[0] ?? ''}
                inStock={inStock}
                stock={product.stock}
              />
            </div>
            <FavoriteButton
              productId={product.id}
              initialFavorited={favorited}
              loggedIn={!!user}
            />
          </div>
        </div>
      </div>

      <ProductDetailTabs product={product} />

      <Suspense>
        <RelatedProducts categoryId={product.category_id} excludeSlug={product.slug} />
      </Suspense>
    </div>
  );
}
