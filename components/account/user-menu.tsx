import Link from 'next/link';
import { User, LogIn, UserPlus, LogOut, FileText, Heart, Bell, Settings } from 'lucide-react';
import { signOutAction } from '@/lib/auth/actions';
import { getCurrentProfile } from '@/lib/auth/server';
import { AdminLink } from './admin-link';

export async function UserMenu() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link href="/giris" className="inline-flex items-center gap-1.5 text-sm hover:text-[var(--color-brand)]">
          <LogIn className="h-4 w-4" /> Giriş
        </Link>
        <Link href="/kayit" className="inline-flex items-center gap-1.5 rounded-2xl bg-[var(--color-brand)] px-3 py-1.5 text-sm text-[var(--color-bg-base)] hover:bg-[var(--color-brand-dark)]">
          <UserPlus className="h-4 w-4" /> Kayıt
        </Link>
      </div>
    );
  }

  return (
    <details className="relative">
      <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm hover:border-[var(--color-brand)]/40">
        <User className="h-4 w-4" />
        <span className="hidden max-w-[120px] truncate sm:inline">{profile.name ?? profile.email}</span>
      </summary>
      <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2 shadow-[var(--shadow-glass)]">
        <MenuLink href="/hesap" icon={User}>Hesabım</MenuLink>
        <MenuLink href="/hesap/teklifler" icon={FileText}>Tekliflerim</MenuLink>
        <MenuLink href="/hesap/favoriler" icon={Heart}>Favorilerim</MenuLink>
        <MenuLink href="/hesap/bildirimler" icon={Bell}>Bildirimler</MenuLink>
        <MenuLink href="/ayarlar" icon={Settings}>Ayarlar</MenuLink>
        <AdminLink role={profile.role} />
        <form action={signOutAction}>
          <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-bg-overlay)]">
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </button>
        </form>
      </div>
    </details>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[var(--color-bg-overlay)]">
      <Icon className="h-4 w-4" /> {children}
    </Link>
  );
}
