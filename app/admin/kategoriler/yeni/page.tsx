import { CategoryForm } from '@/components/admin/category-form';
import { listAdminCategories } from '@/lib/db/queries/admin/categories';

export const dynamic = 'force-dynamic';

export default async function YeniKategoriPage() {
  const cats = await listAdminCategories();
  const parents = cats.filter((c) => c.parent_id === null);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Yeni Kategori</h1>
      <CategoryForm mode="create" parents={parents} />
    </div>
  );
}
