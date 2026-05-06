const fmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

export function formatTry(value: number): string {
  return fmt.format(value);
}

export function calcDiscountPercent(price: number, discount: number | null): number | null {
  if (discount == null || discount >= price) return null;
  return Math.round(((price - discount) / price) * 100);
}

export function lineTotal(unitPrice: number, qty: number): number {
  return unitPrice * qty;
}

export function effectivePrice(price: number, discount: number | null): number {
  return discount != null && discount < price ? discount : price;
}
