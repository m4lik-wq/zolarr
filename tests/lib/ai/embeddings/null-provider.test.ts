import { describe, it, expect } from 'vitest';
import { nullProvider } from '@/lib/ai/embeddings/null-provider';

describe('nullProvider', () => {
  it('embed returns null', async () => {
    expect(await nullProvider.embed('test')).toBeNull();
  });
  it('embedBatch returns array of nulls matching input length', async () => {
    const r = await nullProvider.embedBatch(['a', 'b', 'c']);
    expect(r).toEqual([null, null, null]);
  });
  it('embedBatch on empty array returns empty array', async () => {
    expect(await nullProvider.embedBatch([])).toEqual([]);
  });
  it('exposes slug and dimensions', () => {
    expect(nullProvider.slug).toBe('null');
    expect(nullProvider.dimensions).toBe(1024);
  });
});
