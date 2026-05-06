import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Kayıt | Zolarr',
  description: 'Yeni hesap oluşturun.',
};

export default function KayitPage() {
  return (
    <AuthCard
      title="Hesap Oluştur"
      subtitle="Birkaç saniye içinde Zolarr&apos;a katılın."
      footer={
        <span>
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="font-medium text-[var(--color-brand)] hover:underline">
            Giriş yapın
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
