import { notFound } from 'next/navigation';
import { getAdminCampaign } from '@/lib/db/queries/admin/campaigns';
import { CampaignForm } from '@/components/admin/campaign-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KampanyaDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const campaign = await getAdminCampaign(id);
  if (!campaign) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{campaign.title}</h1>
      <CampaignForm
        mode="edit"
        initial={{
          id: campaign.id,
          title: campaign.title,
          subtitle: campaign.subtitle ?? '',
          ctaLabel: campaign.ctaLabel ?? '',
          ctaHref: campaign.ctaHref ?? '',
          bgImageUrl: campaign.bgImageUrl ?? '',
          startsAt: campaign.startsAt,
          endsAt: campaign.endsAt,
          isActive: campaign.isActive,
          sortOrder: campaign.sortOrder,
        }}
      />
    </div>
  );
}
