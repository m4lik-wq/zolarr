import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum | Zolarr',
};

export default function SifremiUnuttumPage() {
  return (
    <AuthCard
      title="Şifremi Unuttum"
      subtitle="E-posta adresinize sıfırlama bağlantısı göndereceğiz."
      footer={
        <span>
          <Link href="/giris" className="font-medium text-[var(--color-brand)] hover:underline">
            Giriş sayfasına dön
          </Link>
        </span>
      }
    >
      <PasswordResetRequestForm />
    </AuthCard>
  );
}
