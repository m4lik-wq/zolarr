import type { Faq } from '../types';

type Category = Faq['category'];

export type FaqGroups = Partial<Record<Category, Faq[]>>;

export function groupByCategory(faqs: Faq[]): FaqGroups {
  const out: FaqGroups = {};
  const sorted = [...faqs].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const f of sorted) {
    const arr = out[f.category] ?? [];
    arr.push(f);
    out[f.category] = arr;
  }
  return out;
}

export function searchFaqs(faqs: Faq[], query: string): Faq[] {
  const q = query.trim().toLocaleLowerCase('tr-TR');
  if (!q) return faqs;
  return faqs.filter((f) => {
    const hay = `${f.question} ${f.answer}`.toLocaleLowerCase('tr-TR');
    return hay.includes(q);
  });
}

export function mapFaqRow(row: {
  id: string;
  question: string;
  answer: string;
  category: Category;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}): Faq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
