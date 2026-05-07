import { describe, it, expect } from 'vitest';
import { dealerStatusEmail } from '@/lib/email/templates/dealer-status';

describe('dealerStatusEmail', () => {
  const base = {
    applicationNumber: 'ZDA-X',
    contactName: 'Mehmet Demir',
    companyName: 'Güneş A.Ş.',
    newStatus: 'reviewing' as const,
    adminNotes: null,
  };
  it('approved status is celebratory', () => {
    const e = dealerStatusEmail({ ...base, newStatus: 'approved' });
    expect(e.subject.toLowerCase()).toMatch(/onayland|bayi/);
  });
  it('rejected status is polite + includes notes when present', () => {
    const e = dealerStatusEmail({
      ...base,
      newStatus: 'rejected',
      adminNotes: 'Bölge yeterince temsil ediliyor',
    });
    expect(e.html).toContain('Bölge yeterince');
  });
  it('greets by first name + mentions company', () => {
    const e = dealerStatusEmail(base);
    expect(e.html).toContain('Mehmet');
    expect(e.html).toContain('Güneş A.Ş.');
  });
});
