import { SupplierForm } from '@/components/admin/supplier-form';
import { listAdapters } from '@/lib/suppliers/registry';

export const dynamic = 'force-dynamic';

export default function YeniTedarikciPage() {
  const adapters = listAdapters().map((a) => ({ slug: a.slug, displayName: a.displayName }));
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Yeni Tedarikçi</h1>
      <SupplierForm mode="create" adapters={adapters} />
    </div>
  );
}
