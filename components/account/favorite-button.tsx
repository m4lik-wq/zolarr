'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toggleFavoriteAction } from '@/lib/server-actions/favorites';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  initialFavorited: boolean;
  loggedIn: boolean;
}

export function FavoriteButton({ productId, initialFavorited, loggedIn }: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [pending, setPending] = React.useState(false);
  const [hint, setHint] = React.useState<string | null>(null);

  async function onClick() {
    if (!loggedIn) {
      setHint('Giriş yapın');
      setTimeout(() => router.push(`/giris?next=/magaza`), 800);
      return;
    }
    setPending(true);
    const res = await toggleFavoriteAction(productId);
    setPending(false);
    if (res.ok) setFavorited(res.favorited);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-label={favorited ? 'Favoriden Çıkar' : 'Favoriye Ekle'}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
          favorited
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/40'
        )}
      >
        <Heart className={cn('h-5 w-5', favorited && 'fill-current')} />
      </button>
      {hint && <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>}
    </div>
  );
}
