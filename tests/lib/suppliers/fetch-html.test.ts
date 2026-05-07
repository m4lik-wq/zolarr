import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHtml } from '@/lib/suppliers/fetch-html';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('fetchHtml', () => {
  it('returns cheerio root for 200 response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '<html><body><h1>Hello</h1></body></html>',
    });
    const result = await fetchHtml('https://example.com/x');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html('h1').text()).toBe('Hello');
    }
  });

  it('sets Zolarr User-Agent', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: async () => '<html></html>' });
    await fetchHtml('https://example.com/x');
    const callArgs = fetchMock.mock.calls[0]?.[1] as { headers?: Record<string, string> };
    expect(callArgs?.headers?.['User-Agent']).toMatch(/ZolarrBot/);
  });

  it('returns ok:false for 404', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404, text: async () => '' });
    const result = await fetchHtml('https://example.com/missing');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/404/);
    }
  });

  it('returns ok:false on fetch throw', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await fetchHtml('https://example.com/x');
    expect(result.ok).toBe(false);
  });
});
