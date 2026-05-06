'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  open: boolean;
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onChangeIndex: (idx: number) => void;
}

export function Lightbox({ open, images, index, alt, onClose, onChangeIndex }: Props) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowLeft' && index > 0) onChangeIndex(index - 1);
      if (e.key === 'ArrowRight' && index < images.length - 1) onChangeIndex(index + 1);
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onChangeIndex, onClose]);

  const current = images[index];
  if (!current) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col">
          <Dialog.Title className="sr-only">Görsel önizleme</Dialog.Title>
          <header className="flex items-center justify-between p-4 text-white">
            <span className="text-sm">{index + 1} / {images.length}</span>
            <button type="button" onClick={onClose} aria-label="Kapat" className="rounded-full p-2 hover:bg-white/10">
              <X className="h-6 w-6" />
            </button>
          </header>
          <div className="relative flex-1">
            <Image src={current} alt={`${alt} ${index + 1}`} fill sizes="100vw" className="object-contain" />
            {index > 0 && (
              <button
                type="button"
                onClick={() => onChangeIndex(index - 1)}
                aria-label="Önceki"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {index < images.length - 1 && (
              <button
                type="button"
                onClick={() => onChangeIndex(index + 1)}
                aria-label="Sonraki"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
