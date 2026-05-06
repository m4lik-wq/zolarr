import { formatTry } from '@/lib/utils/price';
import type { UserQuote } from '@/lib/db/types';

const STATUS_LABEL: Record<UserQuote['status'], string> = {
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  quoted: 'Teklif verildi',
  won: 'Kazandı',
  lost: 'Kapandı',
};

const LOCATION_LABEL: Record<string, string> = {
  roof: 'Çatı',
  roof_flat: 'Düz çatı',
  land: 'Arazi',
  carport: 'Carport',
  facade: 'Cephe',
};

export function QuoteListItem({ quote }: { quote: UserQuote }) {
  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-sm text-[var(--color-brand)]">{quote.quoteNumber}</p>
        <p className="font-medium">{quote.city} · {LOCATION_LABEL[quote.installationLocation] ?? quote.installationLocation}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{new Date(quote.createdAt).toLocaleDateString('tr-TR')}</p>
      </div>
      <div className="text-right text-sm">
        <p className="rounded-full bg-[var(--color-brand)]/15 px-3 py-1 text-xs font-medium text-[var(--color-brand)] inline-block">{STATUS_LABEL[quote.status]}</p>
        {quote.estimatedKwp !== null && (
          <p className="mt-1 font-mono">{quote.estimatedKwp.toFixed(2)} kWp</p>
        )}
        {quote.estimatedSavingsTry !== null && (
          <p className="text-xs text-[var(--color-text-muted)]">~ {formatTry(quote.estimatedSavingsTry)}/yıl</p>
        )}
      </div>
    </div>
  );
}
