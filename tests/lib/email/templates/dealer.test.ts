import { describe, it, expect } from 'vitest';
import { dealerAdminEmail, dealerApplicantEmail } from '@/lib/email/templates/dealer';

const sample = {
  applicationNumber: 'ZDA-20260507-CD34',
  companyName: 'Güneş A.Ş.',
  contactName: 'Mehmet Demir',
  contactEmail: 'mehmet@gunes.com',
  contactPhone: '+90 555 222 33 44',
  serviceCategories: ['Kurulum', 'Bakım'],
  serviceAreas: ['İzmir', 'Aydın'],
};

describe('dealerAdminEmail', () => {
  it('subject contains application number', () => {
    const e = dealerAdminEmail(sample);
    expect(e.subject).toContain('ZDA-20260507-CD34');
  });
  it('html lists services and areas', () => {
    const e = dealerAdminEmail(sample);
    expect(e.html).toContain('Kurulum');
    expect(e.html).toContain('İzmir');
  });
});

describe('dealerApplicantEmail', () => {
  it('greets the contact person', () => {
    const e = dealerApplicantEmail(sample);
    expect(e.html).toContain('Mehmet');
  });
  it('mentions company name and application number', () => {
    const e = dealerApplicantEmail(sample);
    expect(e.html).toContain('Güneş A.Ş.');
    expect(e.html).toContain('ZDA-20260507-CD34');
  });
});
