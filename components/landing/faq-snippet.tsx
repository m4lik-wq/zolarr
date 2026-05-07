import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { listFaqs } from '@/lib/db/queries/faqs';

export async function FaqSnippet() {
  const faqs = await listFaqs();
  const popular = faqs.slice(0, 5);
  if (popular.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-elevated)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-gold)] font-mono mb-4">
              ── SSS
            </p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.1] mb-6">
              Sıkça merak{' '}
              <span className="italic text-[var(--color-brand)]">edilenler</span>.
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8">
              Cevabını burada bulamadığınız soruları doğrudan bize iletebilirsiniz.
            </p>
            <Link
              href="/sss"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-brand)] hover:underline"
            >
              Tüm soruları gör <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Accordion.Root type="single" collapsible className="space-y-3">
            {popular.map((f) => (
              <Accordion.Item
                key={f.id}
                value={f.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-base)] overflow-hidden"
              >
                <Accordion.Header className="flex">
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg hover:bg-[var(--color-bg-overlay)] transition-colors">
                    <span>{f.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="px-5 pb-5 text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                    {f.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}
