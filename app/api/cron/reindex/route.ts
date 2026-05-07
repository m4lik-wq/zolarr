import { NextResponse, type NextRequest } from 'next/server';
import { reindexAll } from '@/lib/ai/embeddings/indexer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await reindexAll();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('[cron] reindex failed', e);
    return NextResponse.json({ ok: false, error: 'Reindex failed' }, { status: 500 });
  }
}
