import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, Briefcase, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Teklif | Zolarr',
  description: 'Sistem için teklif alın veya bayi olarak başvurun.',
};

export default function TeklifLanding() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Hangi yoldan başlamak istersiniz?
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Müşteri olarak teklif alabilir veya bayi ağımıza katılabilirsiniz.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/teklif/al"
          className="glass group flex flex-col rounded-2xl p-8 transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40 hover:shadow-[var(--shadow-glow)]"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold">Teklif Al</h2>
          <p className="mb-6 flex-1 text-[var(--color-text-muted)]">
            Konutunuz, işyeriniz veya tarımınız için kişiye özel sistem teklifi alın. 7 kısa adım,
            24 saat içinde dönüş.
          </p>
          <span className="inline-flex items-center gap-1 text-[var(--color-brand)] transition-transform group-hover:translate-x-1">
            Sihirbazı başlat <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          href="/teklif/ver"
          className="glass group flex flex-col rounded-2xl p-8 transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40 hover:shadow-[var(--shadow-glow)]"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <Briefcase className="h-7 w-7" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold">Bayi Başvurusu</h2>
          <p className="mb-6 flex-1 text-[var(--color-text-muted)]">
            Zolarr bayi ağına katılarak güneş enerjisi sektöründe büyüyün. Firma + yetkili
            bilgilerinizi paylaşın.
          </p>
          <span className="inline-flex items-center gap-1 text-[var(--color-brand)] transition-transform group-hover:translate-x-1">
            Başvuru formu <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
