import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  title: string;
  value: number;
  href: string;
  icon: LucideIcon;
}

export function KpiCard({ title, value, href, icon: Icon }: Props) {
  return (
    <Link href={href} className="glass rounded-2xl p-5 transition-all hover:border-[var(--color-brand)]/40">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">{title}</span>
        <Icon className="h-5 w-5 text-[var(--color-brand)]" />
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value.toLocaleString('tr-TR')}</p>
    </Link>
  );
}
