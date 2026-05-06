import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeSection } from '@/components/ayarlar/theme-section';
import { CookieSection } from '@/components/ayarlar/cookie-section';
import { SocialSection } from '@/components/ayarlar/social-section';
import { ContactInfoSection } from '@/components/ayarlar/contact-info-section';
import { LegalSection } from '@/components/ayarlar/legal-section';
import { AuthDeferredSection } from '@/components/ayarlar/auth-deferred-section';
import { SectionCard } from '@/components/ayarlar/section-card';
import { getCurrentUser } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Ayarlar | Zolarr',
  description: 'Tema, çerezler, iletişim bilgileri ve hesap ayarları.',
};

export default async function AyarlarPage() {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Ayarlar</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">Tercihlerinizi yönetin.</p>
      </header>
      {user ? (
        <SectionCard title="Hesap Bilgileri">
          <p className="text-sm text-[var(--color-text-muted)]">
            Ad, soyad, telefon ve şifre değiştirme.
          </p>
          <Link
            href="/hesap/profil"
            className="mt-3 inline-block rounded-full bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Profili düzenle
          </Link>
        </SectionCard>
      ) : (
        <AuthDeferredSection
          title="Hesap Bilgileri"
          description="Bu özelliği kullanmak için /giris sayfasından oturum açın."
        />
      )}
      <ThemeSection />
      {user ? (
        <SectionCard title="Bildirimler">
          <p className="text-sm text-[var(--color-text-muted)]">
            Stok bildirimleri ve e-posta tercihleri.
          </p>
          <Link
            href="/hesap/bildirimler"
            className="mt-3 inline-block rounded-full bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Bildirimleri yönet
          </Link>
        </SectionCard>
      ) : (
        <AuthDeferredSection
          title="Bildirimler"
          description="Bu özelliği kullanmak için /giris sayfasından oturum açın."
        />
      )}
      <CookieSection />
      <SocialSection />
      <ContactInfoSection />
      <LegalSection />
    </div>
  );
}
