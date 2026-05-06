import { describe, it, expect } from 'vitest';
import { hashIp, ANON_DAILY_LIMIT } from '@/lib/ai/rate-limit';

describe('rate-limit utils', () => {
  it('hashIp deterministically hashes the same input to the same output', () => {
    expect(hashIp('1.2.3.4')).toBe(hashIp('1.2.3.4'));
  });

  it('hashIp produces different hashes for different IPs', () => {
    expect(hashIp('1.2.3.4')).not.toBe(hashIp('5.6.7.8'));
  });

  it('hashIp output is non-empty hex', () => {
    expect(hashIp('1.2.3.4')).toMatch(/^[a-f0-9]{32,}$/);
  });

  it('exposes ANON_DAILY_LIMIT = 10', () => {
    expect(ANON_DAILY_LIMIT).toBe(10);
  });
});
