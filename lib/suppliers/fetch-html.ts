import 'server-only';
import * as cheerio from 'cheerio';

const USER_AGENT = 'ZolarrBot/1.0 (+https://zolarr.com)';
const TIMEOUT_MS = 12_000;

export type FetchHtmlResult =
  | { ok: true; html: cheerio.CheerioAPI; status: number }
  | { ok: false; error: string };

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.5',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    return { ok: true, html: cheerio.load(text), status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  } finally {
    clearTimeout(timer);
  }
}
