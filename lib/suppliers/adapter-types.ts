import type * as cheerio from 'cheerio';

export interface ParsedProduct {
  price: number;
  stock: number; // 0 = out of stock; positive = in stock
}

export interface SupplierAdapter {
  slug: string;
  displayName: string;
  parseProduct(html: cheerio.CheerioAPI): ParsedProduct | null;
}
