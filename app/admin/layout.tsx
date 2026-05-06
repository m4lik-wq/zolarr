import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentProfile } from '@/lib/auth/server';
import { AdminSidebar } from '@/components/admin/sidebar';

export const metadata: Metadata = {
  title: 'Admin Panel | Zolarr',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    notFound();
  }
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside><AdminSidebar /></aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
