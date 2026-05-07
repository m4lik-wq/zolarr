import type { SupplierAdapter } from './adapter-types';
import { exampleAdapter } from './adapters/example';

const REGISTRY: Record<string, SupplierAdapter> = {
  [exampleAdapter.slug]: exampleAdapter,
};

export function getAdapter(slug: string): SupplierAdapter | null {
  return REGISTRY[slug] ?? null;
}

export function listAdapters(): SupplierAdapter[] {
  return Object.values(REGISTRY);
}
