import { CampaignForm } from '@/components/admin/campaign-form';

export const dynamic = 'force-dynamic';

export default function YeniKampanyaPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Yeni Kampanya</h1>
      <CampaignForm mode="create" />
    </div>
  );
}
