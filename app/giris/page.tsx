import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Giriş | Zolarr',
  description: 'Hesabınıza giriş yapın.',
};

export default function GirisPage() {
  return (
    <AuthCard
      title="Giriş Yap"
      subtitle="Hesabınızla giriş yaparak siparişlerinizi ve tekliflerinizi takip edin."
      footer={
        <span>
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="font-medium text-[var(--color-brand)] hover:underline">
            Kayıt olun
          </Link>
        </span>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
