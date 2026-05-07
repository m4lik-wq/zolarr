import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminContactMessage } from '@/lib/db/queries/admin/contact-messages';
import { ContactStatusForm } from '@/components/admin/contact-status-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminIletisimDetayPage({ params }: PageProps) {
  const { id } = await params;
  const message = await getAdminContactMessage(id);
  if (!message) notFound();

  const replySubject = message.subject ? `Re: ${message.subject}` : 'Re: İletişim mesajınız';
  const mailtoHref = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(replySubject)}`;
  const mailtoSimple = `mailto:${encodeURIComponent(message.email)}`;

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/iletisim"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
        >
          ← Listeye dön
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{message.messageNumber}</h1>
      </header>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">Gönderen</h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-muted)]">İsim</dt>
            <dd className="text-right">{message.name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-muted)]">E-posta</dt>
            <dd className="text-right">
              <a href={mailtoSimple} className="hover:underline">
                {message.email}
              </a>
            </dd>
          </div>
          {message.phone && (
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--color-text-muted)]">Telefon</dt>
              <dd className="text-right">
                <a href={`tel:${encodeURIComponent(message.phone)}`} className="hover:underline">
                  {message.phone}
                </a>
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-muted)]">Tarih</dt>
            <dd className="text-right">
              {new Date(message.createdAt).toLocaleString('tr-TR')}
            </dd>
          </div>
        </dl>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">{message.subject ?? 'Konu yok'}</h2>
        <p className="whitespace-pre-wrap text-sm">{message.body}</p>
        <div>
          <a
            href={mailtoHref}
            className="inline-flex h-10 items-center rounded-2xl bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-bg)] hover:opacity-90"
          >
            Yanıtla
          </a>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Yönetim</h2>
        <ContactStatusForm message={message} />
      </section>
    </div>
  );
}
