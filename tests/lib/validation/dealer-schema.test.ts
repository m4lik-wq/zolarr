import { describe, it, expect } from 'vitest';
import { dealerFullSchema } from '@/lib/validation/dealer-schema';

const valid = {
  companyName: 'Acme Solar A.Ş.',
  taxOffice: 'Beşiktaş',
  taxNumber: '1234567890',
  companyAddress: 'Adres metni',
  contactName: 'Veli Demir',
  contactRole: 'Genel Müdür',
  contactPhone: '+905551112233',
  contactEmail: 'a@b.com',
  serviceCategories: ['panel', 'invertor'],
  serviceAreas: ['İstanbul', 'Ankara'],
  experienceYears: 5,
  documentUrls: [],
  kvkkAccepted: true,
};

describe('dealerFullSchema', () => {
  it('accepts valid', () => expect(dealerFullSchema.safeParse(valid).success).toBe(true));
  it('rejects empty company', () => expect(dealerFullSchema.safeParse({ ...valid, companyName: '' }).success).toBe(false));
  it('rejects invalid email', () => expect(dealerFullSchema.safeParse({ ...valid, contactEmail: 'x' }).success).toBe(false));
  it('rejects kvkk false', () => expect(dealerFullSchema.safeParse({ ...valid, kvkkAccepted: false }).success).toBe(false));
  it('rejects negative experience', () => expect(dealerFullSchema.safeParse({ ...valid, experienceYears: -1 }).success).toBe(false));
});
