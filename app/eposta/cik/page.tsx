import Link from 'next/link';
import { unsubscribeViaTokenAction } from '@/lib/server-actions/unsubscribe-via-token';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export const dynamic = 'force-dynamic';

const LABEL: Record<string, string> = {
  marketing: 'pazarlama',
  stock_alerts: 'stok bildirimleri',
  quote_status: 'teklif durum bildirimleri',
  dealer_status: 'bayi başvuru bildirimleri',
};

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <main className="container mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">E-posta Aboneliği</h1>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">Bağlantı eksik.</p>
      </main>
    );
  }
  const result = await unsubscribeViaTokenAction(token);
  return (
    <main className="container mx-auto max-w-md space-y-4 px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold">E-posta Aboneliği</h1>
      {result.ok ? (
        <>
          <p className="text-sm">
            <strong>{LABEL[result.category] ?? result.category}</strong> e-postalarından çıkış
            yapıldı.
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Tüm tercihleri yönetmek için{' '}
            <Link
              href="/ayarlar/eposta"
              className="text-[var(--color-brand)] hover:underline"
            >
              ayarlar sayfasına
            </Link>{' '}
            gidebilirsiniz.
          </p>
        </>
      ) : (
        <p className="text-sm text-[var(--color-danger)]">{result.error}</p>
      )}
    </main>
  );
}
