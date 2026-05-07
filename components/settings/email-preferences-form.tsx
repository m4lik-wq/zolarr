'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateEmailPreferencesAction } from '@/lib/server-actions/update-email-preferences';
import type { EmailPreferences } from '@/lib/db/types';

const LABEL: Record<keyof EmailPreferences, { title: string; desc: string }> = {
  marketing: {
    title: 'Pazarlama ve kampanyalar',
    desc: 'Yeni ürünler, indirimler ve etkinlikler hakkında bilgi.',
  },
  stock_alerts: {
    title: 'Stok uyarıları',
    desc: 'Favorilediğiniz veya stok uyarısı kurduğunuz ürünler stoğa girince.',
  },
  quote_status: {
    title: 'Teklif durumu güncellemeleri',
    desc: 'Teklif talepleriniz için iletişime geçildi/teklif verildi/sonuçlandı bildirimleri.',
  },
  dealer_status: {
    title: 'Bayi başvuru güncellemeleri',
    desc: 'Bayi başvurunuz inceleme/onay/red durumu güncellemeleri.',
  },
};

const KEYS: Array<keyof EmailPreferences> = [
  'marketing',
  'stock_alerts',
  'quote_status',
  'dealer_status',
];

export function EmailPreferencesForm({ initial }: { initial: EmailPreferences }) {
  const router = useRouter();
  const [prefs, setPrefs] = React.useState<EmailPreferences>(initial);
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggle(key: keyof EmailPreferences) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await updateEmailPreferencesAction(prefs);
    setPending(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        {KEYS.map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 hover:border-[var(--color-brand)]/40"
          >
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => toggle(key)}
              className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
            />
            <div className="flex-1">
              <p className="font-medium">{LABEL[key].title}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{LABEL[key].desc}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
        {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
      </div>
    </form>
  );
}
