'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore, type CartItem } from '@/lib/store/cart';
import { formatTry, lineTotal } from '@/lib/utils/price';

interface Props {
  item: CartItem;
}

export function CartLineItem({ item }: Props) {
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <article className="flex gap-4 border-b border-[var(--color-border-glass)] py-4 last:border-0">
      <Link
        href={`/magaza/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--color-bg-overlay)]"
      >
        {item.image && (
          <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
        )}
      </Link>
      <div className="flex flex-1 flex-col">
        <Link
          href={`/magaza/${item.slug}`}
          className="font-display text-base font-medium hover:text-[var(--color-brand)]"
        >
          {item.name}
        </Link>
        <p className="text-xs text-[var(--color-text-muted)]">Birim: {formatTry(item.priceTry)}</p>
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex items-center rounded-2xl border border-[var(--color-border)]">
            <button
              type="button"
              aria-label="Azalt"
              onClick={() => setQty(item.productId, item.qty - 1)}
              className="px-2 py-1 hover:bg-[var(--color-bg-overlay)]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center font-mono text-sm">{item.qty}</span>
            <button
              type="button"
              aria-label="Arttır"
              onClick={() => setQty(item.productId, item.qty + 1)}
              className="px-2 py-1 hover:bg-[var(--color-bg-overlay)]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="font-mono font-semibold text-[var(--color-brand)]">
            {formatTry(lineTotal(item.priceTry, item.qty))}
          </p>
          <button
            type="button"
            aria-label="Sil"
            onClick={() => removeItem(item.productId)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
