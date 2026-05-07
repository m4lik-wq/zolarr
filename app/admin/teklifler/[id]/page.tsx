import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminQuote } from '@/lib/db/queries/admin/quotes';
import { QuoteStatusForm } from '@/components/admin/quote-status-form';
import { formatTry } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTeklifDetayPage({ params }: PageProps) {
  const { id } = await params;
  const quote = await getAdminQuote(id);
  if (!quote) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/teklifler"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
        >
          ← Listeye dön
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{quote.quoteNumber}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">Müşteri Bilgileri</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">İsim</dt>
              <dd>{quote.contactName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-text-muted)]">Telefon</dt>
              <dd className="flex gap-2">
                <a href={`tel:${quote.contactPhone}`} className="hover:underline">
                  {quote.contactPhone}
                </a>
                <a
                  href={`https://wa.me/${quote.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-500 hover:bg-green-500/25"
                >
                  WhatsApp
                </a>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">E-posta</dt>
              <dd>
                <a href={`mailto:${quote.contactEmail}`} className="hover:underline">
                  {quote.contactEmail}
                </a>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Şehir</dt>
              <dd>
                {quote.city}
                {quote.district ? ` / ${quote.district}` : ''}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Lokasyon</dt>
              <dd>{quote.installationLocation}</dd>
            </div>
          </dl>
        </section>

        <section className="glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">Hesaplama Tahmini</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Sistem boyutu</dt>
              <dd className="font-mono">
                {quote.estimatedKwp ? `${quote.estimatedKwp.toFixed(2)} kWp` : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Yıllık tasarruf</dt>
              <dd>{quote.estimatedSavingsTry ? formatTry(quote.estimatedSavingsTry) : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Geri ödeme</dt>
              <dd>
                {quote.estimatedPaybackYears ? `~${quote.estimatedPaybackYears.toFixed(1)} yıl` : '—'}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {quote.appliances.length > 0 && (
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-3 font-display text-lg font-semibold">
            Cihazlar ({quote.appliances.length})
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {quote.appliances.map((a, i) => (
              <li
                key={i}
                className="rounded-xl border border-[var(--color-border)] p-3 text-sm"
              >
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {[
                    a.consumptionKwh && `${a.consumptionKwh} kWh/yıl`,
                    a.powerW && `${a.powerW}W`,
                    a.voltageV && `${a.voltageV}V`,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quote.description && (
        <section className="glass rounded-2xl p-6">
          <h2 className="mb-3 font-display text-lg font-semibold">Müşteri Açıklaması</h2>
          <p className="whitespace-pre-wrap text-sm">{quote.description}</p>
        </section>
      )}

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Yönetim</h2>
        <QuoteStatusForm quote={quote} />
      </section>
    </div>
  );
}
