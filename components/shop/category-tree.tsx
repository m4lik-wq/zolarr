import Link from 'next/link';
import type { CategoryNode } from '@/lib/db/types';
import { cn } from '@/lib/utils';

interface Props {
  categories: CategoryNode[];
  activeSlug?: string | null;
}

export function CategoryTree({ categories, activeSlug }: Props) {
  return (
    <nav aria-label="Kategoriler">
      <ul className="space-y-1 text-sm">
        <li>
          <Link
            href="/magaza"
            className={cn(
              'block rounded-xl px-3 py-2 transition-colors',
              !activeSlug
                ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                : 'hover:bg-[var(--color-bg-overlay)]'
            )}
          >
            Tümü
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/magaza?categorySlug=${c.slug}`}
              className={cn(
                'block rounded-xl px-3 py-2 font-medium transition-colors',
                activeSlug === c.slug
                  ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                  : 'hover:bg-[var(--color-bg-overlay)]'
              )}
            >
              {c.name}
            </Link>
            {c.children.length > 0 && (
              <ul className="ml-3 mt-1 space-y-0.5 border-l border-[var(--color-border-glass)] pl-3">
                {c.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/magaza?categorySlug=${child.slug}`}
                      className={cn(
                        'block rounded-xl px-2 py-1 text-xs transition-colors',
                        activeSlug === child.slug
                          ? 'text-[var(--color-brand)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                      )}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
