import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getActiveCampaign } from '@/lib/db/queries/campaigns';

export async function CampaignBanner() {
  const c = await getActiveCampaign();
  if (!c) return null;
  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="relative overflow-hidden rounded-3xl">
        {c.bgImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={c.bgImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-deep-sky)]/95 via-[var(--color-deep-sky)]/70 to-transparent" />
          </div>
        )}
        {!c.bgImageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-deep-sky)] via-[var(--color-deep-sky)] to-[var(--color-deep-sky)]/80" />
        )}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center px-8 py-12 md:px-16 md:py-20 min-h-[320px]">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-warm-gold)]/20 border border-[var(--color-warm-gold)]/40 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm-gold)] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-warm-gold)] font-mono">
                Kampanya
              </span>
            </span>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.1] mb-4">{c.title}</h2>
            {c.subtitle && (
              <p className="text-white/80 text-lg mb-6 max-w-xl">{c.subtitle}</p>
            )}
            {c.ctaHref && c.ctaLabel && (
              <Link
                href={c.ctaHref}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-[var(--color-brand)] text-[var(--color-bg-base)] font-medium hover:bg-[var(--color-brand-dark)] transition-colors"
              >
                {c.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
