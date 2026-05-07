import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth/server';
import { EmailPreferencesForm } from '@/components/settings/email-preferences-form';

export const dynamic = 'force-dynamic';

export default async function EpostaTercihleriPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/giris?next=/ayarlar/eposta');
  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <header>
        <Link
          href="/ayarlar"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
        >
          ← Ayarlar
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">E-posta Tercihleri</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Hangi tür e-postaları almak istediğinizi seçin. Onay e-postaları (kayıt, teklif alındı
          vb.) ayardan bağımsızdır.
        </p>
      </header>
      <EmailPreferencesForm initial={profile.emailPreferences} />
    </div>
  );
}
