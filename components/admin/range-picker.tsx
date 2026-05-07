'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const PRESETS = [
  { value: 7, label: '7 gün' },
  { value: 30, label: '30 gün' },
  { value: 90, label: '90 gün' },
];

export function RangePicker({ current }: { current: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pick(value: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', String(value));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => pick(p.value)}
          className={
            current === p.value
              ? 'rounded-xl bg-[var(--color-brand)] px-3 py-1 text-sm font-medium text-[var(--color-bg-base)]'
              : 'rounded-xl px-3 py-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
