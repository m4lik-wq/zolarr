import { notFound } from 'next/navigation';
import { getAdminProduct } from '@/lib/db/queries/admin/products';
import { getAllCategories } from '@/lib/db/queries/categories';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UrunDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAllCategories(),
  ]);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{product.name}</h1>
      <ProductForm
        mode="edit"
        initial={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          shortDescription: product.short_description ?? '',
          description: product.description ?? '',
          categoryId: product.category_id,
          brand: product.brand ?? '',
          sku: product.sku ?? '',
          price: product.price,
          discountPrice: product.discount_price,
          stock: product.stock,
          trackStock: product.track_stock,
          isActive: product.is_active,
          isFeatured: product.is_featured,
          images: product.images,
          videos: product.videos,
          pdfs: product.pdfs,
          tags: product.tags,
          warrantyYears: product.warranty_years,
        }}
        categories={categories}
      />
    </div>
  );
}
