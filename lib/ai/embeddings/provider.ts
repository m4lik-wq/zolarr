export interface EmbeddingProvider {
  readonly slug: string;
  readonly dimensions: number;
  /** Returns null if provider not configured (e.g., API key missing). */
  embed(text: string): Promise<number[] | null>;
  /** Batch embed; returns array same length as input, with null for failures. */
  embedBatch(texts: string[]): Promise<Array<number[] | null>>;
}
