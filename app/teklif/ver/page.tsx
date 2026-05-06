import type { Metadata } from 'next';
import { DealerForm } from '@/components/dealer/dealer-form';

export const metadata: Metadata = {
  title: 'Bayi Başvurusu | Zolarr',
  description: 'Zolarr bayi ağına katılmak için başvurun.',
};

export default function TeklifVerPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Bayi Başvurusu</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Zolarr bayi ağına katılmak için aşağıdaki formu doldurun.
        </p>
      </header>
      <DealerForm />
    </div>
  );
}
