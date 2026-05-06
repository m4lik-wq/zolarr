import Link from 'next/link';
import { Shield } from 'lucide-react';

interface Props {
  role: 'customer' | 'moderator' | 'assistant' | 'admin';
}

export function AdminLink({ role }: Props) {
  if (role !== 'admin') return null;
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-brand)] hover:bg-[var(--color-bg-overlay)]"
    >
      <Shield className="h-4 w-4" /> Admin
    </Link>
  );
}
