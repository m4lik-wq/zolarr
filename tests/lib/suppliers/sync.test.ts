import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetchHtml
const fetchHtmlMock = vi.fn();
vi.mock('@/lib/suppliers/fetch-html', () => ({
  fetchHtml: fetchHtmlMock,
}));

// Mock supabase admin client with chainable query builder
const insertMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: fromMock }),
}));

// Helper to build chainable from() responses
function setupQueryBuilders(opts: {
  supplier?: Record<string, unknown> | null;
  supplierProducts?: Array<Record<string, unknown>>;
}) {
  fromMock.mockImplementation((table: string) => {
    if (table === 'suppliers') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: opts.supplier ?? null }),
          }),
        }),
        update: () => ({ eq: async () => ({ error: null }) }),
      };
    }
    if (table === 'supplier_products') {
      return {
        select: () => ({
          eq: async () => ({ data: opts.supplierProducts ?? [] }),
        }),
        update: () => ({ eq: async () => ({ error: null }) }),
      };
    }
    if (table === 'notifications') {
      return {
        insert: async (...args: unknown[]) => {
          insertMock(...args);
          return { error: null };
        },
      };
    }
    return {};
  });
}

beforeEach(() => {
  fetchHtmlMock.mockReset();
  fromMock.mockReset();
  insertMock.mockReset();
});

describe('syncSupplier', () => {
  it('returns errors=1 when supplier not found', async () => {
    setupQueryBuilders({ supplier: null });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('missing-id');
    expect(r.errors).toBe(1);
    expect(r.total).toBe(0);
  });

  it('returns errors=1 when adapter not registered', async () => {
    setupQueryBuilders({
      supplier: { id: 'sup-1', adapter_slug: 'nonexistent', enabled: true },
    });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('sup-1');
    expect(r.errors).toBe(1);
  });

  it('creates PRICE_INCREASE notification when price up >5%', async () => {
    setupQueryBuilders({
      supplier: { id: 'sup-1', adapter_slug: 'example', enabled: true },
      supplierProducts: [
        { id: 'sp-1', product_id: 'prod-1', supplier_url: 'https://x.com/a', last_price: 100, last_stock: 5 },
      ],
    });
    const cheerio = await import('cheerio');
    fetchHtmlMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      html: cheerio.load('<div class="product-price">110,00 TL</div><div class="product-stock" data-stock="5"></div>'),
    });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('sup-1');
    expect(r.alerts).toBe(1);
    expect(r.changes[0]?.type).toBe('PRICE_INCREASE');
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      type: 'PRICE_INCREASE',
    }));
  });

  it('creates PRICE_DECREASE notification when price down >5%', async () => {
    setupQueryBuilders({
      supplier: { id: 'sup-1', adapter_slug: 'example', enabled: true },
      supplierProducts: [
        { id: 'sp-1', product_id: 'prod-1', supplier_url: 'https://x.com/a', last_price: 100, last_stock: 5 },
      ],
    });
    const cheerio = await import('cheerio');
    fetchHtmlMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      html: cheerio.load('<div class="product-price">90,00 TL</div><div class="product-stock" data-stock="5"></div>'),
    });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('sup-1');
    expect(r.changes[0]?.type).toBe('PRICE_DECREASE');
  });

  it('does NOT create notification when price diff <5%', async () => {
    setupQueryBuilders({
      supplier: { id: 'sup-1', adapter_slug: 'example', enabled: true },
      supplierProducts: [
        { id: 'sp-1', product_id: 'prod-1', supplier_url: 'https://x.com/a', last_price: 100, last_stock: 5 },
      ],
    });
    const cheerio = await import('cheerio');
    fetchHtmlMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      html: cheerio.load('<div class="product-price">103,00 TL</div><div class="product-stock" data-stock="5"></div>'),
    });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('sup-1');
    expect(r.alerts).toBe(0);
    expect(r.updated).toBe(1);
  });

  it('creates OUT_OF_STOCK notification when stock 5 to 0', async () => {
    setupQueryBuilders({
      supplier: { id: 'sup-1', adapter_slug: 'example', enabled: true },
      supplierProducts: [
        { id: 'sp-1', product_id: 'prod-1', supplier_url: 'https://x.com/a', last_price: 100, last_stock: 5 },
      ],
    });
    const cheerio = await import('cheerio');
    fetchHtmlMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      html: cheerio.load('<div class="product-price">100,00 TL</div><div class="product-stock" data-stock="0"></div>'),
    });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('sup-1');
    expect(r.changes.some((c) => c.type === 'OUT_OF_STOCK')).toBe(true);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'OUT_OF_STOCK' }));
  });

  it('counts errors when fetchHtml fails', async () => {
    setupQueryBuilders({
      supplier: { id: 'sup-1', adapter_slug: 'example', enabled: true },
      supplierProducts: [
        { id: 'sp-1', product_id: 'prod-1', supplier_url: 'https://x.com/a', last_price: 100, last_stock: 5 },
      ],
    });
    fetchHtmlMock.mockResolvedValueOnce({ ok: false, error: 'HTTP 503' });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('sup-1');
    expect(r.errors).toBe(1);
    expect(r.changes[0]?.type).toBe('ERROR');
  });

  it('counts errors when adapter parse returns null', async () => {
    setupQueryBuilders({
      supplier: { id: 'sup-1', adapter_slug: 'example', enabled: true },
      supplierProducts: [
        { id: 'sp-1', product_id: 'prod-1', supplier_url: 'https://x.com/a', last_price: 100, last_stock: 5 },
      ],
    });
    const cheerio = await import('cheerio');
    fetchHtmlMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      html: cheerio.load('<html><body>Layout changed</body></html>'),
    });
    const { syncSupplier } = await import('@/lib/suppliers/sync');
    const r = await syncSupplier('sup-1');
    expect(r.errors).toBe(1);
    expect(r.changes[0]?.message).toMatch(/parse/i);
  });
});
