'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useQuoteWizardStore } from '@/lib/store/quote-wizard';
import {
  quoteStepLocationSchema,
  type InstallationLocation,
} from '@/lib/validation/quote-schema';
import { cn } from '@/lib/utils';

const OPTIONS: { value: InstallationLocation; label: string; hint: string }[] = [
  { value: 'roof', label: 'Eğimli Çatı', hint: 'Kiremit, sandviç vb.' },
  { value: 'roof_flat', label: 'Düz Çatı', hint: 'Beton/teras' },
  { value: 'land', label: 'Arazi', hint: 'Tarla / boş alan' },
  { value: 'carport', label: 'Carport', hint: 'Otopark üzeri' },
  { value: 'facade', label: 'Cephe', hint: 'Bina cephesi' },
];

export function StepLocation() {
  const { form, updateForm, next, prev } = useQuoteWizardStore();
  const [error, setError] = React.useState<string | null>(null);

  function handleNext() {
    const r = quoteStepLocationSchema.safeParse({
      installationLocation: form.installationLocation || undefined,
      locationNotes: form.locationNotes,
    });
    if (!r.success) {
      setError('Lütfen kurulum yerini seçiniz');
      return;
    }
    setError(null);
    next();
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold">Kurulum yeri</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Sistemi nereye kurmayı planlıyorsunuz?
        </p>
      </header>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Kurulum yeri seçimi</legend>
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
              form.installationLocation === o.value
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10'
                : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
            )}
          >
            <input
              type="radio"
              name="installationLocation"
              value={o.value}
              checked={form.installationLocation === o.value}
              onChange={() => updateForm({ installationLocation: o.value })}
              className="mt-1 accent-[var(--color-brand)]"
            />
            <div>
              <p className="font-medium">{o.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{o.hint}</p>
            </div>
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="loc-notes" className="text-sm font-medium">
          Yer hakkında not (opsiyonel)
        </label>
        <textarea
          id="loc-notes"
          value={form.locationNotes}
          onChange={(e) => updateForm({ locationNotes: e.target.value })}
          rows={3}
          maxLength={1000}
          className="mt-1 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <div className="flex justify-between gap-2">
        <Button type="button" variant="ghost" onClick={prev}>
          Geri
        </Button>
        <Button type="button" onClick={handleNext}>
          Devam
        </Button>
      </div>
    </div>
  );
}
