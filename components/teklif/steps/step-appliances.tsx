'use client';

import { Button } from '@/components/ui/button';
import { useQuoteWizardStore } from '@/lib/store/quote-wizard';
import { ApplianceList } from '@/components/teklif/appliance-list';
import { ApplianceModal } from '@/components/teklif/appliance-modal';

export function StepAppliances() {
  const { form, addAppliance, removeAppliance, next, prev } = useQuoteWizardStore();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold">Çalıştıracağınız cihazlar</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Hangi cihazları sistemden çalıştıracağınızı söyleyin (opsiyonel ama daha doğru hesaplama
          için faydalıdır).
        </p>
      </header>
      <ApplianceList appliances={form.appliances} onRemove={removeAppliance} />
      <ApplianceModal onAdd={addAppliance} />
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
