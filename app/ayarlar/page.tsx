import type { Metadata } from 'next';
import { ThemeSection } from '@/components/ayarlar/theme-section';
import { CookieSection } from '@/components/ayarlar/cookie-section';
import { SocialSection } from '@/components/ayarlar/social-section';
import { ContactInfoSection } from '@/components/ayarlar/contact-info-section';
import { LegalSection } from '@/components/ayarlar/legal-section';
import { AuthDeferredSection } from '@/components/ayarlar/auth-deferred-section';

export const metadata: Metadata = {
  title: 'Ayarlar | Zolarr',
  description: 'Tema, çerezler, iletişim bilgileri ve hesap ayarları.',
};

export default function AyarlarPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Ayarlar</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">Tercihlerinizi yönetin.</p>
      </header>
      <AuthDeferredSection title="Hesap Bilgileri" description="Ad, soyad, telefon ve şifre değiştirme." />
      <ThemeSection />
      <AuthDeferredSection title="Bildirimler" description="E-posta ve push bildirim tercihleri." />
      <CookieSection />
      <SocialSection />
      <ContactInfoSection />
      <LegalSection />
    </div>
  );
}
