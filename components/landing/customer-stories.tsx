import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { listProjects } from '@/lib/db/queries/projects';
import { formatTry } from '@/lib/utils/price';

export async function CustomerStories() {
  const projects = await listProjects();
  const featured = projects.slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mb-16 md:mb-24">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-gold)] font-mono mb-4">
            ── Musteri Hikayeleri
          </p>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.1]">
            Hayata gecirdigimiz{' '}
            <span className="italic text-[var(--color-brand)]">projeler</span>.
          </h2>
        </div>

        <div className="space-y-24 md:space-y-32">
          {featured.map((p, i) => {
            const reversed = i % 2 === 1;
            const trimmed =
              p.description && p.description.length > 240
                ? `${p.description.slice(0, 240)}...`
                : p.description;
            return (
              <article
                key={p.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  reversed ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--color-bg-elevated)]">
                  {p.coverImage ? (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] font-mono">
                      Gorsel yakinda
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-gold)] font-mono mb-3">
                    {p.location} · {p.type}
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl leading-tight mb-5">
                    {p.title}
                  </h3>
                  {trimmed && (
                    <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                      {trimmed}
                    </p>
                  )}
                  <dl className="grid grid-cols-2 gap-6 mb-6 max-w-md">
                    <div className="border-l-2 border-[var(--color-warm-gold)] pl-3">
                      <dt className="text-xs uppercase text-[var(--color-text-muted)] tracking-wider">
                        Kapasite
                      </dt>
                      <dd className="font-mono text-2xl text-[var(--color-brand)] mt-1">
                        {p.capacityKwp.toFixed(1)} <span className="text-sm">kWp</span>
                      </dd>
                    </div>
                    {p.annualSavingsTry !== null && (
                      <div className="border-l-2 border-[var(--color-warm-gold)] pl-3">
                        <dt className="text-xs uppercase text-[var(--color-text-muted)] tracking-wider">
                          Yillik tasarruf
                        </dt>
                        <dd className="font-mono text-2xl text-[var(--color-brand)] mt-1">
                          {formatTry(p.annualSavingsTry)}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {p.customerQuote && (
                    <blockquote className="font-display italic text-lg text-[var(--color-text-primary)] border-l-4 border-[var(--color-brand)] pl-5 my-6">
                      &ldquo;{p.customerQuote}&rdquo;
                      {p.customerName && (
                        <cite className="block text-sm not-italic text-[var(--color-text-muted)] mt-2">
                          — {p.customerName}
                        </cite>
                      )}
                    </blockquote>
                  )}
                  <Link
                    href={`/galeri/${p.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-[var(--color-brand)] hover:underline"
                  >
                    Projeyi incele <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
