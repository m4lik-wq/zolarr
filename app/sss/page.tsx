import type { Metadata } from 'next';
import { listFaqs } from '@/lib/db/queries/faqs';
import { SssClient } from '@/components/sss/sss-client';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular | Zolarr',
  description: 'Güneş enerjisi, teklif süreci, kurulum ve garanti hakkında en çok sorulan sorular.',
};

export const dynamic = 'force-dynamic';

export default async function SssPage() {
  const faqs = await listFaqs();
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Sıkça Sorulan Sorular</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">Aklınıza takılanlara hızlı yanıtlar.</p>
      </header>
      <SssClient faqs={faqs} />
    </div>
  );
}
