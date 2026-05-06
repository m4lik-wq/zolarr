import Link from 'next/link';
import { SectionCard } from './section-card';

export function AuthDeferredSection({ title, description }: { title: string; description: string }) {
  return (
    <SectionCard title={title}>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      <Link
        href="/giris"
        className="mt-3 inline-block rounded-full border border-[var(--color-brand)]/60 px-4 py-2 text-sm font-medium text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
      >
        Giriş yap
      </Link>
    </SectionCard>
  );
}
