import { notFound } from 'next/navigation';
import {
  getAdminCategory,
  listAdminCategories,
} from '@/lib/db/queries/admin/categories';
import { CategoryForm } from '@/components/admin/category-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KategoriDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const [category, allCats] = await Promise.all([
    getAdminCategory(id),
    listAdminCategories(),
  ]);
  if (!category) notFound();
  const parents = allCats.filter((c) => c.parent_id === null);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{category.name}</h1>
      <CategoryForm
        mode="edit"
        initial={{
          id: category.id,
          slug: category.slug,
          name: category.name,
          description: category.description ?? '',
          parentId: category.parent_id,
          icon: category.icon ?? '',
          sortOrder: category.sort_order,
        }}
        parents={parents}
      />
    </div>
  );
}
