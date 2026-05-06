import { describe, it, expect } from 'vitest';
import { quoteFullSchema, applianceSchema } from '@/lib/validation/quote-schema';

describe('quoteFullSchema', () => {
  const valid = {
    contactName: 'Ahmet Yılmaz',
    city: 'İstanbul',
    district: 'Kadıköy',
    installationLocation: 'roof',
    appliances: [],
    description: 'Açıklama metni',
    contactPhone: '+905551234567',
    contactEmail: 'a@b.com',
    contactTimePreference: 'morning',
    kvkkAccepted: true,
  };

  it('accepts valid payload', () => {
    expect(quoteFullSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing name', () => {
    const r = quoteFullSchema.safeParse({ ...valid, contactName: '' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = quoteFullSchema.safeParse({ ...valid, contactEmail: 'not-email' });
    expect(r.success).toBe(false);
  });

  it('rejects kvkk false', () => {
    const r = quoteFullSchema.safeParse({ ...valid, kvkkAccepted: false });
    expect(r.success).toBe(false);
  });

  it('caps description at 2000 chars', () => {
    const long = 'a'.repeat(2001);
    const r = quoteFullSchema.safeParse({ ...valid, description: long });
    expect(r.success).toBe(false);
  });

  it('rejects invalid installation location', () => {
    const r = quoteFullSchema.safeParse({ ...valid, installationLocation: 'invalid' });
    expect(r.success).toBe(false);
  });
});

describe('applianceSchema', () => {
  it('accepts name only', () => {
    expect(applianceSchema.safeParse({ name: 'Buzdolabı' }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(applianceSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('accepts numeric optional fields', () => {
    expect(applianceSchema.safeParse({ name: 'Çamaşır', consumptionKwh: 50, powerW: 200, voltageV: 220 }).success).toBe(true);
  });
});
