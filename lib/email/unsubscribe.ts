import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import type { EmailCategory } from './preferences';

export function signUnsubscribeToken(userId: string, category: EmailCategory, secret: string): string {
  const payload = `${userId}:${category}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export type VerifyResult =
  | { ok: true; userId: string; category: EmailCategory }
  | { ok: false };

export function verifyUnsubscribeToken(token: string, secret: string): VerifyResult {
  if (!token) return { ok: false };
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');
    if (parts.length !== 3) return { ok: false };
    const userId = parts[0];
    const category = parts[1];
    const sig = parts[2];
    if (!userId || !category || !sig) return { ok: false };
    const expected = createHmac('sha256', secret).update(`${userId}:${category}`).digest('hex').slice(0, 32);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return { ok: false };
    if (!timingSafeEqual(a, b)) return { ok: false };
    return { ok: true, userId, category: category as EmailCategory };
  } catch {
    return { ok: false };
  }
}
