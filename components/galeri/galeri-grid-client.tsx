'use client';

import * as React from 'react';
import { FilterTabs } from './filter-tabs';
import { ProjectCard } from './project-card';
import { filterProjectsByType, type ProjectTypeFilter } from '@/lib/db/queries/projects-helpers';
import type { Project } from '@/lib/db/types';

export function GaleriGridClient({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = React.useState<ProjectTypeFilter>('all');
  const filtered = filterProjectsByType(projects, filter);
  return (
    <div className="space-y-8">
      <FilterTabs value={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Bu kategoride henüz proje yok.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
