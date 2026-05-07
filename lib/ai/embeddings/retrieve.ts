import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEmbeddingProvider } from './index';

export interface RetrievedChunk {
  docType: 'product' | 'project' | 'faq';
  docId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function retrieveContext(query: string, k = 5): Promise<RetrievedChunk[]> {
  const provider = getEmbeddingProvider();
  if (provider.slug === 'null') return [];
  if (!query.trim()) return [];
  const vec = await provider.embed(query);
  if (!vec) return [];
  const sb = createAdminClient();
  const { data, error } = await sb.rpc('match_embeddings', { query_embedding: vec, match_count: k });
  if (error || !data) {
    if (error) console.error('[retrieve] match_embeddings RPC failed', error);
    return [];
  }
  return ((data as Array<Record<string, unknown>>) ?? []).map((r) => ({
    docType: r.doc_type as 'product' | 'project' | 'faq',
    docId: r.doc_id as string,
    content: r.content as string,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    similarity: Number(r.similarity),
  }));
}
