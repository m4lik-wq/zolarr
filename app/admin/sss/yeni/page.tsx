import { FaqForm } from '@/components/admin/faq-form';

export const dynamic = 'force-dynamic';

export default function YeniSssPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Yeni SSS</h1>
      <FaqForm mode="create" />
    </div>
  );
}
