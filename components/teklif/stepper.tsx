import { cn } from '@/lib/utils';

interface Props {
  current: number;
  total: number;
  className?: string;
}

export function Stepper({ current, total, className }: Props) {
  return (
    <ol
      className={cn('flex items-center justify-between gap-1', className)}
      aria-label={`Adım ${current} / ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const state = idx < current ? 'done' : idx === current ? 'current' : 'todo';
        return (
          <li
            key={idx}
            data-state={state}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border font-mono text-sm transition-colors',
              state === 'done' &&
                'border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-bg-base)]',
              state === 'current' && 'border-[var(--color-brand)] text-[var(--color-brand)]',
              state === 'todo' && 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            )}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {idx}
          </li>
        );
      })}
    </ol>
  );
}
