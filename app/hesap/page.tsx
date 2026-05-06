import { getCurrentProfile } from '@/lib/auth/server';
import Link from 'next/link';
import { FileText, Heart, Bell, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TILES = [
  { href: '/hesap/profil', label: 'Profil', desc: 'Ad, telefon ve şifre', icon: User },
  { href: '/hesap/teklifler', label: 'Tekliflerim', desc: 'Geçmiş teklif talepleri', icon: FileText },
  { href: '/hesap/favoriler', label: 'Favorilerim', desc: 'Beğendiğiniz ürünler', icon: Heart },
  { href: '/hesap/bildirimler', label: 'Bildirimler', desc: 'Stok geldiğinde haber ver', icon: Bell },
];

export default async function HesapPage() {
  const profile = await getCurrentProfile();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Merhaba {profile?.name ?? profile?.email}</h1>
        <p className="text-[var(--color-text-muted)]">Hesap genel bakışı.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="glass rounded-2xl p-5 transition-all hover:border-[var(--color-brand)]/40">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
              <t.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-3 font-display text-lg font-semibold">{t.label}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
