import { notFound } from 'next/navigation';
import { getAdminFaq } from '@/lib/db/queries/admin/faqs';
import { FaqForm } from '@/components/admin/faq-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SssDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const faq = await getAdminFaq(id);
  if (!faq) notFound();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{faq.question}</h1>
      <FaqForm
        mode="edit"
        initial={{
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          isPublished: faq.isPublished,
        }}
      />
    </div>
  );
}
