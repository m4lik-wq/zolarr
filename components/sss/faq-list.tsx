'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Faq } from '@/lib/db/types';

export function FaqList({ items }: { items: Faq[] }) {
  if (items.length === 0) {
    return <p className="text-[var(--color-text-muted)]">Sorunuz bulunamadı. Aramayı değiştirip tekrar deneyin.</p>;
  }
  return (
    <Accordion.Root type="multiple" className="divide-y divide-[var(--color-border-glass)]">
      {items.map((f) => (
        <Accordion.Item key={f.id} value={f.id}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left font-medium">
              {f.question}
              <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-4 prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{f.answer}</ReactMarkdown>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
