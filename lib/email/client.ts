import 'server-only';
import { Resend } from 'resend';

let cached: Resend | null = null;

export function getResendClient(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}
