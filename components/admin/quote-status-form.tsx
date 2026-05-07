'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateQuoteAction } from '@/lib/server-actions/admin/update-quote';
import type { AdminQuote } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminQuote['status'], string> = {
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  quoted: 'Teklif verildi',
  won: 'Kazandı',
  lost: 'Kapandı',
};

export function QuoteStatusForm({ quote }: { quote: AdminQuote }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<AdminQuote['status']>(quote.status);
  const [notes, setNotes] = React.useState<string>(quote.adminNotes ?? '');
  const [responded, setResponded] = React.useState<boolean>(quote.responded);
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await updateQuoteAction({ id: quote.id, status, adminNotes: notes, responded });
    setPending(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="q-status">
          Durum
        </label>
        <select
          id="q-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminQuote['status'])}
          className="mt-1 h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4"
        >
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="q-notes">
          Admin notu
        </label>
        <textarea
          id="q-notes"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={responded}
          onChange={(e) => setResponded(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        Müşteriye dönüş yapıldı
      </label>
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
