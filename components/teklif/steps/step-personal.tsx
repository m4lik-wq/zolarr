'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuoteWizardStore } from '@/lib/store/quote-wizard';
import { quoteStepPersonalSchema } from '@/lib/validation/quote-schema';
import { PROVINCES } from '@/lib/data/provinces';

export function StepPersonal() {
  const { form, updateForm, next, prev } = useQuoteWizardStore();
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function handleNext() {
    const r = quoteStepPersonalSchema.safeParse({
      contactName: form.contactName,
      city: form.city,
      district: form.district,
    });
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    next();
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold">Kişisel bilgileriniz</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Size nasıl hitap edeceğimizi ve hangi bölgede olduğunuzu öğrenelim.
        </p>
      </header>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Ad Soyad *
          </label>
          <Input
            id="name"
            value={form.contactName}
            onChange={(e) => updateForm({ contactName: e.target.value })}
            error={!!errors.contactName}
          />
          {errors.contactName && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.contactName}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="text-sm font-medium">
              İl *
            </label>
            <select
              id="city"
              value={form.city}
              onChange={(e) => updateForm({ city: e.target.value })}
              className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              aria-invalid={!!errors.city}
            >
              <option value="">Seçiniz</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.city}</p>
            )}
          </div>
          <div>
            <label htmlFor="district" className="text-sm font-medium">
              İlçe
            </label>
            <Input
              id="district"
              value={form.district}
              onChange={(e) => updateForm({ district: e.target.value })}
              placeholder="(opsiyonel)"
            />
          </div>
        </div>
      </div>
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
