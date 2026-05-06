'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { applianceSchema, type Appliance } from '@/lib/validation/quote-schema';

interface Props {
  onAdd: (a: Appliance) => void;
}

export function ApplianceModal({ onAdd }: Props) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [consumption, setConsumption] = React.useState('');
  const [power, setPower] = React.useState('');
  const [voltage, setVoltage] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setName('');
    setConsumption('');
    setPower('');
    setVoltage('');
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Appliance = {
      name: name.trim(),
      consumptionKwh: consumption ? Number(consumption) : undefined,
      powerW: power ? Number(power) : undefined,
      voltageV: voltage ? Number(voltage) : undefined,
    };
    const r = applianceSchema.safeParse(payload);
    if (!r.success) {
      setError(r.error.issues[0]?.message ?? 'Geçersiz değer');
      return;
    }
    onAdd(r.data);
    reset();
    setOpen(false);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <Dialog.Trigger asChild>
        <Button type="button" variant="secondary" className="w-full">
          <Plus className="h-4 w-4" />
          Cihaz Ekle
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-glass)]">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-semibold">Cihaz Ekle</Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Kapat"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div>
              <label htmlFor="app-name" className="text-sm font-medium">
                Ürün adı *
              </label>
              <Input
                id="app-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Buzdolabı"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="app-cons" className="text-sm font-medium">
                Tüketim (kWh/ay) — opsiyonel
              </label>
              <Input
                id="app-cons"
                inputMode="decimal"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="app-power" className="text-sm font-medium">
                Güç (W) — opsiyonel
              </label>
              <Input
                id="app-power"
                inputMode="decimal"
                value={power}
                onChange={(e) => setPower(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="app-volt" className="text-sm font-medium">
                Voltaj (V) — opsiyonel
              </label>
              <Input
                id="app-volt"
                inputMode="decimal"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-[var(--color-danger)]">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  İptal
                </Button>
              </Dialog.Close>
              <Button type="submit">Ekle</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
