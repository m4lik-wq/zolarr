import { describe, it, expect } from 'vitest';
import { groupByCategory, searchFaqs } from '@/lib/db/queries/faqs-helpers';
import type { Faq } from '@/lib/db/types';

function fq(partial: Partial<Faq>): Faq {
  return {
    id: 'x',
    question: 'Soru',
    answer: 'Cevap',
    category: 'genel',
    sortOrder: 0,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
    ...partial,
  };
}

describe('groupByCategory', () => {
  it('groups faqs by category preserving sort_order', () => {
    const faqs = [
      fq({ id: '1', category: 'genel', sortOrder: 20 }),
      fq({ id: '2', category: 'teknik', sortOrder: 10 }),
      fq({ id: '3', category: 'genel', sortOrder: 10 }),
    ];
    const groups = groupByCategory(faqs);
    expect(groups.genel).toHaveLength(2);
    expect(groups.genel?.[0]!.id).toBe('3');
    expect(groups.teknik).toHaveLength(1);
  });

  it('returns empty array for missing category', () => {
    expect(groupByCategory([]).fiyat ?? []).toEqual([]);
  });
});

describe('searchFaqs', () => {
  const faqs = [
    fq({ id: '1', question: 'Geri ödeme süresi ne?', answer: 'cevap' }),
    fq({ id: '2', question: 'Garanti var mı?', answer: 'evet 25 yıl' }),
  ];

  it('returns all when query is empty', () => {
    expect(searchFaqs(faqs, '')).toHaveLength(2);
  });

  it('matches question case-insensitively', () => {
    expect(searchFaqs(faqs, 'GERİ').map((f) => f.id)).toEqual(['1']);
  });

  it('matches answer text', () => {
    expect(searchFaqs(faqs, '25 yıl').map((f) => f.id)).toEqual(['2']);
  });
});
