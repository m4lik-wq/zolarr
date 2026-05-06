import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Calendar, MapPin, Zap } from 'lucide-react';
import { getProjectBySlug } from '@/lib/db/queries/projects';
import { BeforeAfterSlider } from '@/components/galeri/before-after-slider';
import { ProjectGallery } from '@/components/galeri/project-gallery';
import { RelatedProjects } from '@/components/galeri/related-projects';
import { Button } from '@/components/ui/button';
import { formatTry } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Proje Bulunamadı | Zolarr' };
  return {
    title: `${project.title} | Zolarr Galeri`,
    description: project.description?.slice(0, 160) ?? `${project.title} — ${project.location}`,
  };
}

const TYPE_LABEL = { konut: 'Konut', ticari: 'Ticari', tarim: 'Tarımsal' } as const;

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {project.beforeImage && project.afterImage ? (
        <BeforeAfterSlider before={project.beforeImage} after={project.afterImage} alt={project.title} />
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <Image src={project.coverImage} alt={project.title} fill sizes="100vw" className="object-cover" priority />
        </div>
      )}

      <header className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-[var(--color-brand)]/15 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
            {TYPE_LABEL[project.type]}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{project.title}</h1>
        </div>
        <Button asChild>
          <Link href="/teklif/al">Benzer bir teklif al <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </header>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4">
          <dt className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <MapPin className="h-4 w-4" /> Lokasyon
          </dt>
          <dd className="mt-1 font-medium">{project.location}</dd>
        </div>
        <div className="glass rounded-2xl p-4">
          <dt className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Zap className="h-4 w-4" /> Kapasite
          </dt>
          <dd className="mt-1 font-mono font-medium text-[var(--color-brand)]">{project.capacityKwp} kWp</dd>
        </div>
        {project.completionDate && (
          <div className="glass rounded-2xl p-4">
            <dt className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Calendar className="h-4 w-4" /> Tamamlanma
            </dt>
            <dd className="mt-1 font-medium">{new Date(project.completionDate).toLocaleDateString('tr-TR')}</dd>
          </div>
        )}
      </dl>

      {project.description && (
        <div className="prose prose-sm mt-8 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
        </div>
      )}

      {project.galleryImages.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Görseller</h2>
          <div className="mt-4">
            <ProjectGallery images={project.galleryImages} alt={project.title} />
          </div>
        </section>
      )}

      {project.customerQuote && (
        <blockquote className="mt-10 rounded-2xl border-l-4 border-[var(--color-brand)] bg-[var(--color-bg-elevated)] p-6">
          <p className="italic">&quot;{project.customerQuote}&quot;</p>
          {project.customerName && (
            <footer className="mt-2 text-sm text-[var(--color-text-muted)]">— {project.customerName}</footer>
          )}
        </blockquote>
      )}

      {project.annualSavingsTry !== null && (
        <div className="mt-10 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/5 p-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Yıllık tasarruf</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--color-brand)]">{formatTry(project.annualSavingsTry)}</p>
        </div>
      )}

      <RelatedProjects type={project.type} excludeSlug={project.slug} />
    </div>
  );
}
