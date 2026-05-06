import { listRelatedProjects } from '@/lib/db/queries/projects';
import { ProjectCard } from './project-card';
import type { Project } from '@/lib/db/types';

interface Props {
  type: Project['type'];
  excludeSlug: string;
}

export async function RelatedProjects({ type, excludeSlug }: Props) {
  const projects = await listRelatedProjects(type, excludeSlug, 3);
  if (projects.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold">Benzer Projeler</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  );
}
