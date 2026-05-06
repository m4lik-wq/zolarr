import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/lib/db/types';

const TYPE_LABEL: Record<Project['type'], string> = {
  konut: 'Konut',
  ticari: 'Ticari',
  tarim: 'Tarımsal',
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/galeri/${project.slug}`}
      className="glass group overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand)]/40 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-brand)]/90 px-3 py-1 text-xs font-medium text-[var(--color-bg-base)]">
          {TYPE_LABEL[project.type]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold">{project.title}</h3>
        <p className="text-sm text-[var(--color-text-muted)]">{project.location}</p>
        <p className="mt-2 font-mono text-sm text-[var(--color-brand)]">{project.capacityKwp} kWp</p>
      </div>
    </Link>
  );
}
