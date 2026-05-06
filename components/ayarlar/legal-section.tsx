import Link from 'next/link';
import { SectionCard } from './section-card';

const LINKS = [
  { href: '/yasal/kvkk', label: 'KVKK Metni' },
  { href: '/yasal/gizlilik', label: 'Gizlilik Politikası' },
  { href: '/yasal/mesafeli-satis', label: 'Mesafeli Satış Sözleşmesi' },
];

export function LegalSection() {
  return (
    <SectionCard title="Yasal" description="Yasal metinlere erişim ve veri talepleri.">
      <ul className="space-y-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-[var(--color-brand)] hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
        <li className="pt-2 text-sm text-[var(--color-text-muted)]">
          Verilerimi indir / Hesabımı sil işlemleri Faz 7&apos;de aktif olacak.
        </li>
      </ul>
    </SectionCard>
  );
}
