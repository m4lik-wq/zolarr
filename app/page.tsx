import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-24 md:px-6">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
          Güneşten Geleceğe
        </h1>
        <p className="mt-6 text-lg text-[var(--color-text-muted)]">
          Zolarr ile güneş enerjisi sistemleri kurulumunda Türkiye&apos;nin güvenilir adresi.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/teklif/al">Ücretsiz Teklif Al</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/magaza">Mağazayı Keşfet</Link>
          </Button>
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardTitle>🏠 Konut</CardTitle>
          <CardDescription className="mt-2">
            Eviniz için kişiselleştirilmiş güneş enerjisi çözümleri.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>🏢 Ticari</CardTitle>
          <CardDescription className="mt-2">
            İşletmenize özel maliyet düşürücü güneş enerjisi sistemleri.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>🌾 Tarım</CardTitle>
          <CardDescription className="mt-2">
            Tarımsal sulama ve sera için ekonomik enerji çözümleri.
          </CardDescription>
        </Card>
      </section>

      <p className="mt-24 text-center text-sm text-[var(--color-text-muted)]">
        Bu geçici anasayfa Faz 2&apos;de tam tasarımla değiştirilecek.
      </p>
    </div>
  );
}
