import { listAdminUsers } from '@/lib/db/queries/admin/users';
import { getCurrentProfile } from '@/lib/auth/server';
import { RoleSelect } from '@/components/admin/role-select';

export const dynamic = 'force-dynamic';

export default async function AdminKullanicilarPage() {
  const [me, users] = await Promise.all([getCurrentProfile(), listAdminUsers()]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Kullanıcılar</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{users.length} kullanıcı</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Kayıt</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3">{u.name ?? '—'}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <RoleSelect user={u} isSelf={u.id === me?.id} />
                </td>
                <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Henüz kullanıcı yok.</p>
        )}
      </div>
    </div>
  );
}
