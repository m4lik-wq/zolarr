import { cn } from '@/lib/utils';

const COLORS: Record<string, string> = {
  new: 'bg-[var(--color-brand)]/15 text-[var(--color-brand)]',
  contacted: 'bg-blue-500/15 text-blue-400',
  quoted: 'bg-yellow-500/15 text-yellow-500',
  won: 'bg-green-500/15 text-green-500',
  lost: 'bg-red-500/15 text-red-400',
  reviewing: 'bg-yellow-500/15 text-yellow-500',
  approved: 'bg-green-500/15 text-green-500',
  rejected: 'bg-red-500/15 text-red-400',
  read: 'bg-blue-500/15 text-blue-400',
  replied: 'bg-green-500/15 text-green-500',
  archived: 'bg-gray-500/15 text-gray-400',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium',
        COLORS[status] ?? 'bg-gray-500/15 text-gray-400',
      )}
    >
      {label}
    </span>
  );
}
