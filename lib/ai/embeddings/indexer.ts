import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEmbeddingProvider } from './index';
import { productToText, projectToText, faqToText } from './serializers';

const BATCH_SIZE = 16;

export interface ReindexResult {
  provider: string;
  products: number;
  projects: number;
  faqs: number;
  errors: number;
  skipped: boolean;
}

export async function reindexAll(): Promise<ReindexResult> {
  const provider = getEmbeddingProvider();
  if (provider.slug === 'null') {
    return { provider: provider.slug, products: 0, projects: 0, faqs: 0, errors: 0, skipped: true };
  }
  const sb = createAdminClient();
  let products = 0;
  let projects = 0;
  let faqs = 0;
  let errors = 0;

  // PRODUCTS
  const { data: prods } = await sb
    .from('products')
    .select('id,name,brand,price,warranty_years,short_description,description');
  const prodList = (prods ?? []) as Array<Record<string, unknown>>;
  for (let i = 0; i < prodList.length; i += BATCH_SIZE) {
    const slice = prodList.slice(i, i + BATCH_SIZE);
    const texts = slice.map((r) =>
      productToText({
        name: r.name as string,
        brand: (r.brand as string | null) ?? null,
        price: Number(r.price),
        warrantyYears: (r.warranty_years as number | null) ?? null,
        shortDescription: (r.short_description as string | null) ?? null,
        description: (r.description as string | null) ?? null,
        category: null,
      }),
    );
    const vectors = await provider.embedBatch(texts);
    for (let j = 0; j < slice.length; j++) {
      const v = vectors[j];
      const r = slice[j];
      const txt = texts[j];
      if (!v || !r || !txt) {
        errors++;
        continue;
      }
      const { error } = await sb.from('embeddings').upsert(
        {
          doc_type: 'product',
          doc_id: r.id as string,
          content: txt,
          embedding: v,
          metadata: { name: r.name },
        },
        { onConflict: 'doc_type,doc_id' },
      );
      if (error) {
        console.error('[indexer] product upsert failed', { id: r.id, error });
        errors++;
      } else {
        products++;
      }
    }
  }

  // PROJECTS
  const { data: projs } = await sb
    .from('projects')
    .select('id,title,type,location,capacity_kwp,description');
  const projList = (projs ?? []) as Array<Record<string, unknown>>;
  for (let i = 0; i < projList.length; i += BATCH_SIZE) {
    const slice = projList.slice(i, i + BATCH_SIZE);
    const texts = slice.map((r) =>
      projectToText({
        title: r.title as string,
        type: r.type as 'konut' | 'ticari' | 'tarim',
        location: r.location as string,
        capacityKwp: Number(r.capacity_kwp),
        description: (r.description as string | null) ?? null,
      }),
    );
    const vectors = await provider.embedBatch(texts);
    for (let j = 0; j < slice.length; j++) {
      const v = vectors[j];
      const r = slice[j];
      const txt = texts[j];
      if (!v || !r || !txt) {
        errors++;
        continue;
      }
      const { error } = await sb.from('embeddings').upsert(
        {
          doc_type: 'project',
          doc_id: r.id as string,
          content: txt,
          embedding: v,
          metadata: { title: r.title },
        },
        { onConflict: 'doc_type,doc_id' },
      );
      if (error) {
        console.error('[indexer] project upsert failed', { id: r.id, error });
        errors++;
      } else {
        projects++;
      }
    }
  }

  // FAQS
  const { data: fqs } = await sb.from('faqs').select('id,question,answer,category');
  const fqList = (fqs ?? []) as Array<Record<string, unknown>>;
  for (let i = 0; i < fqList.length; i += BATCH_SIZE) {
    const slice = fqList.slice(i, i + BATCH_SIZE);
    const texts = slice.map((r) =>
      faqToText({
        question: r.question as string,
        answer: r.answer as string,
        category: r.category as string,
      }),
    );
    const vectors = await provider.embedBatch(texts);
    for (let j = 0; j < slice.length; j++) {
      const v = vectors[j];
      const r = slice[j];
      const txt = texts[j];
      if (!v || !r || !txt) {
        errors++;
        continue;
      }
      const { error } = await sb.from('embeddings').upsert(
        {
          doc_type: 'faq',
          doc_id: r.id as string,
          content: txt,
          embedding: v,
          metadata: { question: r.question },
        },
        { onConflict: 'doc_type,doc_id' },
      );
      if (error) {
        console.error('[indexer] faq upsert failed', { id: r.id, error });
        errors++;
      } else {
        faqs++;
      }
    }
  }

  return { provider: provider.slug, products, projects, faqs, errors, skipped: false };
}
