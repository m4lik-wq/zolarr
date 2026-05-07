'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function StickyCta() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setShow(window.scrollY > 800);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <Link
        href="/teklif/al"
        className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--color-brand)] text-[var(--color-bg-base)] font-medium shadow-2xl hover:bg-[var(--color-brand-dark)] hover:scale-105 transition-all"
      >
        Ücretsiz teklif al
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
