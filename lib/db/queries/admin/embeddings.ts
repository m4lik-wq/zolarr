import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';

export interface EmbeddingStats {
  total: number;
  byType: Record<'product' | 'project' | 'faq', number>;
  lastIndexedAt: string | null;
}

export async function getEmbeddingStats(): Promise<EmbeddingStats> {
  await requireAdmin();
  const sb = createAdminClient();
  const [productRes, projectRes, faqRes, latestRes] = await Promise.all([
    sb.from('embeddings').select('*', { count: 'exact', head: true }).eq('doc_type', 'product'),
    sb.from('embeddings').select('*', { count: 'exact', head: true }).eq('doc_type', 'project'),
    sb.from('embeddings').select('*', { count: 'exact', head: true }).eq('doc_type', 'faq'),
    sb
      .from('embeddings')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const product = productRes.count ?? 0;
  const project = projectRes.count ?? 0;
  const faq = faqRes.count ?? 0;
  return {
    total: product + project + faq,
    byType: { product, project, faq },
    lastIndexedAt:
      ((latestRes.data as { created_at?: string } | null)?.created_at) ?? null,
  };
}
