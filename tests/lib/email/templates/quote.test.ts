import { describe, it, expect } from 'vitest';
import { quoteAdminEmail, quoteCustomerEmail } from '@/lib/email/templates/quote';

const sample = {
  quoteNumber: 'ZQT-20260507-AB12',
  contactName: 'Ali Yılmaz',
  contactEmail: 'ali@example.com',
  contactPhone: '+90 555 123 45 67',
  city: 'İstanbul',
  district: 'Beşiktaş',
  installationLocation: 'Çatı',
  estimatedKwp: 5.4,
};

describe('quoteAdminEmail', () => {
  it('returns subject containing quote number', () => {
    const e = quoteAdminEmail(sample);
    expect(e.subject).toContain('ZQT-20260507-AB12');
    expect(e.subject.toLowerCase()).toContain('teklif');
  });
  it('html includes customer name and contact info', () => {
    const e = quoteAdminEmail(sample);
    expect(e.html).toContain('Ali Yılmaz');
    expect(e.html).toContain('ali@example.com');
    expect(e.html).toContain('İstanbul');
  });
});

describe('quoteCustomerEmail', () => {
  it('subject thanks the customer in Turkish', () => {
    const e = quoteCustomerEmail(sample);
    expect(e.subject.toLowerCase()).toContain('teklif');
  });
  it('html greets by first name', () => {
    const e = quoteCustomerEmail(sample);
    expect(e.html).toContain('Ali');
  });
  it('html mentions the quote number', () => {
    const e = quoteCustomerEmail(sample);
    expect(e.html).toContain('ZQT-20260507-AB12');
  });
});
