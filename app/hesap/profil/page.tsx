import { getCurrentProfile } from '@/lib/auth/server';
import { ProfileEditForm } from '@/components/account/profile-edit-form';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const profile = await getCurrentProfile();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Profil</h1>
        <p className="text-sm text-[var(--color-text-muted)]">E-posta: {profile?.email}</p>
      </header>
      <ProfileEditForm initial={{ name: profile?.name ?? '', phone: profile?.phone ?? '' }} />
    </div>
  );
}
