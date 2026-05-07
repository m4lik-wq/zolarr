import Link from 'next/link';
import { Mail, Phone, MapPin, LogIn, UserPlus } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SITE, SOCIAL_LINKS, CONTACT } from '@/lib/constants';

// Brand icons (lucide-react v1.x does not include brand glyphs).
type IconProps = { className?: string };

function Instagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Linkedin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Twitter({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Youtube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

const QUICK_LINKS = [
  { href: '/', label: 'Anasayfa' },
  { href: '/magaza', label: 'E-Mağaza' },
  { href: '/teklif/al', label: 'Teklif Al' },
  { href: '/galeri', label: 'Galeri & Projeler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
  { href: '/sss', label: 'SSS' },
  { href: '/ayarlar', label: 'Ayarlar' },
];

const LEGAL_LINKS = [
  { href: '/kvkk', label: 'KVKK' },
  { href: '/gizlilik', label: 'Gizlilik Politikası' },
  { href: '/cerez-politikasi', label: 'Çerez Politikası' },
  { href: '/mesafeli-satis', label: 'Mesafeli Satış' },
  { href: '/sss', label: 'SSS' },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Logo size={40} />
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              {SITE.tagline}. Türkiye&apos;nin güvenilir güneş enerjisi sistemleri firması.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <Link href={SOCIAL_LINKS.instagram} aria-label="Instagram" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Instagram className="h-4 w-4" /></Button>
              </Link>
              <Link href={SOCIAL_LINKS.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Linkedin className="h-4 w-4" /></Button>
              </Link>
              <Link href={SOCIAL_LINKS.twitter} aria-label="X Twitter" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Twitter className="h-4 w-4" /></Button>
              </Link>
              <Link href={SOCIAL_LINKS.youtube} aria-label="YouTube" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Youtube className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-display font-semibold text-base mt-6 mb-3">Hesap</h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/giris"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
              >
                <LogIn className="h-4 w-4" /> Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
              >
                <UserPlus className="h-4 w-4" /> Kayıt Ol
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base mb-4">Yasal</h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base mb-4">İletişim</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-[var(--color-text-muted)]">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${CONTACT.phone}`} className="hover:text-[var(--color-brand)]">{CONTACT.phone}</a>
              </li>
              <li className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-[var(--color-brand)]">{CONTACT.email}</a>
              </li>
            </ul>
            <form className="mt-6">
              <label className="block text-sm font-medium mb-2">Bültene Kayıt</label>
              <div className="flex gap-2">
                <Input type="email" placeholder="E-posta" className="flex-1" />
                <Button type="submit" size="md">Kayıt</Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Zolarr. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
