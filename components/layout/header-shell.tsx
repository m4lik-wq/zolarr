'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
}

export function HeaderShell({ children }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full transition-all duration-300',
        scrolled ? 'glass border-b border-[var(--color-border-glass)]' : 'bg-transparent'
      )}
    >
      {children}
    </header>
  );
}
