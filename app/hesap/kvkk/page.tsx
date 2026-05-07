import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function HesapKvkkPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/giris?next=/hesap/kvkk');
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header>
        <Link href="/hesap" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]">← Hesabım</Link>
        <h1 className="mt-2 font-display text-2xl font-bold">Verilerim ve Hesabım (KVKK)</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          KVKK kapsamında haklarınızı buradan kullanabilirsiniz. Detaylı bilgi için{' '}
          <Link href="/kvkk" className="text-[var(--color-brand)] hover:underline">KVKK Aydınlatma Metni</Link>&apos;ne bakın.
        </p>
      </header>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">Verilerimi indir</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Tüm Zolarr hesap verilerinizi (profil, adresler, favoriler, teklif kayıtları, stok uyarıları) JSON formatında indirin.
        </p>
        <a
          href="/api/kvkk/verilerimi-indir"
          className="inline-flex h-10 items-center rounded-2xl bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-bg-base)] hover:opacity-90"
        >
          İndir (JSON)
        </a>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3 border border-[var(--color-danger)]/30">
        <h2 className="font-display text-lg font-semibold text-[var(--color-danger)]">Hesabımı sil</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Bu işlem <strong>geri alınamaz</strong>. Profil + adresler + favoriler + stok uyarılarınız tamamen silinir.
          Teklif kayıtları arşiv için saklanır ancak kullanıcı bilgisi anonimleşir.
        </p>
        <Link
          href="/hesap/kvkk/sil"
          className="inline-flex h-10 items-center rounded-2xl border border-[var(--color-danger)] px-4 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
        >
          Hesap silme sayfasına git
        </Link>
      </section>
    </div>
  );
}
