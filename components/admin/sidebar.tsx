'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Building2, Mail, Users,
  Package, FolderTree, Sparkles, HelpCircle, Truck, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/teklifler', label: 'Teklifler', icon: FileText },
  { href: '/admin/bayiler', label: 'Bayi Başvuruları', icon: Building2 },
  { href: '/admin/iletisim', label: 'İletişim Mesajları', icon: Mail },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: Users },
  { href: '/admin/urunler', label: 'Ürünler', icon: Package },
  { href: '/admin/kategoriler', label: 'Kategoriler', icon: FolderTree },
  { href: '/admin/tedarikciler', label: 'Tedarikçiler', icon: Truck },
  { href: '/admin/projeler', label: 'Projeler', icon: Sparkles },
  { href: '/admin/sss', label: 'SSS', icon: HelpCircle },
];

export function AdminSidebar() {
  const path = usePathname();
  return (
    <nav aria-label="Admin menü" className="space-y-1">
      <Link href="/" className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-overlay)]">
        <ArrowLeft className="h-4 w-4" /> Site&apos;ye dön
      </Link>
      {ITEMS.map((it) => {
        const active = path === it.href || (it.href !== '/admin' && path.startsWith(it.href + '/'));
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
