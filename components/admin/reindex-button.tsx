'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { reindexAction } from '@/lib/server-actions/admin/reindex';

export function ReindexButton() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setMsg(null);
    const res = await reindexAction();
    setPending(false);
    if (res.ok) {
      if (res.skipped) {
        setMsg(`Atlandı: API anahtarı yok (sağlayıcı: ${res.provider})`);
      } else {
        setMsg(
          `${res.products} ürün, ${res.projects} proje, ${res.faqs} SSS — ${res.errors} hata`,
        );
      }
      router.refresh();
    } else {
      setMsg(`Hata: ${res.error}`);
    }
    setTimeout(() => setMsg(null), 10_000);
  }

  return (
    <div className="flex items-center gap-3">
      <Button type="button" onClick={onClick} disabled={pending}>
        {pending ? 'İndeksleniyor…' : 'Yeniden indeksle'}
      </Button>
      {msg && <span className="text-sm text-[var(--color-text-muted)]">{msg}</span>}
    </div>
  );
}
