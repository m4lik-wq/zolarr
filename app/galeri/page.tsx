import type { Metadata } from 'next';
import { listProjects } from '@/lib/db/queries/projects';
import { GaleriGridClient } from '@/components/galeri/galeri-grid-client';

export const metadata: Metadata = {
  title: 'Galeri | Zolarr',
  description: 'Türkiye genelinde tamamladığımız güneş enerjisi projeleri.',
};

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  const projects = await listProjects();
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Tamamlanan Projeler</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Konut, ticari ve tarımsal alanda Türkiye genelinde uyguladığımız sistemlerden örnekler.
        </p>
      </header>
      <GaleriGridClient projects={projects} />
    </div>
  );
}
