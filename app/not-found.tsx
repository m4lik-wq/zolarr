import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-9xl font-bold text-[var(--color-brand)]">404</p>
      <h1 className="mt-6 font-display text-3xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-4 text-[var(--color-text-muted)] max-w-md">
        Aradığınız sayfa kaldırılmış olabilir veya hiç var olmamış olabilir.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Anasayfaya Dön</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/iletisim">İletişim</Link>
        </Button>
      </div>
    </div>
  );
}
