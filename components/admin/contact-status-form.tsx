'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateContactMessageAction } from '@/lib/server-actions/admin/update-contact-message';
import type { AdminContactMessage } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminContactMessage['status'], string> = {
  new: 'Yeni',
  read: 'Okundu',
  replied: 'Yanıtlandı',
  archived: 'Arşivlendi',
};

export function ContactStatusForm({ message }: { message: AdminContactMessage }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<AdminContactMessage['status']>(message.status);
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await updateContactMessageAction({ id: message.id, status });
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
        <label className="text-sm font-medium" htmlFor="m-status">
          Durum
        </label>
        <select
          id="m-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminContactMessage['status'])}
          className="mt-1 h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4"
        >
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
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
