'use client';

import Link from 'next/link';
import { User, Search } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileMenu } from './mobile-menu';
import { HeaderCartBadge } from './header-cart-badge';
import { NAV_LINKS } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
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
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-6">
        <Link href="/" aria-label="Zolarr Anasayfa">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-[var(--color-bg-overlay)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="icon" size="icon" aria-label="Ara" className="hidden md:inline-flex">
            <Search className="h-5 w-5" />
          </Button>
          <div className="hidden md:inline-flex">
            <ThemeToggle />
          </div>
          <Link href="/giris" aria-label="Hesabım" className="hidden md:inline-flex">
            <Button variant="icon" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <HeaderCartBadge />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
