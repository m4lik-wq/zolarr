import { SectionCard } from './section-card';

export function AuthDeferredSection({ title, description }: { title: string; description: string }) {
  return (
    <SectionCard title={title}>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      <p className="mt-2 inline-block rounded-full border border-dashed border-[var(--color-brand)]/40 px-3 py-1 text-xs text-[var(--color-brand)]">
        Faz 7&apos;de aktif olacak
      </p>
    </SectionCard>
  );
}
