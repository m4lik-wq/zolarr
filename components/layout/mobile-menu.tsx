'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NAV_LINKS } from '@/lib/constants';

export function MobileMenu() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="icon" size="icon" aria-label="Menüyü aç" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-[85vw] max-w-sm glass border-l border-[var(--color-border-glass)] p-6 data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="font-display font-semibold text-lg">Menü</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="icon" size="icon" aria-label="Kapat">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Dialog.Close asChild key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-2xl px-4 py-3 text-lg hover:bg-[var(--color-bg-overlay)] transition-colors"
                >
                  {link.label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-2">
            <ThemeToggle />
            <span className="text-sm text-[var(--color-text-muted)]">Tema</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
