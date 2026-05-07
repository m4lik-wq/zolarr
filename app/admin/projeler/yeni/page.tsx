import { ProjectForm } from '@/components/admin/project-form';

export const dynamic = 'force-dynamic';

export default function YeniProjePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Yeni Proje</h1>
      <ProjectForm mode="create" />
    </div>
  );
}
