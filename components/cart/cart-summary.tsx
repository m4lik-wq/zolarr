'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { formatTry } from '@/lib/utils/price';

export function CartSummary() {
  const subtotal = useCartStore((s) => s.subtotal());
  const itemsCount = useCartStore((s) => s.totalCount());
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <aside className="glass sticky top-24 space-y-3 rounded-2xl p-6">
      <h2 className="font-display text-xl font-semibold">Özet</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Ürün adedi</dt>
          <dd className="font-mono">{itemsCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Ara toplam</dt>
          <dd className="font-mono">{formatTry(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Kargo</dt>
          <dd className="font-mono">{shipping === 0 ? 'Ücretsiz' : formatTry(shipping)}</dd>
        </div>
      </dl>
      <div className="border-t border-[var(--color-border-glass)] pt-3">
        <div className="flex justify-between text-lg font-semibold">
          <span>Toplam</span>
          <span className="font-mono text-[var(--color-brand)]">{formatTry(total)}</span>
        </div>
      </div>
      <Button asChild className="w-full" size="lg">
        <Link href="/teklif/al">Talep Oluştur</Link>
      </Button>
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Talep oluşturduğunuzda uzmanlarımız sizinle iletişime geçer.
      </p>
    </aside>
  );
}
