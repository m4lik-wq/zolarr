import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getFeaturedProducts } from '@/lib/db/queries/products';
import { formatTry } from '@/lib/utils/price';

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(6);
  if (products.length === 0) return null;
  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-elevated)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-gold)] font-mono mb-3">
              ── Magazadan
            </p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.1]">
              One cikan urunler
            </h2>
          </div>
          <Link
            href="/magaza"
            className="hidden md:inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
          >
            Tumunu gor <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
            return (
              <Link
                key={p.id}
                href={`/magaza/${p.slug}`}
                className="group flex flex-col rounded-3xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-base)] hover:border-[var(--color-brand)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-overlay)]">
                  {firstImage ? (
                    <Image
                      src={firstImage}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]">
                      <span className="font-mono text-xs">Gorsel yok</span>
                    </div>
                  )}
                  {p.is_featured && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[var(--color-warm-gold)] text-[var(--color-bg-base)] text-xs font-mono uppercase tracking-wider">
                      One cikan
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  {p.brand && (
                    <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1 font-mono">
                      {p.brand}
                    </p>
                  )}
                  <h3 className="font-display text-xl mb-3 group-hover:text-[var(--color-brand)] transition-colors">
                    {p.name}
                  </h3>
                  <div className="mt-auto flex items-baseline justify-between pt-4 border-t border-[var(--color-border-glass)]">
                    <span className="font-mono text-xl text-[var(--color-brand)]">
                      {formatTry(p.price)}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {p.stock > 0 ? `${p.stock} stokta` : 'Tukendi'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/magaza"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-brand)]"
          >
            Tum urunleri gor <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
