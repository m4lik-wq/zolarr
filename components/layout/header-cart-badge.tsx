'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export function HeaderCartBadge({ className }: Props) {
  const count = useCartStore((s) => s.totalCount());
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  return (
    <Link
      href="/sepet"
      aria-label={hydrated && count > 0 ? `Sepet (${count} ürün)` : 'Sepet'}
      className={cn(
        'relative inline-flex h-12 w-12 items-center justify-center rounded-2xl glass hover:bg-[var(--color-bg-overlay)]',
        className
      )}
    >
      <ShoppingCart className="h-5 w-5" />
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-brand)] px-1 font-mono text-[10px] font-semibold text-[var(--color-bg-base)]">
          {count}
        </span>
      )}
    </Link>
  );
}
