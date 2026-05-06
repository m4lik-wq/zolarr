import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-7xl font-bold text-[var(--color-brand)]">404</p>
      <h1 className="mt-6 font-display text-2xl font-semibold">Ürün bulunamadı</h1>
      <p className="mt-2 max-w-md text-[var(--color-text-muted)]">
        Aradığınız ürün kaldırılmış olabilir. Mağaza ana sayfasından tekrar deneyin.
      </p>
      <Button asChild className="mt-6">
        <Link href="/magaza">Mağazaya Dön</Link>
      </Button>
    </div>
  );
}
