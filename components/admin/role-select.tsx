'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { updateUserRoleAction } from '@/lib/server-actions/admin/update-user-role';
import type { AdminUser } from '@/lib/db/types';

const ROLE_LABEL: Record<AdminUser['role'], string> = {
  customer: 'Müşteri',
  moderator: 'Moderatör',
  assistant: 'Asistan',
  admin: 'Admin',
};

export function RoleSelect({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as AdminUser['role'];
    setPending(true);
    setError(null);
    const res = await updateUserRoleAction({ id: user.id, role });
    setPending(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={user.role}
        onChange={onChange}
        disabled={pending || isSelf}
        title={isSelf ? 'Kendi rolünüzü değiştiremezsiniz' : ''}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1 text-sm disabled:opacity-50"
      >
        {Object.entries(ROLE_LABEL).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </div>
  );
}
