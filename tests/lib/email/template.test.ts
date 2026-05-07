import { describe, it, expect } from 'vitest';
import { renderEmail } from '@/lib/email/template';

describe('renderEmail', () => {
  it('wraps content in HTML doctype + head', () => {
    const html = renderEmail({ title: 'Test', body: '<p>İçerik</p>' });
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toMatch(/<title>Test<\/title>/);
    expect(html).toMatch(/<meta charset=/i);
  });

  it('includes Zolarr brand header', () => {
    const html = renderEmail({ title: 'X', body: '<p>X</p>' });
    expect(html).toContain('Zolarr');
  });

  it('includes footer with KVKK link', () => {
    const html = renderEmail({ title: 'X', body: '<p>X</p>' });
    expect(html).toMatch(/kvkk|gizlilik/i);
  });

  it('includes user-provided body verbatim', () => {
    const html = renderEmail({ title: 'X', body: '<p>SPECIAL_TOKEN</p>' });
    expect(html).toContain('SPECIAL_TOKEN');
  });
});
