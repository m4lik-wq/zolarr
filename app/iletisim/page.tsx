import type { Metadata } from 'next';
import { ContactForm } from '@/components/iletisim/contact-form';
import { MapsEmbed } from '@/components/iletisim/maps-embed';
import { ContactInfoCard } from '@/components/iletisim/contact-info-card';

export const metadata: Metadata = {
  title: 'İletişim | Zolarr',
  description: 'Zolarr ile iletişime geçin — adres, telefon, e-posta ve form.',
};

export default function IletisimPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">İletişim</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Sorularınız ve teklif talepleriniz için aşağıdaki formu doldurun veya doğrudan
          ulaşın.
        </p>
      </header>
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">Bize Yazın</h2>
          <ContactForm />
        </section>
        <aside className="space-y-8">
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Bize Ulaşın</h2>
            <ContactInfoCard />
          </section>
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Konum</h2>
            <MapsEmbed />
          </section>
        </aside>
      </div>
    </div>
  );
}
