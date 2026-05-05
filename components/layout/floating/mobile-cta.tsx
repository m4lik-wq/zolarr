'use client';

import Link from 'next/link';
import { Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/constants';

export function MobileCta() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden glass border-t border-[var(--color-border-glass)] p-3">
      <div className="flex gap-2">
        <Button asChild size="md" className="flex-1">
          <Link href="/teklif/al">
            <Sparkles className="h-4 w-4" />
            Ücretsiz Teklif Al
          </Link>
        </Button>
        <Button asChild variant="secondary" size="md">
          <a href={`tel:${CONTACT.phone}`} aria-label="Bizi ara">
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
