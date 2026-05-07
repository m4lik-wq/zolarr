import { CountUp } from '@/components/ui/count-up';
import { getImpactStats } from '@/lib/db/queries/impact-stats';

export async function ImpactCounter() {
  const s = await getImpactStats();
  return (
    <section className="relative py-24 md:py-32 bg-[var(--color-deep-sky)] text-white overflow-hidden">
      {/* Decorative warm-gold gradient orb */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--color-warm-gold)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[var(--color-brand)]/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-3xl mb-12 md:mb-20">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-gold)] font-mono mb-4">
            ── Etkimiz
          </p>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.1]">
            Sayılarla{' '}
            <span className="italic text-[var(--color-warm-gold)]">Zolarr</span>.
          </h2>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <Stat
            value={s.installations}
            suffix="+"
            label="Tamamlanan kurulum"
          />
          <Stat
            value={Math.round(s.totalKwp)}
            suffix=" kWp"
            label="Kurulu güç"
          />
          <Stat
            value={Math.round(s.totalKwhPerYear / 1000)}
            suffix="K kWh"
            label="Yıllık üretim"
          />
          <Stat
            value={Math.round(s.co2SavedTons)}
            suffix=" ton"
            label="CO₂ tasarrufu / yıl"
          />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div className="border-l-2 border-[var(--color-warm-gold)] pl-5">
      <div className="font-display text-5xl md:text-6xl text-white mb-2 leading-none">
        <CountUp value={value} />
        <span className="text-2xl md:text-3xl text-[var(--color-warm-gold)] ml-1">{suffix}</span>
      </div>
      <div className="text-sm text-white/60 uppercase tracking-wider">{label}</div>
    </div>
  );
}
