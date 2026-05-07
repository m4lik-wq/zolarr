import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchHtml } from './fetch-html';
import { getAdapter } from './registry';

const PRICE_DIFF_THRESHOLD = 0.05; // 5%

export interface SyncChange {
  productId: string;
  type: 'PRICE_INCREASE' | 'PRICE_DECREASE' | 'OUT_OF_STOCK' | 'BACK_IN_STOCK' | 'ERROR';
  oldPrice: number | null;
  newPrice: number | null;
  oldStock: number | null;
  newStock: number | null;
  message?: string;
}

export interface SyncResult {
  supplierId: string;
  total: number;
  updated: number;
  alerts: number;
  errors: number;
  changes: SyncChange[];
}

export async function syncSupplier(supplierId: string): Promise<SyncResult> {
  const sb = createAdminClient();

  const supplierRes = await sb
    .from('suppliers')
    .select('id,adapter_slug,enabled')
    .eq('id', supplierId)
    .maybeSingle();
  const supplier = supplierRes.data as
    | { id: string; adapter_slug: string; enabled: boolean }
    | null;
  if (!supplier) {
    return { supplierId, total: 0, updated: 0, alerts: 0, errors: 1, changes: [] };
  }

  const adapter = getAdapter(supplier.adapter_slug);
  if (!adapter) {
    await sb
      .from('suppliers')
      .update({
        last_sync_error: `Bilinmeyen adapter: ${supplier.adapter_slug}`,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', supplierId);
    return { supplierId, total: 0, updated: 0, alerts: 0, errors: 1, changes: [] };
  }

  const productsRes = await sb
    .from('supplier_products')
    .select('id,product_id,supplier_url,last_price,last_stock')
    .eq('supplier_id', supplierId);
  const items = ((productsRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    productId: r.product_id as string,
    supplierUrl: r.supplier_url as string,
    lastPrice: (r.last_price as number | null) ?? null,
    lastStock: (r.last_stock as number | null) ?? null,
  }));

  let updated = 0;
  let alerts = 0;
  let errors = 0;
  const changes: SyncChange[] = [];

  for (const item of items) {
    const fetched = await fetchHtml(item.supplierUrl);
    if (!fetched.ok) {
      errors++;
      changes.push({
        productId: item.productId,
        type: 'ERROR',
        oldPrice: item.lastPrice,
        newPrice: null,
        oldStock: item.lastStock,
        newStock: null,
        message: fetched.error,
      });
      await sb
        .from('supplier_products')
        .update({ last_error: fetched.error, last_synced_at: new Date().toISOString() })
        .eq('id', item.id);
      continue;
    }

    const parsed = adapter.parseProduct(fetched.html);
    if (!parsed) {
      errors++;
      changes.push({
        productId: item.productId,
        type: 'ERROR',
        oldPrice: item.lastPrice,
        newPrice: null,
        oldStock: item.lastStock,
        newStock: null,
        message: 'Adapter parse başarısız (selector kırılmış olabilir)',
      });
      await sb
        .from('supplier_products')
        .update({ last_error: 'Parse failed', last_synced_at: new Date().toISOString() })
        .eq('id', item.id);
      continue;
    }

    const oldPrice = item.lastPrice;
    const oldStock = item.lastStock;
    const newPrice = parsed.price;
    const newStock = parsed.stock;

    let priceChange: 'PRICE_INCREASE' | 'PRICE_DECREASE' | null = null;
    if (oldPrice !== null && oldPrice > 0) {
      const ratio = (newPrice - oldPrice) / oldPrice;
      if (ratio >= PRICE_DIFF_THRESHOLD) priceChange = 'PRICE_INCREASE';
      else if (ratio <= -PRICE_DIFF_THRESHOLD) priceChange = 'PRICE_DECREASE';
    }

    let stockOut = false;
    let backInStock = false;
    if ((oldStock ?? 0) > 0 && newStock === 0) stockOut = true;
    else if ((oldStock ?? 0) === 0 && newStock > 0) backInStock = true;

    if (priceChange) {
      alerts++;
      await sb.from('notifications').insert({
        type: priceChange,
        payload: {
          supplier_id: supplierId,
          product_id: item.productId,
          old_price: oldPrice,
          new_price: newPrice,
        },
      });
      changes.push({
        productId: item.productId,
        type: priceChange,
        oldPrice,
        newPrice,
        oldStock,
        newStock,
      });
    }

    if (stockOut) {
      alerts++;
      await sb.from('notifications').insert({
        type: 'OUT_OF_STOCK',
        payload: { supplier_id: supplierId, product_id: item.productId },
      });
      changes.push({
        productId: item.productId,
        type: 'OUT_OF_STOCK',
        oldPrice,
        newPrice,
        oldStock,
        newStock,
      });
    } else if (backInStock) {
      // Mevcut stock_alerts sistemi ürün düzenlemesinde tetikleniyor;
      // burada ek notification yaratmıyoruz, sadece changes'e ekliyoruz.
      changes.push({
        productId: item.productId,
        type: 'BACK_IN_STOCK',
        oldPrice,
        newPrice,
        oldStock,
        newStock,
      });
    }

    await sb
      .from('supplier_products')
      .update({
        last_price: newPrice,
        last_stock: newStock,
        last_synced_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', item.id);
    updated++;
  }

  await sb
    .from('suppliers')
    .update({
      last_synced_at: new Date().toISOString(),
      last_sync_error: errors > 0 ? `${errors} ürün hatalı` : null,
    })
    .eq('id', supplierId);

  return { supplierId, total: items.length, updated, alerts, errors, changes };
}
