'use client';

import { Trash2 } from 'lucide-react';
import type { Appliance } from '@/lib/validation/quote-schema';

interface Props {
  appliances: Appliance[];
  onRemove: (idx: number) => void;
}

export function ApplianceList({ appliances, onRemove }: Props) {
  if (appliances.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)]/30 p-6 text-center text-sm text-[var(--color-text-muted)]">
        Henüz cihaz eklenmedi. Aşağıdan ekleyin.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {appliances.map((a, i) => (
        <li
          key={i}
          className="flex items-center justify-between rounded-2xl border border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)] px-4 py-3"
        >
          <div>
            <p className="font-medium">{a.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              {a.consumptionKwh != null && `${a.consumptionKwh} kWh/ay`}
              {a.powerW != null && ` · ${a.powerW} W`}
              {a.voltageV != null && ` · ${a.voltageV} V`}
            </p>
          </div>
          <button
            type="button"
            aria-label={`${a.name} sil`}
            onClick={() => onRemove(i)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
