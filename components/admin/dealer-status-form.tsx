'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateDealerAction } from '@/lib/server-actions/admin/update-dealer';
import type { AdminDealer } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminDealer['status'], string> = {
  new: 'Yeni',
  reviewing: 'İncelemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

export function DealerStatusForm({ dealer }: { dealer: AdminDealer }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<AdminDealer['status']>(dealer.status);
  const [notes, setNotes] = React.useState<string>(dealer.adminNotes ?? '');
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await updateDealerAction({ id: dealer.id, status, adminNotes: notes });
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
        <label className="text-sm font-medium" htmlFor="d-status">
          Durum
        </label>
        <select
          id="d-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminDealer['status'])}
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
        <label className="text-sm font-medium" htmlFor="d-notes">
          Admin notu
        </label>
        <textarea
          id="d-notes"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
        />
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
