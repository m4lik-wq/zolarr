import { ProductForm } from '@/components/admin/product-form';
import { getAllCategories } from '@/lib/db/queries/categories';

export const dynamic = 'force-dynamic';

export default async function YeniUrunPage() {
  const cats = await getAllCategories();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Yeni Ürün</h1>
      <ProductForm mode="create" categories={cats} />
    </div>
  );
}
