import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ValuesGrid } from '@/components/hakkimizda/values-grid';
import { TeamGrid } from '@/components/hakkimizda/team-grid';
import { BrandGrid } from '@/components/hakkimizda/brand-grid';
import { CountUp } from '@/components/ui/count-up';

export const metadata: Metadata = {
  title: 'Hakkımızda | Zolarr',
  description:
    'Zolarr — Türkiye’nin güneş enerjisi sistemleri firmasının hikayesi, ekibi ve değerleri.',
};

export default function HakkimizdaPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-16 px-4 py-12">
      <header>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Türkiye&apos;nin çatılarına güneş taşıyoruz
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
          2018&apos;de İzmir&apos;de küçük bir mühendislik ekibiyle başladık. Bugün konut,
          ticari ve tarımsal projelerde toplam 12 MW kapasiteye ulaştık.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">Vizyon</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Türkiye&apos;nin her köşesindeki çatıyı bir enerji üreticisine dönüştürmek;
            vatandaşların elektrik faturasından bağımsız, kendi enerjisini ürettiği bir
            geleceğin kapısını aralamak.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Misyon</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Erişilebilir, güvenilir ve estetik güneş enerjisi sistemleri sunmak. Her
            müşteriye keşiften 25 yıllık performansa kadar tek elden hizmet vermek.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Değerlerimiz</h2>
        <div className="mt-6">
          <ValuesGrid />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-bg-elevated)] p-8">
        <h2 className="text-center font-display text-2xl font-bold">Sayılarla Başarımız</h2>
        <div className="mt-6 grid gap-6 text-center sm:grid-cols-4">
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]">
              <CountUp value={500} suffix="+" />
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">Tamamlanan Kurulum</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]">
              <CountUp value={12} suffix=" MW" />
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">Toplam Kurulu Güç</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]">
              <CountUp value={7} suffix=" yıl" />
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">Sektör Tecrübesi</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-[var(--color-brand)]">
              <CountUp value={4500} suffix=" ton" />
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">CO₂ Tasarrufu</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Ekibimiz</h2>
        <div className="mt-6">
          <TeamGrid />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Çalıştığımız Markalar</h2>
        <div className="mt-6">
          <BrandGrid />
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--color-brand)]/5 p-10 text-center">
        <h2 className="font-display text-3xl font-bold">Bize katılın</h2>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Bayi olarak Zolarr ailesinde yer almak ister misiniz?
        </p>
        <Button asChild className="mt-6">
          <Link href="/teklif/ver">Bayi Başvurusu</Link>
        </Button>
      </section>
    </div>
  );
}
