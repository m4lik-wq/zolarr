import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">Aradığınız sayfaya erişiminiz yok.</p>
      <Button asChild className="mt-6"><Link href="/">Ana sayfaya dön</Link></Button>
    </div>
  );
}
