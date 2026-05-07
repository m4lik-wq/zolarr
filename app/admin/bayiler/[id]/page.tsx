import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminDealer } from '@/lib/db/queries/admin/dealers';
import { DealerStatusForm } from '@/components/admin/dealer-status-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBayiDetayPage({ params }: PageProps) {
  const { id } = await params;
  const dealer = await getAdminDealer(id);
  if (!dealer) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/bayiler"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
        >
          ← Listeye dön
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{dealer.applicationNumber}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">Firma Bilgileri</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-text-muted)]">Firma adı</dt>
              <dd className="text-right">{dealer.companyName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-text-muted)]">Yetkili</dt>
              <dd className="text-right">{dealer.contactName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-text-muted)]">Telefon</dt>
              <dd className="flex gap-2">
                <a href={`tel:${encodeURIComponent(dealer.contactPhone)}`} className="hover:underline">
                  {dealer.contactPhone}
                </a>
                <a
                  href={`https://wa.me/${dealer.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-500 hover:bg-green-500/25"
                >
                  WhatsApp
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-text-muted)]">E-posta</dt>
              <dd className="text-right">
                <a href={`mailto:${encodeURIComponent(dealer.contactEmail)}`} className="hover:underline">
                  {dealer.contactEmail}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-text-muted)]">Tecrübe</dt>
              <dd className="text-right">
                {dealer.experienceYears !== null ? `${dealer.experienceYears} yıl` : '—'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">Hizmet Detayları</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-[var(--color-text-muted)]">Hizmet kategorileri</dt>
              <dd className="mt-1">
                {dealer.serviceCategories.length > 0 ? dealer.serviceCategories.join(', ') : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Hizmet bölgeleri</dt>
              <dd className="mt-1">
                {dealer.serviceAreas.length > 0 ? dealer.serviceAreas.join(', ') : '—'}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Yönetim</h2>
        <DealerStatusForm dealer={dealer} />
      </section>
    </div>
  );
}
