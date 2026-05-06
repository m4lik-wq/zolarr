import { listUserStockAlerts } from '@/lib/db/queries/stock-alerts';
import { requireUser } from '@/lib/auth/server';
import { StockAlertListItem } from '@/components/account/stock-alert-list-item';

export const dynamic = 'force-dynamic';

export default async function BildirimlerPage() {
  const user = await requireUser();
  const alerts = await listUserStockAlerts(user.id);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Bildirimler</h1>
      {alerts.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Stok bildirimi aboneliğiniz yok.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <StockAlertListItem key={a.id} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}
