'use client';

import * as React from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';

interface Props {
  productId: string;
  slug: string;
  name: string;
  priceTry: number;
  image: string;
  inStock: boolean;
  stock: number;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  priceTry,
  image,
  inStock,
  stock,
}: Props) {
  const [qty, setQty] = React.useState(1);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({ productId, slug, name, priceTry, image }, qty);
    toast.success(`${name} sepete eklendi`, {
      description: `${qty} adet · ${priceTry.toLocaleString('tr-TR')} TL/adet`,
    });
  }

  if (!inStock) {
    return (
      <Button type="button" variant="secondary" size="lg" className="w-full">
        Gelince Haber Ver
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-text-muted)]">Adet</span>
        <div className="flex items-center rounded-2xl border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Azalt"
            className="px-3 py-2 hover:bg-[var(--color-bg-overlay)]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center font-mono">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            aria-label="Arttır"
            className="px-3 py-2 hover:bg-[var(--color-bg-overlay)]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">Stok: {stock}</span>
      </div>
      <Button type="button" size="lg" onClick={handleAdd} className="w-full">
        <ShoppingCart className="h-5 w-5" />
        Sepete Ekle
      </Button>
    </div>
  );
}
