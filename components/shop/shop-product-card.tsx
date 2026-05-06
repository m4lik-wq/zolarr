'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BellPlus, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/db/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { formatTry, calcDiscountPercent, effectivePrice } from '@/lib/utils/price';
import { cn } from '@/lib/utils';

const TAG_LABELS: Record<string, string> = {
  kargo_bedava: '🚚 Kargo Bedava',
  tercih_edilen: '🏆 Tercih Edilen',
  cok_satan: '🔥 Çok Satan',
  premium: '💎 Premium',
  yeni: '⭐ Yeni',
  kampanyada: '🎁 Kampanyada',
};

interface Props {
  product: Product;
  className?: string;
}

export function ShopProductCard({ product, className }: Props) {
  const [idx, setIdx] = React.useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const total = product.images.length;
  const inStock = product.stock > 0;
  const discountPct = calcDiscountPercent(product.price, product.discount_price);
  const finalPrice = effectivePrice(product.price, product.discount_price);

  const cycle = (delta: number) => () =>
    setIdx((i) => (total > 0 ? (i + delta + total) % total : 0));
  const cur =
    product.images[idx] ?? product.images[0] ?? '/images/placeholder-panel-1.svg';

  return (
    <article
      className={cn(
        'glass group relative flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/30',
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg-overlay)]">
        <Image
          src={cur}
          alt={`${product.name} görseli ${idx + 1}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Önceki görsel"
              onClick={cycle(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Sonraki görsel"
              onClick={cycle(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-bg-overlay)]/80 p-1.5 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        <ul className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((t) => (
            <li
              key={t}
              className="rounded-full bg-[var(--color-bg-base)]/85 px-2 py-0.5 font-mono text-[10px]"
            >
              {TAG_LABELS[t] ?? t}
            </li>
          ))}
        </ul>
        {discountPct != null && (
          <span className="absolute right-2 top-2 rounded-full bg-[var(--color-brand)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--color-bg-base)]">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link
          href={`/magaza/${product.slug}`}
          className="font-display text-base font-medium leading-tight hover:text-[var(--color-brand)]"
        >
          {product.name}
        </Link>
        {product.brand && (
          <p className="text-xs text-[var(--color-text-muted)]">{product.brand}</p>
        )}
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-mono text-lg font-semibold text-[var(--color-brand)]">
            {formatTry(finalPrice)}
          </p>
          {discountPct != null && (
            <p className="font-mono text-xs text-[var(--color-text-muted)] line-through">
              {formatTry(product.price)}
            </p>
          )}
        </div>
        <div className="mt-auto flex gap-2 pt-3">
          {inStock ? (
            <>
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={() =>
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    priceTry: finalPrice,
                    image: cur,
                  })
                }
              >
                <ShoppingCart className="h-4 w-4" />
                Sepete Ekle
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/magaza/${product.slug}`}>İncele</Link>
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" size="sm" className="flex-1">
              <BellPlus className="h-4 w-4" />
              Gelince Haber Ver
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
