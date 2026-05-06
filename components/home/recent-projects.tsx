import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PROJECTS_MOCK } from '@/lib/data/projects-mock';

export function RecentProjects() {
  return (
    <section className="border-t border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 py-16" aria-labelledby="projects-heading">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="projects-heading" className="font-display text-3xl font-bold sm:text-4xl">Son projeler</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Konut, ticari ve tarımsal kurulumlardan örnekler.</p>
          </div>
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/galeri">
              Tüm projeleri gör
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS_MOCK.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/galeri/${p.slug}`}
                className="glass group block overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image src={p.coverImage} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--color-bg-base)]/80 px-3 py-1 font-mono text-xs">{p.type}</span>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-display text-base font-semibold">{p.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {p.location} · <span className="font-mono text-[var(--color-brand)]">{p.capacityKwp} kWp</span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="secondary">
            <Link href="/galeri">Tüm projeleri gör</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
