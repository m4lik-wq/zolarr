import { describe, it, expect } from 'vitest';
import { generateQuoteNumber } from '@/lib/utils/quote-number';

describe('generateQuoteNumber', () => {
  it('starts with prefix and current year', () => {
    const n = generateQuoteNumber('ZQT');
    const year = new Date().getFullYear();
    expect(n.startsWith(`ZQT-${year}-`)).toBe(true);
  });

  it('has 5-char random suffix', () => {
    const n = generateQuoteNumber('ZQT');
    const suffix = n.split('-')[2]!;
    expect(suffix).toHaveLength(5);
    expect(suffix).toMatch(/^[A-Z0-9]{5}$/);
  });

  it('returns unique numbers across calls (high prob)', () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(generateQuoteNumber('ZQT'));
    expect(set.size).toBeGreaterThan(990);
  });

  it('supports ZLR prefix for orders', () => {
    expect(generateQuoteNumber('ZLR')).toMatch(/^ZLR-\d{4}-[A-Z0-9]{5}$/);
  });
});
