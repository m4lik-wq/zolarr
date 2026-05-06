import { describe, it, expect } from 'vitest';
import { generateContactNumber } from '@/lib/utils/contact-number';

describe('generateContactNumber', () => {
  it('starts with MSG- prefix', () => {
    expect(generateContactNumber()).toMatch(/^MSG-/);
  });

  it('includes current year', () => {
    expect(generateContactNumber()).toContain(`-${new Date().getFullYear()}-`);
  });

  it('produces 5-character suffix', () => {
    expect(generateContactNumber()).toMatch(/^MSG-\d{4}-[A-Z2-9]{5}$/);
  });

  it('produces different numbers across calls', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateContactNumber()));
    expect(set.size).toBeGreaterThan(40);
  });
});
