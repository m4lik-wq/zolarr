import { describe, it, expect } from 'vitest';
import { quoteStatusEmail } from '@/lib/email/templates/quote-status';

describe('quoteStatusEmail', () => {
  const base = {
    quoteNumber: 'ZQT-X',
    contactName: 'Ali Yılmaz',
    oldStatus: 'new' as const,
    newStatus: 'contacted' as const,
    adminNotes: null,
  };
  it('subject reflects status change', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'won' });
    expect(e.subject.toLowerCase()).toMatch(/teklif|teşekkür|hoş/);
  });
  it('won status uses positive language', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'won' });
    expect(e.html.toLowerCase()).toMatch(/teşekkür|kazandık|hoş/);
  });
  it('lost status is empathetic', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'lost' });
    expect(e.html.toLowerCase()).toMatch(/değerlendir|tekrar|gelemedik/);
  });
  it('quoted status mentions notes when provided', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'quoted', adminNotes: 'Özel indirim uyguladık' });
    expect(e.html).toContain('Özel indirim');
  });
  it('greets by first name', () => {
    const e = quoteStatusEmail({ ...base, newStatus: 'contacted' });
    expect(e.html).toContain('Ali');
  });
});
