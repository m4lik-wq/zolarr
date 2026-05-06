import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface StockAlertWithProduct {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  notified: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

interface StockAlertRow {
  id: string;
  product_id: string;
  notified: boolean;
  notified_at: string | null;
  created_at: string;
  product: { slug: string; name: string; images: string[] } | null;
}

export async function listUserStockAlerts(userId: string): Promise<StockAlertWithProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stock_alerts')
    .select('id,product_id,notified,notified_at,created_at,product:products(slug,name,images)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as unknown as StockAlertRow[])
    .filter((r): r is StockAlertRow & { product: NonNullable<StockAlertRow['product']> } => !!r.product)
    .map((r) => ({
      id: r.id,
      productId: r.product_id,
      productSlug: r.product.slug,
      productName: r.product.name,
      productImage: r.product.images[0] ?? null,
      notified: r.notified,
      notifiedAt: r.notified_at,
      createdAt: r.created_at,
    }));
}

export async function hasStockAlert(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stock_alerts')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}
