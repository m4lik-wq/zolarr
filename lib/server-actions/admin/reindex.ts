'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/server';
import { reindexAll, type ReindexResult } from '@/lib/ai/embeddings/indexer';

export type ReindexActionResult =
  | ({ ok: true } & ReindexResult)
  | { ok: false; error: string };

export async function reindexAction(): Promise<ReindexActionResult> {
  await requireAdmin();
  try {
    const r = await reindexAll();
    revalidatePath('/admin/ai');
    return { ok: true, ...r };
  } catch (e) {
    console.error('[admin] reindexAction failed', e);
    return { ok: false, error: 'Re-index sırasında hata oluştu.' };
  }
}
