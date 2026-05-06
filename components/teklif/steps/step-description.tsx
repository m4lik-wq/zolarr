'use client';

import { Button } from '@/components/ui/button';
import { useQuoteWizardStore } from '@/lib/store/quote-wizard';

const MAX = 2000;

export function StepDescription() {
  const { form, updateForm, next, prev } = useQuoteWizardStore();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold">Detaylı açıklama</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Eklemek istediğiniz detayları yazın (opsiyonel).
        </p>
      </header>
      <div>
        <textarea
          value={form.description}
          onChange={(e) => updateForm({ description: e.target.value.slice(0, MAX) })}
          rows={8}
          maxLength={MAX}
          placeholder="Çatınızın yönü, mevcut faturanız, özel istekleriniz vb."
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        />
        <p className="mt-1 text-right text-xs font-mono text-[var(--color-text-muted)]">
          {form.description.length} / {MAX}
        </p>
      </div>
      <div className="flex justify-between gap-2">
        <Button type="button" variant="ghost" onClick={prev}>
          Geri
        </Button>
        <Button type="button" onClick={next}>
          Devam
        </Button>
      </div>
    </div>
  );
}
