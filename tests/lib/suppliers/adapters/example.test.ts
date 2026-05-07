import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { exampleAdapter } from '@/lib/suppliers/adapters/example';

const fixturePath = join(process.cwd(), 'tests/fixtures/example-supplier-product.html');
const fixture = readFileSync(fixturePath, 'utf8');

describe('exampleAdapter', () => {
  it('parses price and stock from fixture', () => {
    const $ = cheerio.load(fixture);
    const result = exampleAdapter.parseProduct($);
    expect(result).toEqual({ price: 12500, stock: 7 });
  });

  it('returns null when selectors not found', () => {
    const $ = cheerio.load('<html><body>Nothing</body></html>');
    expect(exampleAdapter.parseProduct($)).toBeNull();
  });

  it('parses Turkish thousand separator correctly', () => {
    const $ = cheerio.load('<div class="product-price">1.250,50 TL</div><div class="product-stock" data-stock="3"></div>');
    expect(exampleAdapter.parseProduct($)).toEqual({ price: 1250.5, stock: 3 });
  });

  it('returns stock 0 when data-stock is "0"', () => {
    const $ = cheerio.load('<div class="product-price">100 TL</div><div class="product-stock" data-stock="0"></div>');
    expect(exampleAdapter.parseProduct($)?.stock).toBe(0);
  });

  it('exposes slug and displayName', () => {
    expect(exampleAdapter.slug).toBe('example');
    expect(exampleAdapter.displayName).toMatch(/Example/i);
  });
});
