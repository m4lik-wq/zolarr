import 'server-only';
import type { EmbeddingProvider } from './provider';
import { nullProvider } from './null-provider';
import { voyageProvider } from './voyage-provider';

export function getEmbeddingProvider(): EmbeddingProvider {
  if (process.env.VOYAGE_API_KEY) return voyageProvider;
  return nullProvider;
}

export type { EmbeddingProvider };
