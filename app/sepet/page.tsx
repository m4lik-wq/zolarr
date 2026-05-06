'use client';

import * as React from 'react';
import { useCartStore } from '@/lib/store/cart';
import { CartLineItem } from '@/components/cart/cart-line-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { CartEmpty } from '@/components/cart/cart-empty';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold sm:text-4xl">Sepetim</h1>
      {!hydrated ? (
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
      ) : items.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
            {items.map((it) => (
              <CartLineItem key={it.productId} item={it} />
            ))}
          </div>
          <CartSummary />
        </div>
      )}
    </div>
  );
}
