import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { listUserQuotes } from '@/lib/db/queries/user-quotes';
import { QuoteListItem } from '@/components/account/quote-list-item';

export const dynamic = 'force-dynamic';

export default async function TekliflerPage() {
  const quotes = await listUserQuotes();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Tekliflerim</h1>
        <Button asChild><Link href="/teklif/al">Yeni Teklif</Link></Button>
      </header>
      {quotes.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">Henüz teklif talebiniz yok.</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => <QuoteListItem key={q.id} quote={q} />)}
        </div>
      )}
    </div>
  );
}
