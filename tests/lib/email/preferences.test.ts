import { describe, it, expect } from 'vitest';
import { canReceive } from '@/lib/email/preferences';

describe('canReceive', () => {
  it('returns true for default prefs', () => {
    expect(canReceive({ marketing: true, stock_alerts: true, quote_status: true, dealer_status: true }, 'marketing')).toBe(true);
  });
  it('returns false when category disabled', () => {
    expect(canReceive({ marketing: false, stock_alerts: true, quote_status: true, dealer_status: true }, 'marketing')).toBe(false);
  });
  it('returns true for null prefs (default opt-in)', () => {
    expect(canReceive(null, 'stock_alerts')).toBe(true);
  });
  it('returns true for undefined prefs', () => {
    expect(canReceive(undefined, 'quote_status')).toBe(true);
  });
});
