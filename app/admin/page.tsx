import { FileText, Building2, Mail, Users, Bell } from 'lucide-react';
import { getDashboardStats, getRecentNotifications } from '@/lib/db/queries/admin/dashboard';
import { getCurrentProfile } from '@/lib/auth/server';
import { KpiCard } from '@/components/admin/kpi-card';
import { NotificationList } from '@/components/admin/notification-list';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [profile, stats, notifications] = await Promise.all([
    getCurrentProfile(),
    getDashboardStats(),
    getRecentNotifications(10),
  ]);
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Hoşgeldin, {profile?.name ?? profile?.email}</h1>
        <p className="text-[var(--color-text-muted)]">Yönetim paneli — bekleyen işler ve son aktivite.</p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Bekleyen</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard title="Yeni Teklif" value={stats.newQuotes} href="/admin/teklifler?status=new" icon={FileText} />
          <KpiCard title="Yeni Bayi" value={stats.newDealers} href="/admin/bayiler?status=new" icon={Building2} />
          <KpiCard title="Yeni Mesaj" value={stats.newContacts} href="/admin/iletisim?status=new" icon={Mail} />
          <KpiCard title="Toplam Üye" value={stats.totalUsers} href="/admin/kullanicilar" icon={Users} />
          <KpiCard title="Okunmamış Bildirim" value={stats.unreadNotifications} href="/admin" icon={Bell} />
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Son Bildirimler</h2>
        <NotificationList items={notifications} />
      </section>
    </div>
  );
}
