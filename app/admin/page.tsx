import { FileText, Building2, Mail, Users, Bell } from 'lucide-react';
import { getDashboardStats, getRecentNotifications } from '@/lib/db/queries/admin/dashboard';
import {
  quotesPerDay,
  dealersPerDay,
  contactsPerDay,
  signupsPerDay,
  topCitiesQuotes,
} from '@/lib/db/queries/admin/timeseries';
import { getCurrentProfile } from '@/lib/auth/server';
import { KpiCard } from '@/components/admin/kpi-card';
import { NotificationList } from '@/components/admin/notification-list';
import { ChartCard } from '@/components/admin/charts/chart-card';
import { TimeSeriesChart } from '@/components/admin/charts/time-series-chart';
import { CityBarChart } from '@/components/admin/charts/city-bar-chart';
import { RangePicker } from '@/components/admin/range-picker';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

const VALID_RANGES = [7, 30, 90];

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const { range: rangeStr } = await searchParams;
  const range = VALID_RANGES.includes(Number(rangeStr)) ? Number(rangeStr) : 30;

  const [profile, stats, notifications, quotes, dealers, contacts, signups, cities] = await Promise.all([
    getCurrentProfile(),
    getDashboardStats(),
    getRecentNotifications(8),
    quotesPerDay(range),
    dealersPerDay(range),
    contactsPerDay(range),
    signupsPerDay(range),
    topCitiesQuotes(range, 8),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Hoşgeldin, {profile?.name ?? profile?.email}</h1>
          <p className="text-[var(--color-text-muted)]">Yönetim paneli — bekleyen işler ve son aktivite.</p>
        </div>
        <RangePicker current={range} />
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

      <section className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Teklif talepleri" subtitle={`Son ${range} gün`}>
          <TimeSeriesChart data={quotes} />
        </ChartCard>
        <ChartCard title="Bayi başvuruları" subtitle={`Son ${range} gün`}>
          <TimeSeriesChart data={dealers} color="#3b82f6" />
        </ChartCard>
        <ChartCard title="İletişim mesajları" subtitle={`Son ${range} gün`}>
          <TimeSeriesChart data={contacts} color="#eab308" />
        </ChartCard>
        <ChartCard title="Yeni kayıtlar" subtitle={`Son ${range} gün`}>
          <TimeSeriesChart data={signups} color="#a855f7" />
        </ChartCard>
      </section>

      {cities.length > 0 && (
        <ChartCard title="En çok talep gelen şehirler" subtitle={`Son ${range} gün, ilk 8`}>
          <CityBarChart data={cities} />
        </ChartCard>
      )}

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Son Bildirimler</h2>
        <NotificationList items={notifications} />
      </section>
    </div>
  );
}
