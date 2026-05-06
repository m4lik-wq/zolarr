'use client';

import * as React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  subscribeStockAlertAction,
  unsubscribeStockAlertAction,
} from '@/lib/server-actions/stock-alerts';
import { Button } from '@/components/ui/button';

interface Props {
  productId: string;
  initialSubscribed: boolean;
  loggedIn: boolean;
}

export function StockAlertButton({ productId, initialSubscribed, loggedIn }: Props) {
  const router = useRouter();
  const [subscribed, setSubscribed] = React.useState(initialSubscribed);
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    if (!loggedIn) {
      router.push(`/giris?next=/magaza`);
      return;
    }
    setPending(true);
    const res = subscribed
      ? await unsubscribeStockAlertAction(productId)
      : await subscribeStockAlertAction(productId);
    setPending(false);
    if (res.ok) setSubscribed(!subscribed);
  }

  return (
    <Button type="button" variant="secondary" onClick={onClick} disabled={pending}>
      {subscribed ? (
        <>
          <BellOff className="h-4 w-4" /> Bildirimi Kaldır
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" /> Stoğa Gelince Haber Ver
        </>
      )}
    </Button>
  );
}
