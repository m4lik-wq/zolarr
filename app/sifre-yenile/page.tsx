import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { PasswordResetForm } from '@/components/auth/password-reset-form';

export const metadata: Metadata = {
  title: 'Şifre Yenile | Zolarr',
};

export default function SifreYenilePage() {
  return (
    <AuthCard title="Yeni Şifre Belirle" subtitle="Yeni şifrenizi girin.">
      <PasswordResetForm />
    </AuthCard>
  );
}
