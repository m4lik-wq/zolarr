'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onResume: () => void;
  onReset: () => void;
}

export function ResumePrompt({ open, onResume, onReset }: Props) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-glass)]">
          <Dialog.Title className="font-display text-lg font-semibold">
            Kaldığınız yerden devam edin
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--color-text-muted)]">
            Daha önce başladığınız bir teklif formunu bulduk. Devam etmek mi, baştan başlamak mı
            istersiniz?
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onReset}>
              Baştan Başla
            </Button>
            <Button type="button" onClick={onResume}>
              Devam Et
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
