'use client';

import * as React from 'react';
import { FaqSearch } from './faq-search';
import { FaqCategoryTabs, type FaqFilter } from './faq-category-tabs';
import { FaqList } from './faq-list';
import { searchFaqs } from '@/lib/db/queries/faqs-helpers';
import type { Faq } from '@/lib/db/types';

export function SssClient({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<FaqFilter>('all');

  const byCategory = category === 'all' ? faqs : faqs.filter((f) => f.category === category);
  const filtered = searchFaqs(byCategory, query);

  return (
    <div className="space-y-6">
      <FaqSearch value={query} onChange={setQuery} />
      <FaqCategoryTabs value={category} onChange={setCategory} />
      <FaqList items={filtered} />
    </div>
  );
}
