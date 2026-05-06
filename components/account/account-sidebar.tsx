'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, FileText, Heart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/hesap', label: 'Genel', icon: User },
  { href: '/hesap/profil', label: 'Profil', icon: User },
  { href: '/hesap/teklifler', label: 'Tekliflerim', icon: FileText },
  { href: '/hesap/favoriler', label: 'Favorilerim', icon: Heart },
  { href: '/hesap/bildirimler', label: 'Bildirimler', icon: Bell },
];

export function AccountSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Hesap menüsü" className="space-y-1">
      {ITEMS.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                : 'hover:bg-[var(--color-bg-overlay)]'
            )}
          >
            <it.icon className="h-4 w-4" /> {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
