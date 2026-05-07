import { describe, it, expect } from 'vitest';
import { welcomeEmail } from '@/lib/email/templates/welcome';

describe('welcomeEmail', () => {
  it('greets the user by name', () => {
    const e = welcomeEmail({ name: 'Ali Yılmaz' });
    expect(e.html).toContain('Ali');
  });
  it('greets gracefully when name missing', () => {
    const e = welcomeEmail({ name: null });
    expect(e.html.toLowerCase()).toMatch(/hoş geldin|merhaba/);
  });
  it('subject is welcoming in Turkish', () => {
    const e = welcomeEmail({ name: 'X' });
    expect(e.subject.toLowerCase()).toMatch(/hoş geldin|zolarr/);
  });
  it('mentions key features (catalog, quote, panel)', () => {
    const e = welcomeEmail({ name: 'X' });
    const lower = e.html.toLowerCase();
    expect(lower).toMatch(/mağaza|katalog|ürün/);
    expect(lower).toMatch(/teklif/);
  });
});
