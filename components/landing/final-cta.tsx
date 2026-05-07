import Link from 'next/link';
import { ArrowRight, Sun } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="relative py-24 md:py-40 overflow-hidden bg-[var(--color-deep-sky)] text-white">
      {/* Sun-like radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[140%] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-warm-gold)_0%,_transparent_55%)] opacity-15" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <Sun className="h-12 w-12 text-[var(--color-warm-gold)] mx-auto mb-8" strokeWidth={1.5} />
          <h2 className="font-display text-5xl md:text-7xl leading-[1.05] mb-8">
            Bugün başlayın,{' '}
            <span className="italic text-[var(--color-brand)]">yarın</span>{' '}
            tasarruf edin.
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            Çatı ölçümü ücretsiz. Tasarım ücretsiz. Sadece sonuç görüyorsunuz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/teklif/al"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-[var(--color-brand)] text-[var(--color-bg-base)] font-medium hover:bg-[var(--color-brand-dark)] hover:shadow-[var(--shadow-glow)] transition-all"
            >
              Ücretsiz teklif al <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Bizi arayın
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
