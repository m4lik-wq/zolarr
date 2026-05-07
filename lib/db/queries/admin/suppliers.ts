import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import type { Supplier, SupplierProduct } from '@/lib/db/types';

function mapSupplier(r: Record<string, unknown>): Supplier {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    baseUrl: (r.base_url as string | null) ?? null,
    adapterSlug: r.adapter_slug as string,
    enabled: r.enabled as boolean,
    lastSyncedAt: (r.last_synced_at as string | null) ?? null,
    lastSyncError: (r.last_sync_error as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

function mapSupplierProduct(r: Record<string, unknown>): SupplierProduct {
  return {
    id: r.id as string,
    supplierId: r.supplier_id as string,
    productId: r.product_id as string,
    supplierUrl: r.supplier_url as string,
    lastPrice:
      r.last_price !== null && r.last_price !== undefined ? Number(r.last_price) : null,
    lastStock: (r.last_stock as number | null) ?? null,
    lastSyncedAt: (r.last_synced_at as string | null) ?? null,
    lastError: (r.last_error as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

export async function listSuppliers(): Promise<Supplier[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from('suppliers').select('*').order('name');
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapSupplier);
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb.from('suppliers').select('*').eq('id', id).maybeSingle();
  return data ? mapSupplier(data as Record<string, unknown>) : null;
}

export async function listSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data } = await sb
    .from('supplier_products')
    .select('*')
    .eq('supplier_id', supplierId);
  return ((data ?? []) as Array<Record<string, unknown>>).map(mapSupplierProduct);
}
