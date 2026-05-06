import { describe, it, expect } from 'vitest';
import { formatTry, calcDiscountPercent, lineTotal } from '@/lib/utils/price';

describe('price utils', () => {
  it('formatTry formats integer TRY without decimals', () => {
    expect(formatTry(6900)).toMatch(/6\.900/);
  });

  it('calcDiscountPercent returns null when discount missing', () => {
    expect(calcDiscountPercent(1000, null)).toBeNull();
  });

  it('calcDiscountPercent rounds correctly', () => {
    expect(calcDiscountPercent(1000, 850)).toBe(15);
  });

  it('lineTotal multiplies', () => {
    expect(lineTotal(2500, 3)).toBe(7500);
  });
});
