import { getEmbeddingStats } from '@/lib/db/queries/admin/embeddings';
import { getEmbeddingProvider } from '@/lib/ai/embeddings';
import { ReindexButton } from '@/components/admin/reindex-button';

export const dynamic = 'force-dynamic';

export default async function AdminAiPage() {
  const stats = await getEmbeddingStats();
  const provider = getEmbeddingProvider();
  const isReady = provider.slug !== 'null';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">AI Bilgi Tabanı</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          AI Asistan&apos;ın ürün katalogu, projeler ve SSS bilgilerinden referans
          alabilmesi için embedding (vektör) tabanı.
        </p>
      </header>

      {!isReady && (
        <div className="rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 p-4">
          <p className="text-sm">
            <strong>API anahtarı eksik.</strong> Embedding sağlayıcısı:{' '}
            <code className="font-mono">{provider.slug}</code>. Voyage AI anahtarınızı{' '}
            <code className="font-mono">.env.local</code>&apos;a{' '}
            <code className="font-mono">VOYAGE_API_KEY</code> olarak ekleyip sunucuyu
            yeniden başlatın. Ardından &quot;Yeniden indeksle&quot; butonu ile başlatın.
          </p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Toplam embedding" value={stats.total} />
        <Card label="Ürün" value={stats.byType.product} />
        <Card label="Proje" value={stats.byType.project} />
        <Card label="SSS" value={stats.byType.faq} />
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-base font-semibold">Yeniden indeksle</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Tüm ürün/proje/SSS kayıtlarını yeniden embed eder. Mevcut embedding&apos;ler
          üzerine yazılır (idempotent).
          {stats.lastIndexedAt && (
            <>
              {' '}Son indeksleme: {new Date(stats.lastIndexedAt).toLocaleString('tr-TR')}.
            </>
          )}
        </p>
        <ReindexButton />
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
