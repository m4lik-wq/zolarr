import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSavingsWidget } from './hero-savings-widget';

export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-[var(--color-border-glass)] py-16 sm:py-24"
      aria-labelledby="hero-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={600}
          height={600}
          className="opacity-[0.04] dark:opacity-[0.06]"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-[var(--color-brand-glow)] blur-3xl"
      />

      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-glass)] bg-[var(--color-bg-glass)] px-4 py-1 text-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]" />
            Anahtar teslim güneş enerjisi
          </span>
          <h1
            id="hero-heading"
            className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          >
            Güneşten geleceğe — <span className="text-[var(--color-brand)]">Zolarr</span> ile.
          </h1>
          <p className="max-w-xl text-lg text-[var(--color-text-muted)]">
            Türkiye&apos;nin her yerinde konut, ticari ve tarımsal güneş enerjisi sistemleri.
            Keşiften kuruluma ve 25 yıl üretim garantisine kadar tek elden.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/teklif/al">
                Ücretsiz teklif al
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="#tasarruf">
                <Calculator className="h-5 w-5" />
                Tasarrufumu hesapla
              </Link>
            </Button>
          </div>
        </div>

        <div id="tasarruf">
          <HeroSavingsWidget />
        </div>
      </div>
    </section>
  );
}
