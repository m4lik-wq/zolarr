import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/server';
import { deleteAccountAction } from '@/lib/server-actions/delete-account';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const ERR_MSG: Record<string, string> = {
  onay: 'Onay metni eşleşmiyor. Lütfen aynen yazın: HESABIMI SİL',
  silme: 'Hesap silinemedi. Lütfen daha sonra tekrar deneyin veya destekle iletişime geçin.',
};

export default async function HesapSilPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/giris?next=/hesap/kvkk/sil');
  const { error } = await searchParams;
  const errMsg = error ? ERR_MSG[error] : undefined;
  return (
    <div className="container mx-auto max-w-md px-4 py-8 space-y-4">
      <header>
        <Link href="/hesap/kvkk" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]">← Geri</Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-[var(--color-danger)]">Hesabımı sil</h1>
      </header>
      <div className="glass rounded-2xl p-6 space-y-4">
        <p className="text-sm">
          Bu işlem <strong>geri alınamaz</strong>. Onaylamak için aşağıdaki metni aynen yazın:
        </p>
        <p className="rounded-xl bg-[var(--color-bg-overlay)] p-3 font-mono text-center text-sm">HESABIMI SİL</p>
        {errMsg && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">{errMsg}</p>
        )}
        <form action={deleteAccountAction} className="space-y-4">
          <input
            name="confirm"
            required
            autoComplete="off"
            className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 font-mono"
            placeholder="HESABIMI SİL"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--color-danger)] px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Hesabımı kalıcı olarak sil
          </button>
        </form>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] text-center">
        Verileri silmeden önce <Link href="/api/kvkk/verilerimi-indir" className="text-[var(--color-brand)] hover:underline">verilerinizi indirebilirsiniz</Link>.
      </p>
    </div>
  );
}
