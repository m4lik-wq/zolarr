'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: Props) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <Button
        variant="icon"
        size="icon"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Önceki sayfa"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-mono text-sm">
        {page} / {last}
      </span>
      <Button
        variant="icon"
        size="icon"
        disabled={page >= last}
        onClick={() => onChange(page + 1)}
        aria-label="Sonraki sayfa"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
