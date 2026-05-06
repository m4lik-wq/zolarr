import Image from 'next/image';
import Link from 'next/link';
import { unsubscribeStockAlertAction } from '@/lib/server-actions/stock-alerts';
import type { StockAlertWithProduct } from '@/lib/db/queries/stock-alerts';

export function StockAlertListItem({ alert }: { alert: StockAlertWithProduct }) {
  async function removeAction() {
    'use server';
    await unsubscribeStockAlertAction(alert.productId);
  }

  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-4">
      {alert.productImage && (
        <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl">
          <Image
            src={alert.productImage}
            alt={alert.productName}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <Link
          href={`/magaza/${alert.productSlug}`}
          className="font-medium hover:text-[var(--color-brand)]"
        >
          {alert.productName}
        </Link>
        <p className="text-xs text-[var(--color-text-muted)]">
          {alert.notified
            ? `Bildirildi: ${new Date(alert.notifiedAt!).toLocaleDateString('tr-TR')}`
            : 'Stok bekleniyor'}
        </p>
      </div>
      <form action={removeAction}>
        <button
          type="submit"
          className="text-xs text-[var(--color-danger)] hover:underline"
        >
          Kaldır
        </button>
      </form>
    </div>
  );
}
