import { describe, it, expect } from 'vitest';
import { signUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/email/unsubscribe';

describe('unsubscribe tokens', () => {
  const userId = '11111111-1111-1111-1111-111111111111';
  const secret = 'abc123';
  const category = 'marketing';

  it('signs and verifies a valid token', () => {
    const token = signUnsubscribeToken(userId, category, secret);
    const result = verifyUnsubscribeToken(token, secret);
    expect(result).toEqual({ ok: true, userId, category });
  });
  it('rejects token with wrong secret', () => {
    const token = signUnsubscribeToken(userId, category, secret);
    expect(verifyUnsubscribeToken(token, 'wrong').ok).toBe(false);
  });
  it('rejects malformed token', () => {
    expect(verifyUnsubscribeToken('not-a-token', secret).ok).toBe(false);
  });
  it('rejects empty token', () => {
    expect(verifyUnsubscribeToken('', secret).ok).toBe(false);
  });
  it('produces different tokens for different categories', () => {
    const t1 = signUnsubscribeToken(userId, 'marketing', secret);
    const t2 = signUnsubscribeToken(userId, 'stock_alerts', secret);
    expect(t1).not.toBe(t2);
  });
});
