import type { Metadata } from 'next';
import { AccountSidebar } from '@/components/account/account-sidebar';

export const metadata: Metadata = {
  title: 'Hesabım | Zolarr',
};

export default function HesapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <AccountSidebar />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
