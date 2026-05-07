import type { SupplierAdapter, ParsedProduct } from '../adapter-types';

function parseTurkishNumber(s: string): number | null {
  // "12.500,00 TL" → 12500.00
  const cleaned = s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export const exampleAdapter: SupplierAdapter = {
  slug: 'example',
  displayName: 'Example Supplier (test)',
  parseProduct(html): ParsedProduct | null {
    const priceRaw = html('.product-price').text().trim();
    const stockRaw = html('.product-stock').attr('data-stock');
    if (!priceRaw || stockRaw === undefined) return null;
    const price = parseTurkishNumber(priceRaw);
    const stock = Number(stockRaw);
    if (price === null || !Number.isFinite(stock)) return null;
    return { price, stock };
  },
};
