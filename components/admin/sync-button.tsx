'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { syncSupplierAction } from '@/lib/server-actions/admin/sync-supplier';

export function SyncButton({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setMsg(null);
    const res = await syncSupplierAction(supplierId);
    setPending(false);
    if (res.ok) {
      setMsg(`✓ ${res.updated}/${res.total} ürün, ${res.alerts} uyarı, ${res.errors} hata`);
      router.refresh();
    } else {
      setMsg(`Hata: ${res.error}`);
    }
    setTimeout(() => setMsg(null), 6000);
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" onClick={onClick} disabled={pending}>
        {pending ? 'Sync ediliyor…' : 'Sync et'}
      </Button>
      {msg && <span className="text-xs text-[var(--color-text-muted)]">{msg}</span>}
    </div>
  );
}
