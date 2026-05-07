// scripts/qa/resolve-ids.ts
import { Client } from 'pg';
import type { SampleTable, IdType } from './routes';

const TABLES: SampleTable[] = [
  'products',
  'projects',
  'faqs',
  'categories',
  'quotes',
  'dealer_applications',
  'contact_messages',
  'profiles',
  'suppliers',
];

export interface SampleIds {
  productsSlug: string | null;
  productsId: string | null;
  projectsSlug: string | null;
  projectsId: string | null;
  faqsSlug: string | null;
  faqsId: string | null;
  categoriesSlug: string | null;
  categoriesId: string | null;
  quotesId: string | null;
  dealer_applicationsId: string | null;
  contact_messagesId: string | null;
  profilesId: string | null;
  suppliersId: string | null;
}

export async function resolveSampleIds(): Promise<SampleIds> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const result = {} as Record<string, string | null>;
  for (const table of TABLES) {
    const hasSlug = ['products', 'projects', 'faqs', 'categories'].includes(table);
    try {
      // Try id always
      const idRes = await client.query(`select id::text as v from public.${table} limit 1`);
      result[`${table}Id`] = (idRes.rows[0]?.v as string | undefined) ?? null;
    } catch {
      result[`${table}Id`] = null;
    }
    if (hasSlug) {
      try {
        const slugRes = await client.query(`select slug as v from public.${table} limit 1`);
        result[`${table}Slug`] = (slugRes.rows[0]?.v as string | undefined) ?? null;
      } catch {
        result[`${table}Slug`] = null;
      }
    }
  }
  await client.end();
  return result as unknown as SampleIds;
}

export function fillRoute(
  template: string,
  ids: SampleIds,
  idFrom: SampleTable | undefined,
  idType: IdType,
): string | null {
  if (!template.includes('[')) return template;
  if (!idFrom) return null;
  const key = `${idFrom}${idType === 'slug' ? 'Slug' : 'Id'}` as keyof SampleIds;
  const value = ids[key];
  if (!value) return null;
  return template.replace(/\[(slug|id)\]/, value);
}
