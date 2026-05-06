'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuoteWizardStore } from '@/lib/store/quote-wizard';
import { quoteStepContactSchema } from '@/lib/validation/quote-schema';
import { submitQuote } from '@/lib/server-actions/submit-quote';

export function StepContact({ onSubmitted }: { onSubmitted: (n: string) => void }) {
  const { form, updateForm, prev } = useQuoteWizardStore();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  async function handleSubmit() {
    const r = quoteStepContactSchema.safeParse({
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      contactTimePreference: form.contactTimePreference || undefined,
      kvkkAccepted: form.kvkkAccepted,
    });
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    setSubmitError(null);
    try {
      const result = await submitQuote(form);
      if (result.ok) {
        onSubmitted(result.quoteNumber);
      } else {
        setSubmitError(result.error);
      }
    } catch {
      setSubmitError('Beklenmeyen bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold">İletişim bilgileri</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Size nasıl ulaşalım?</p>
      </header>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Telefon *
            </label>
            <Input
              id="phone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => updateForm({ contactPhone: e.target.value })}
              placeholder="+90 (5__) ___ __ __"
              error={!!errors.contactPhone}
            />
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.contactPhone}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              E-posta *
            </label>
            <Input
              id="email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => updateForm({ contactEmail: e.target.value })}
              placeholder="ornek@firma.com"
              error={!!errors.contactEmail}
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.contactEmail}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="time" className="text-sm font-medium">
            Tercih edilen iletişim saati *
          </label>
          <select
            id="time"
            value={form.contactTimePreference}
            onChange={(e) =>
              updateForm({
                contactTimePreference: e.target.value as
                  | 'morning'
                  | 'afternoon'
                  | 'evening'
                  | 'any'
                  | '',
              })
            }
            className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            <option value="">Seçiniz</option>
            <option value="morning">Sabah (09–12)</option>
            <option value="afternoon">Öğleden sonra (12–17)</option>
            <option value="evening">Akşam (17–20)</option>
            <option value="any">Fark etmez</option>
          </select>
          {errors.contactTimePreference && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">
              {errors.contactTimePreference}
            </p>
          )}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.kvkkAccepted}
            onChange={(e) => updateForm({ kvkkAccepted: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
          />
          <span>
            KVKK aydınlatma metnini okudum ve verilerimin teklif iletişimi için işlenmesine onay
            veriyorum. *
          </span>
        </label>
        {errors.kvkkAccepted && (
          <p className="text-sm text-[var(--color-danger)]">{errors.kvkkAccepted}</p>
        )}
        {submitError && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {submitError}
          </p>
        )}
      </div>
      <div className="flex justify-between gap-2">
        <Button type="button" variant="ghost" onClick={prev} disabled={pending}>
          Geri
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={pending}>
          {pending ? 'Gönderiliyor…' : 'Teklifi Gönder'}
        </Button>
      </div>
    </div>
  );
}
