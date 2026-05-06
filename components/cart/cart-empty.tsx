import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-16 text-center">
      <ShoppingBag className="h-12 w-12 text-[var(--color-text-muted)]" aria-hidden />
      <h2 className="mt-4 font-display text-xl font-semibold">Sepetiniz boş</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
        Mağazadan beğendiğiniz ürünleri sepete ekleyin, talep oluşturun.
      </p>
      <Button asChild className="mt-6">
        <Link href="/magaza">Mağazaya Git</Link>
      </Button>
    </div>
  );
}
