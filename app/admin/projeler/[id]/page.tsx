import { notFound } from 'next/navigation';
import { getAdminProject } from '@/lib/db/queries/admin/projects';
import { ProjectForm } from '@/components/admin/project-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjeDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const project = await getAdminProject(id);
  if (!project) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{project.title}</h1>
      <ProjectForm
        mode="edit"
        initial={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          type: project.type,
          location: project.location,
          capacityKwp: project.capacityKwp,
          coverImage: project.coverImage,
          description: project.description ?? '',
          beforeImage: project.beforeImage,
          afterImage: project.afterImage,
          galleryImages: project.galleryImages,
          productSlugs: project.productSlugs,
          customerQuote: project.customerQuote ?? '',
          customerName: project.customerName ?? '',
          annualSavingsTry: project.annualSavingsTry,
          completionDate: project.completionDate,
          isPublished: project.isPublished,
          sortOrder: project.sortOrder,
        }}
      />
    </div>
  );
}
