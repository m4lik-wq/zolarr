import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { FAQ_MOCK } from '@/lib/data/faq-mock';

export function FaqAccordion() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-16" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-3 font-display text-3xl font-bold sm:text-4xl">
        Sık sorulan sorular
      </h2>
      <p className="mb-8 text-[var(--color-text-muted)]">
        En çok merak edilen 5 başlık. Daha fazlası için <Link className="text-[var(--color-brand)] underline" href="/sss">SSS sayfası</Link>.
      </p>
      <Accordion type="single" collapsible className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
        {FAQ_MOCK.map((q, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{q.question}</AccordionTrigger>
            <AccordionContent>{q.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-6 text-center">
        <Button asChild variant="secondary">
          <Link href="/sss">
            Tüm sorular
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
