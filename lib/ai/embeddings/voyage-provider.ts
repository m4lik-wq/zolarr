import 'server-only';
import type { EmbeddingProvider } from './provider';

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';
const MODEL = 'voyage-2';

async function callVoyage(texts: string[]): Promise<Array<number[] | null>> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) return texts.map(() => null);
  if (texts.length === 0) return [];
  try {
    const res = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ input: texts, model: MODEL }),
    });
    if (!res.ok) {
      console.error('[voyage] HTTP', res.status, await res.text());
      return texts.map(() => null);
    }
    const json = (await res.json()) as { data?: Array<{ embedding: number[] }> };
    return texts.map((_, i) => json.data?.[i]?.embedding ?? null);
  } catch (e) {
    console.error('[voyage] threw', e);
    return texts.map(() => null);
  }
}

export const voyageProvider: EmbeddingProvider = {
  slug: 'voyage',
  dimensions: 1024,
  async embed(text) {
    const [r] = await callVoyage([text]);
    return r ?? null;
  },
  async embedBatch(texts) {
    return callVoyage(texts);
  },
};
