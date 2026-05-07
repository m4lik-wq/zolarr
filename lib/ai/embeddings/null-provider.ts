import type { EmbeddingProvider } from './provider';

export const nullProvider: EmbeddingProvider = {
  slug: 'null',
  dimensions: 1024,
  async embed(): Promise<number[] | null> {
    return null;
  },
  async embedBatch(texts) {
    return texts.map(() => null);
  },
};
