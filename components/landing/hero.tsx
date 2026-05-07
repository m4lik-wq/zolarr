import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sun } from 'lucide-react';
import { SavingsCalculatorWidget } from './savings-calculator-widget';

const HERO_BG =
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=2400&q=80&auto=format&fit=crop';

export function Hero() {
  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={HERO_BG}
          alt="Solar farm at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dual gradient overlay: dark left for text legibility, transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-deep-sky)]/95 via-[var(--color-deep-sky)]/70 to-[var(--color-deep-sky)]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-32 pb-24 md:pt-40 md:pb-32 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
          {/* Left: editorial headline */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[var(--color-warm-gold)]/40 bg-[var(--color-warm-gold)]/10 backdrop-blur-sm">
              <Sun className="h-3.5 w-3.5 text-[var(--color-warm-gold)]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-warm-gold)] font-mono">
                Türkiye&apos;nin güneşi
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight font-light text-white mb-8">
              Faturanızdan kurtulun,
              <br />
              <span className="italic font-normal text-[var(--color-brand)]">
                geleceğinizi
              </span>{' '}
              kurun.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10">
              Çatınıza güneş paneli kurarak elektrik faturanızı %90&apos;a kadar azaltın.
              Ortalama 5-6 yılda yatırımınızı geri alın, sonrası kâr.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/teklif/al"
                className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-2xl bg-[var(--color-brand)] text-[var(--color-bg-base)] font-medium hover:bg-[var(--color-brand-dark)] hover:shadow-[var(--shadow-glow)] transition-all"
              >
                Ücretsiz keşif
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/galeri"
                className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Tamamladığımız projeler
              </Link>
            </div>
            {/* Bottom strip: trust metrics */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
              <Metric value="500+" label="Tamamlanan kurulum" />
              <Metric value="10 yıl" label="İşçilik garantisi" />
              <Metric value="TSE" label="Sertifikalı partner" />
            </div>
          </div>

          {/* Right: savings widget */}
          <div className="lg:justify-self-end w-full max-w-md mx-auto lg:mx-0">
            <SavingsCalculatorWidget />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l-2 border-[var(--color-warm-gold)] pl-3">
      <p className="font-display text-2xl md:text-3xl text-white">{value}</p>
      <p className="text-xs text-white/60 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
