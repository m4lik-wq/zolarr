import Link from 'next/link';
import { listAdminQuotes } from '@/lib/db/queries/admin/quotes';
import { StatusBadge } from '@/components/admin/status-badge';
import type { AdminQuote } from '@/lib/db/types';

const STATUS_LABEL: Record<AdminQuote['status'], string> = {
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  quoted: 'Teklif verildi',
  won: 'Kazandı',
  lost: 'Kapandı',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminTekliflerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = (sp.status as AdminQuote['status']) || undefined;
  const quotes = await listAdminQuotes({ status });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Teklif Talepleri</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{quotes.length} kayıt</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-elevated)] text-left">
            <tr>
              <th className="px-4 py-3">Teklif No</th>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Şehir</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Tahmini kWp</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-t border-[var(--color-border-glass)]">
                <td className="px-4 py-3 font-mono text-[var(--color-brand)]">{q.quoteNumber}</td>
                <td className="px-4 py-3">{q.contactName}</td>
                <td className="px-4 py-3">{q.city}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={q.status} label={STATUS_LABEL[q.status]} />
                </td>
                <td className="px-4 py-3">
                  {q.estimatedKwp ? `${q.estimatedKwp.toFixed(2)} kWp` : '—'}
                </td>
                <td className="px-4 py-3">{new Date(q.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/teklifler/${q.id}`}
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-text-muted)]">Kayıt yok.</p>
        )}
      </div>
    </div>
  );
}
